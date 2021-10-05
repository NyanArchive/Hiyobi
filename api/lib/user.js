const db = require("./DB").promise();
const squel = require("squel");
const logger = require("./logger");
const common = require("./common");
const { v4: uuid } = require("uuid");
const crypto = require("crypto");
const IsTorExit = require("istorexit");

module.exports.getUserFromId = async (id) => {
  if (typeof id === "undefined" || !Number.isInteger(id)) {
    throw new Error("invalid userid");
  }
  try {
    const [rows] = await db.query("select * from member where id = ?", id);

    if (rows.length === 0) {
      throw new Error("userid not exists");
    } else {
      return rows[0];
    }
  } catch (e) {
    logger.error(e);
    throw new Error(e);
  }
};

module.exports.getUserFromEmail = async (email) => {
  if (typeof email === "undefined" || email === "") {
    throw new Error("invalid email");
  }
  try {
    const [rows] = await db.query(
      "select * from member where email = ?",
      await this.encryptEmail(email)
    );

    if (rows.length === 0) {
      return null;
    } else {
      return rows[0];
    }
  } catch (e) {
    logger.error(e);
    throw new Error(e);
  }
};

module.exports.createUser = async ({ email, password, name, ip }) => {
  if (typeof email === "undefined" || email === "") {
    return "invalid email";
  }

  if (typeof password === "undefined" || password === "") {
    return "invalid password";
  }

  if (typeof name === "undefined" || name === "") {
    return "invalid name";
  }

  if (typeof ip === "undefined" || ip === "") {
    return "invalid ip";
  }

  email = email.trim();
  name = name.trim();

  // 입력값 검증
  if (!(await this.isEmailUnique(email))) {
    return "등록된 이메일입니다.";
  } else if (!(await this.isNameUnique(name.replace(/\s/g, "")))) {
    return "등록된 닉네임입니다.";
  } else if (!this.isPasswordSuitable(password)) {
    return "등록된 비밀번호입니다.";
  } else if (!(await this.emailDisifyCheck(email))) {
    return "유효한 이메일을 입력해주세요.";
  } else if (await IsTorExit(ip)) {
    return "no tor allowed;";
  }

  if (name.length > 12) {
    return "닉네임은 12자 내로 입력해주세요.";
  }
  if (!/^[가-힣a-zA-Z0-9 ]+$/.test(name)) {
    return "한글, 영문, 숫자를 제외한 문자는 금지됩니다.(자음, 모음만도 금지)";
  }

  // 패스워드 암호화
  const { hash, salt } = await this.encryptPassword(password);

  // 인증메일 코드
  let verifycode = Math.random().toString(36).substr(2);

  while (true) {
    if (await this.isVerifyCodeUnique(verifycode)) {
      break;
    }
    verifycode = Math.random().toString(36).substr(2);
  }

  // DB입력
  const query = squel
    .insert()
    .into("member")
    .set("name", name)
    .set("password", hash)
    .set("salt", salt)
    .set("email", await this.encryptEmail(email))
    .set("verified", 0)
    .set("regdate", common.getTimestamp())
    .set("verifycode", verifycode)
    .toParam();

  const conn = await db.getConnection();

  try {
    await conn.query("START TRANSACTION");
    await conn.query(query.text, query.values);

    // 인증메일 전송
    const MailerClass = require("./mailer");
    const Mailer = new MailerClass();
    await Mailer.sendMail({
      to: email,
      subject: "히요비 인증메일입니다.",
      html: `<a href="https://hiyobi.me/verification/${verifycode}">https://hiyobi.me/verification/${verifycode}</a>로 접속해주시기 바랍니다.`,
    });

    await conn.query("COMMIT");
    await conn.release();

    return true;
  } catch (e) {
    console.error(e);
    logger.error(e);
    await conn.query("ROLLBACK");
    await conn.release();
    throw new Error("db insert error");
  }
};

module.exports.sendVerifyMail = async (email) => {
  if (typeof email === "undefined") {
    throw new Error("invalid email");
  }
  const userinfo = await this.getUserFromEmail(email);

  if (userinfo === null) {
    return true;
  }

  // 인증메일 전송
  const MailerClass = require("./mailer");
  const Mailer = new MailerClass();
  try {
    await Mailer.sendMail({
      to: email,
      subject: "히요비 인증메일입니다.",
      html: `<a href="https://hiyobi.me/verification/${userinfo.verifycode}">https://hiyobi.me/verification/${userinfo.verifycode}</a>로 접속해주시기 바랍니다.`,
    });

    return true;
  } catch (e) {
    logger.error(e);
    throw new Error(e);
  }
};

module.exports.emailDisifyCheck = (email) =>
  new Promise((resolve, reject) => {
    const request = require("request");

    request.get(
      {
        uri: "https://disify.com/api/email/" + email,
        json: true,
      },
      (err, resp, body) => {
        if (err) {
          logger.error(err);
          reject(new Error("disposable check err"));
        } else if (resp.statusCode === 200) {
          if (body.format === false) {
            resolve(false);
          } else if (body.disposable === true) {
            resolve(false);
          } else if (body.dns === false) {
            resolve(false);
          } else {
            resolve(true);
          }
        }
      }
    );
  });

module.exports.isEmailUnique = async (email) => {
  if (typeof email === "undefined" || email === "") {
    throw new Error("invalid email");
  }

  try {
    const [rows] = await db.query(
      "select * from member where email = ?",
      await this.encryptEmail(email)
    );
    if (rows.length === 0) {
      return true;
    } else {
      return false;
    }
  } catch (e) {
    logger.error(e);
  }
};

module.exports.isNameUnique = async (name) => {
  if (typeof name === "undefined" || name === "") {
    throw new Error("invalid name");
  }

  try {
    const [rows] = await db.query("select * from member where name = ?", name);
    if (rows.length === 0) {
      return true;
    } else {
      return false;
    }
  } catch (e) {
    logger.error(e);
  }
};

module.exports.isVerifyCodeUnique = async (code) => {
  if (typeof code === "undefined" || code === "") {
    throw new Error("invalid code");
  }

  try {
    const [rows] = await db.query(
      "select * from member where verifycode = ?",
      code
    );
    if (rows.length === 0) {
      return true;
    } else {
      return false;
    }
  } catch (e) {
    logger.error(e);
    throw new Error("DB err");
  }
};

module.exports.isPasswordSuitable = (password) => {
  if (typeof password === "undefined" || password === "") {
    return false;
  }

  // 패스워드 길이는 6자이상
  if (password.length < 6) {
    return false;
  }

  return true;
};

module.exports.encryptPassword = (password) =>
  new Promise((resolve, reject) => {
    crypto.randomBytes(64, (err, buf) => {
      if (err) {
        logger.error(err);
        reject(new Error("error while create random byte"));
      }
      const salt = buf.toString("base64");
      crypto.pbkdf2(password, salt, 94869, 64, "sha512", (err, key) => {
        if (err) {
          logger.error(err);
          reject(new Error("error while encrypt password"));
        }

        resolve({
          password: password,
          hash: key.toString("base64"),
          salt: salt,
        });
      });
    });
  });

module.exports.encryptEmail = (email) =>
  new Promise((resolve, reject) => {
    const salt = "98&^Fj3ed2378ds^%D";
    crypto.pbkdf2(email, salt, 12321, 64, "sha512", (err, key) => {
      if (err) {
        logger.error(err);
        reject(new Error("error while encrypt email"));
      }

      resolve(key.toString("base64"));
    });
  });

module.exports.isPasswordCorrect = ({ password, hash, salt }) =>
  new Promise((resolve, reject) => {
    crypto.pbkdf2(password, salt, 94869, 64, "sha512", (err, key) => {
      if (err) {
        logger.error(err);
        reject(new Error("error while create password hash"));
      }
      if (key.toString("base64") === hash) {
        resolve(true);
      } else {
        resolve(false);
      }
    });
  });

module.exports.verificationCheck = async (code) => {
  if (typeof code === "undefined") {
    throw new Error("invalid code");
  }

  try {
    const [rows] = await db.query("select * from member where verifycode = ?", [
      code,
    ]);
    if (rows.length === 0) {
      throw new Error("invalid code");
    }

    await db.query("update member set verified = 1 where id = ?", [rows[0].id]);

    return true;
  } catch (e) {
    logger.error(e);
    throw new Error(e);
  }
};

/*
module.exports.updatePassword = ({ userid, password }) => new Promise( async (return, throw new Error) => {
  if (typeof userid === 'undefined' || !Number.isInteger(userid) || userid === '') {
    throw new Error('incorrect userid')
    return
  }

  if(!this.isPasswordSuitable(password)) {
    throw new Error('not suitable password')
    return
  }

  try {
    const { hash, salt } = await this.encryptPassword(password)

    let query = squel.update().table('member').where('userid = ?', userid)
      .set('password', hash)
      .set('salt', salt)
      .toParam()

    await db.query(query.text, query.values)
    return()
  }
  catch (e) {
    logger.error(e)
    throw new Error(e)
  }
})
*/

module.exports.login = async ({ email, password, session }) => {
  if (typeof email === "undefined" || email === "") {
    throw new Error("invalid email");
  }
  if (typeof password === "undefined" || password === "") {
    throw new Error("invalid password");
  }

  try {
    const row = await this.getUserFromEmail(email);

    if (row === null) {
      return "정보가 일치하지 않습니다.";
    } else if (row.verified !== 1) {
      return "이메일 인증 후 로그인 가능합니다.\n인증메일 재전송은 회원가입창에서 가능합니다.";
    }

    if (
      await this.isPasswordCorrect({
        password: password,
        hash: row.password,
        salt: row.salt,
      })
    ) {
      delete row.password;
      delete row.salt;
      delete row.email;
      session.user = row;

      return row;
    } else {
      return "정보가 일치하지 않습니다.";
    }
  } catch (e) {
    logger.error(e);
    throw new Error(e);
  }
};

module.exports.unsetUserToken = async ({ token, session }) => {
  try {
    const sql = squel
      .delete()
      .from("logintoken")
      .where("token = ?", token)
      .toParam();

    await db.query(sql.text, sql.values);

    session.user = undefined;
    return;
  } catch (e) {
    console.error(e);
    logger.error(e);
    throw new Error(e);
  }
};

module.exports.isLogined = (req) => {
  if (typeof req.session.user === "undefined") {
    return false;
  }
  if (
    ((typeof req.session.user.id === "undefined") === req.session.user.id) ===
    0
  ) {
    return false;
  }
  return true;
};

module.exports.setLoginToken = async ({ userid, agent, ip }) => {
  if (typeof userid === "undefined") {
    throw new Error("invalid userid");
  }

  try {
    const token = uuid();
    const sql = squel
      .insert()
      .into("logintoken")
      .set("token", token)
      .set("userid", userid)
      .set("date", common.getTimestamp())
      .toParam();

    await db.query(sql.text, sql.values);
    return token;
  } catch (e) {
    logger.error(e);
    throw new Error(e);
  }
};

module.exports.getTokenUser = async (token) => {
  if (typeof token === "undefined") {
    throw new Error("invalid token");
  }

  const [rows] = await db.query(
    "select * from logintoken where token = ?",
    token
  );

  if (rows.length === 0) {
    return false;
  } else {
    return rows[0].userid;
  }
};

module.exports.deleteUser = async (userid) => {
  if (isNaN(userid)) {
    throw new Error("invalid userid");
  }
  try {
    const [user] = await db.query("select * from member where id = ?", [
      userid,
    ]);

    if (user.length === 0) {
      throw new Error("user not exists");
    }

    await db.query(
      "update member set password = ?, salt = ?, email = ?, verified = ?, memo = ?, verifycode = ? where id = ?",
      ["", "", "", 0, "unregister", "", userid]
    );
    await db.query("delete from bookmark where userid = ?", [userid]);
    await db.query("delete from logintoken where userid = ?", [userid]);

    return true;
  } catch (e) {
    logger.error(e);
    throw new Error("err");
  }
};

module.exports.changePassword = async ({ userid, password }) => {
  try {
    const user = await this.getUserFromId(userid);

    if (!this.isPasswordSuitable(password)) {
      return "not suitable";
    }

    const hash = await this.encryptPassword(password);

    await db.query("update member set password = ?, salt = ? where id = ?", [
      hash.hash,
      hash.salt,
      user.id,
    ]);

    return true;
  } catch (e) {
    throw new Error(e);
  }
};

module.exports.sendPasswordResetCode = async (email) => {
  if (typeof email === "undefined") {
    throw new Error("invalid userid");
  }

  try {
    const user = await this.getUserFromEmail(email);

    if (user === null) {
      return true;
    }

    let verifycode = Math.random().toString(36).substr(2);

    while (true) {
      if (await this.isVerifyCodeUnique(verifycode)) {
        break;
      }
      verifycode = Math.random().toString(36).substr(2);
    }

    await db.query(
      "update member set verifycode = ? where id = ?",
      verifycode,
      user.id
    );

    // 인증메일 전송
    const MailerClass = require("./mailer");
    const Mailer = new MailerClass();
    await Mailer.sendMail({
      to: email,
      subject: "히요비 비밀번호 찾기 인증메일입니다.",
      html: `<a href="https://hiyobi.me/passrecovery/${verifycode}">https://hiyobi.me/passrecovery/${verifycode}</a>로 접속해주시기 바랍니다.`,
    });

    return true;
  } catch (e) {
    logger.error(e);
    return false;
  }
};

module.exports.checkPasswordResetCode = async ({ code, password }) => {
  if (typeof code === "undefined" || typeof password === "undefined") {
    throw new Error("invalid data received");
  }

  try {
    const [row] = await db.query("select * from member where verifycode = ?");

    if (row.length === 0) {
      throw new Error("invalid code");
    }

    const enc = await this.encryptPassword(password);

    await db.query("update member set password = ?, hash = ? where id = ?", [
      enc.hash,
      enc.salt,
      row[0].id,
    ]);

    return true;
  } catch (e) {
    logger.error(e);
    throw new Error("DB err");
  }
};

module.exports.canUploadGallery = async ({ userid }) => {
  if (typeof userid === "undefined") {
    throw new Error("invalid userid");
  }
  const userinfo = await this.getUserFromId(userid);

  const date = await this.getUserAttribute({
    userid: userid,
    attribute: this.attrValue.UPLOAD_REQUIRE_JOINDATE,
  });

  if (userinfo.regdate + date * 86400 > common.getTimestamp()) {
    return `가입 후 ${date}일 후 업로드가 가능합니다.`;
  }

  const limits = await this.getUserAttribute({
    userid: userid,
    attribute: this.attrValue.UPLOAD_LIMIT_PER_12H,
  });

  const MongoConnection = require("./MongoConnection");
  const mdb = await MongoConnection.connect();
  const Galleries = await mdb.collection("galleries");

  const query = await Galleries.find({
    uploader: userid,
    date: { $gt: common.getTimestamp() - 43200 },
  });

  const count = await query.count();

  if (count >= limits) {
    return `12시간당 ${limits}개만 업로드가 가능합니다.`;
  }
  return true;
};

module.exports.getUserAttribute = async ({ userid, attribute }) => {
  if (typeof attribute === "undefined") {
    throw new Error("invalid user attr name");
  }

  let result;

  try {
    const [
      rows,
    ] = await db.query(
      "select * from member_attributes_default where attribute = ?",
      [attribute]
    );
    if (rows.length !== 0) {
      result = rows[0].value;
    }

    if (typeof userid !== "undefined") {
      const [
        rows,
      ] = await db.query(
        "select * from member_attributes where attribute = ? and userid = ?",
        [attribute, userid]
      );
      if (rows.length !== 0) {
        result = rows[0].value;
      }
    }

    if (typeof result === "undefined") {
      // throw new Error("attr record not exists");
      return false;
    }

    result = attrvaluerefine(attribute, result);

    return result;
  } catch (e) {
    logger.error(e);
    throw new Error("error while get default user attr");
  }
};

const attrValue = {
  // 12시간 마다 업로드 가능한 작품수 (Number)
  UPLOAD_LIMIT_PER_12H: "UPLOAD_LIMIT_PER_12H",
  // 게시판 글쓰기 허용 (BOOL)
  BBS_WRITE_ALLOW: "BBS_WRITE_ALLOW",
  // 게시판 댓글쓰기 허용 (BOOL)
  BBS_COMMENT_ALLOW: "BBS_COMMENT_ALLOW",
  // 갤러리 댓글쓰기 허용 (BOOL)
  GALLERY_COMMENT_ALLOW: "GALLERY_COMMENT_ALLOW",
  // 게시판 이미지 업로드 허용 (BOOL)
  BBS_WRITE_IMAGEUPLOAD_ALLOW: "BBS_WRITE_IMAGEUPLOAD_ALLOW",
  // 작품 업로드시 필요한 가입일자수 (Number)
  UPLOAD_REQUIRE_JOINDATE: "UPLOAD_REQUIRE_JOINDATE",
  // 최고관리자 (BOOL)
  ADMINISTRATOR: "ADMINISTRATOR",
  // 오퍼레이터 (ENUM)
  OPERATOR: "OPERATOR",
  // 오퍼레이터 Value
  OP_GALLERY: "GALLERY",
  OP_BOARD: "BOARD",
  OP_USER: "USER",
};
module.exports.attrValue = attrValue;

function attrvaluerefine(attrname, value) {
  switch (attrname) {
    case attrValue.UPLOAD_LIMIT_PER_12H:
      return Number(value);
    case attrValue.BBS_WRITE_ALLOW:
      return value === "TRUE";
    case attrValue.BBS_COMMENT_ALLOW:
      return value === "TRUE";
    case attrValue.GALLERY_COMMENT_ALLOW:
      return value === "TRUE";
    case attrValue.BBS_WRITE_IMAGEUPLOAD_ALLOW:
      return value === "TRUE";
    case attrValue.UPLOAD_REQUIRE_JOINDATE:
      return Number(value);
    case attrValue.ADMINISTRATOR:
      return value === "TRUE";
    // case attrValue.OPERATOR:
    default:
      return false;
  }
}
