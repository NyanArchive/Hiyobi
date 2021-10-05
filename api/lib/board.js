const db = require("./DB").promise();
const common = require("./common");
const squel = require("squel");
const constants = require("./constants");
const logger = require("./logger");
const User = require("./user");
const UserClass = require("./classes/User");
const sanitizeHtml = require("sanitize-html");
const notificationlib = require("./notification");

module.exports.search = async ({ paging, search }) => {
  const { type, searchstr, category } = search;
  const query = squel.select().from("bbs_write").order("bbs_write.id", false);

  if (typeof type !== "undefined") {
    // 1 : 제목+내용
    // 2 : 제목
    // 3 : 글쓴이
    switch (type) {
      case 1:
        query.where(
          "title like ? or memo like ?",
          "%" + searchstr + "%",
          "%" + searchstr + "%"
        );
        break;
      case 2:
        query.where("title like ?", "%" + searchstr + "%");
        break;
      case 3:
        query.where("bbs_write.name like ?", "%" + searchstr + "%");
        break;
    }
  }

  if (typeof category !== "undefined") {
    query.where("category = ? ", category);
  }

  if (
    typeof paging === "undefined" ||
    paging === 0 ||
    !Number.isInteger(paging)
  ) {
    paging = 1;
  }

  const listquery = query.clone();
  listquery.limit(constants.PAGELIMIT_BBS);
  listquery.offset(constants.PAGELIMIT_BBS * (paging - 1));
  listquery.fields([
    "bbs_write.*",
    "COUNT(bbs_images.writeid) AS imgcount",
    "bbs_category.name AS categoryname",
  ]);
  listquery
    .left_join("bbs_images", null, "bbs_write.id = bbs_images.writeid")
    .group("1");
  listquery.left_join(
    "bbs_category",
    null,
    "bbs_write.category = bbs_category.id"
  );

  const sql = listquery.toParam();
  try {
    const [rows] = await db.query(sql.text, sql.values);

    let cntsql = query.clone();
    cntsql.field("count(*) as cnt");
    cntsql = cntsql.toParam();
    const [count] = await db.query(cntsql.text, cntsql.values);

    return {
      list: rows,
      count: count[0].cnt,
    };
  } catch (e) {
    logger.error(e);
    throw new Error("DB오류");
  }
};

module.exports.view = async (id) => {
  if (typeof id === "undefined" || !Number.isInteger(id)) {
    throw new Error("정확한 값을 입력해주세요.");
  }

  const query = squel
    .select()
    .fields([
      "bbs_write.*",
      "COUNT(bbs_images.writeid) AS imgcount",
      "bbs_category.name AS categoryname",
    ])
    .from("bbs_write")
    .where("bbs_write.id = ?", id)
    .left_join("bbs_images", null, "bbs_write.id = bbs_images.writeid")
    .group("1")
    .left_join("bbs_category", null, "bbs_write.category = bbs_category.id")

    .toParam();

  const [rows] = await db.query(query.text, query.values);

  if (rows.length === 0) {
    throw new Error("글이 존재하지 않습니다.");
  }

  return rows[0];
};

module.exports.countup = async (id) => {
  if (typeof id === "undefined") {
    throw new Error("no id");
  }

  const query = squel
    .update()
    .table("bbs_write")
    .where("id = ?", id)
    .set("cnt = cnt + 1")
    .toParam();

  const [result] = await db.query(query.text, query.values);
};

module.exports.getComment = async (id) => {
  if (isNaN(id)) {
    throw new Error("invalid id");
  }

  try {
    const [rows] = await db.query("select * from bbs_cmt where id = ?", id);
    if (rows.length === 0) {
      throw new Error("no record");
    }
    return rows[0];
  } catch (e) {
    console.error(e);
    throw new Error(e);
  }
};

module.exports.getComments = async (id) => {
  if (typeof id === "undefined") {
    throw new Error("no id");
  }

  const query = squel
    .select()
    .from("bbs_cmt")
    .where("writeid = ?", id)
    .toParam();

  const [rows] = await db.query(query.text, query.values);

  return rows;
};

module.exports.write = async ({ title, category, content, userid, images }) => {
  if (typeof title === "undefined" || title === "") {
    throw new Error("제목을 입력해주세요");
  }
  if (
    typeof category === "undefined" ||
    !Number.isInteger(category) ||
    !(await this.isAllowedCategory(category))
  ) {
    throw new Error("올바른 카테고리를 선택해주세요");
  }
  if (typeof content === "undefined" || content === "") {
    throw new Error("내용을 입력해주세요");
  }
  if (typeof userid === "undefined" || !Number.isInteger(userid)) {
    throw new Error("bad userid");
  }

  const conn = await db.getConnection();

  try {
    const user = new UserClass(await User.getUserFromId(userid));

    // write perm check
    if (
      !(await User.getUserAttribute({
        userid: user.id,
        attribute: User.attrValue.BBS_WRITE_ALLOW,
      }))
    ) {
      throw new Error("no permission");
    }

    title = this.sanitizeTitle(title);
    content = this.sanitizeContent(content);

    if (common.checkZalgo(title) || common.checkZalgo(content)) {
      throw new Error("invalid content");
    }
    const query = squel
      .insert()
      .into("bbs_write")
      .set("userid", userid)
      .set("name", user.name)
      .set("title", title)
      .set("category", category)
      .set("memo", content)
      .set("date", common.getTimestamp())
      .toParam();

    await conn.query("START TRANSACTION");
    const [result] = await conn.query(query.text, query.values);

    // 이미지파일 처리
    if (typeof images !== "undefined") {
      for (const i in images) {
        const imageid = images[i];
        if (isNaN(imageid)) {
          throw new Error("bad imageid");
        }

        await conn.query(
          "update bbs_images set writeid = ? where id = ? and userid = ? ",
          [result.insertId, imageid, userid]
        );
      }
    }
    await conn.query("COMMIT");

    return result.insertId;
  } catch (e) {
    logger.error(e);
    await conn.query("ROLLBACK");
    throw new Error(e);
  }
};

module.exports.deleteWrite = async ({ writeid, userid, admin }) => {
  if (typeof writeid === "undefined" || !Number.isInteger(writeid)) {
    throw new Error("invalid writeid");
  }
  if (typeof userid === "undefined" || !Number.isInteger(userid)) {
    throw new Error("invalid userid");
  }

  try {
    let sql = "delete from bbs_write where userid = ? and id = ?";
    let param = [userid, writeid];
    if (admin) {
      sql = "delete from bbs_write where id = ?";
      param = [writeid];
    }
    await db.query(sql, param);
    return true;
  } catch (e) {
    logger.error(e);
    throw new Error("db error");
  }
};

module.exports.sanitizeTitle = (title) => {
  return sanitizeHtml(title, {
    allowedTags: [],
    allowedAttributes: [],
  });
};

module.exports.sanitizeContent = (content) => {
  return sanitizeHtml(content, {
    allowedTags: sanitizeHtml.defaults.allowedTags.concat(["img"]),
    allowedIframeHostnames: ["www.youtube.com"],
  });
};

module.exports.isAllowedCategory = async (category) => {
  if (typeof category === "undefined" || !Number.isInteger(category)) {
    return false;
  }

  const [rows] = await db.query("select * from bbs_category where id = ?", [
    category,
  ]);

  if (rows.length === 0) {
    return false;
  }

  if (rows[0].iswriteable === 0) {
    return false;
  }

  return true;
};

module.exports.writeComment = async ({
  writeid,
  parentid,
  userid,
  name,
  memo,
}) => {
  if (typeof writeid === "undefined" || !Number.isInteger(writeid)) {
    throw new Error("invalid writeid");
  }
  if (typeof memo === "undefined" || memo === "") {
    throw new Error("invalid content");
  }
  if (typeof name === "undefined" || name === "") {
    throw new Error("invalid name");
  }
  if (typeof userid === "undefined" || !Number.isInteger(userid)) {
    throw new Error("invalid userid");
  }

  try {
    // perm check
    if (
      !(await User.getUserAttribute({
        userid: userid,
        attribute: User.attrValue.BBS_COMMENT_ALLOW,
      }))
    ) {
      throw new Error("no permission");
    }
    memo = this.sanitizeTitle(memo);
    if (common.checkZalgo(memo)) {
      throw new Error("invalid text");
    }
    let parentinfo;

    const query = squel
      .insert()
      .into("bbs_cmt")
      .set("writeid", writeid)
      .set("userid", userid)
      .set("memo", memo)
      .set("name", name)
      .set("date", common.getTimestamp());

    const writeinfo = await this.view(writeid);

    // 계층댓글
    if (typeof parentid !== "undefined") {
      parentinfo = await this.getComment(parentid);
      parentid = Number(parentid);
      query.set("parentid", parentid);
    }

    const sql = query.toParam();
    const [result] = await db.query(sql.text, sql.values);
    await db.query("update bbs_write set cmtcnt = cmtcnt+1 where id = ?", [
      writeid,
    ]);

    let targetid;
    // 대댓글이 아닌경우
    if (typeof parentid === "undefined") {
      if (writeinfo.userid !== userid) {
        targetid = writeinfo.userid;
      }
    }
    // 대댓글인경우
    else {
      if (parentinfo.userid !== userid) {
        targetid = parentinfo.userid;
      }
    }

    if (typeof targetid !== "undefined") {
      if (memo.lenth > 50) {
        memo = memo.slice(0, 47) + "...";
      }
      await notificationlib.addNotification({
        userid: targetid,
        link: `/board/${writeid}#${result.insertId}`,
        title: "댓글알림",
        content: memo,
        type: 1,
      });
    }

    return result.insertId;
  } catch (e) {
    logger.error(e);
    throw new Error(e);
  }
};

module.exports.deleteComment = async ({ commentid, userid, admin }) => {
  if (typeof commentid === "undefined" || !Number.isInteger(commentid)) {
    throw new Error("invalid commentid");
  }
  if (typeof userid === "undefined" || !Number.isInteger(userid)) {
    throw new Error("invalid userid");
  }

  try {
    const [bbs] = await db.query("select * from bbs_cmt where id = ?", [
      commentid,
    ]);

    if (bbs.length === 0) {
      throw new Error("글이 존재하지 않습니다.");
    }
    if (!admin && bbs[0].userid !== userid) {
      throw new Error("자신의 글만 삭제가 가능합니다.");
    }

    let sql = "delete from bbs_cmt where userid = ? and id = ?";
    let param = [userid, commentid];

    if (admin) {
      sql = "delete from bbs_cmt where id = ?";
      param = [commentid];
    }
    await db.query(sql, param);

    await db.query(
      "update bbs_write set cmtcnt = \
        (select count(*) from bbs_cmt where writeid = ?) \
      where id = ?",
      [bbs[0].writeid, bbs[0].writeid]
    );
    return;
  } catch (e) {
    logger.error(e);
    throw new Error(e);
  }
};

module.exports.getNotice = async () => {
  try {
    const [rows] = await db.query(
      "select * from bbs_write where isnoti = 1 order by id desc limit 1"
    );
    if (rows.length === 0) {
      throw new Error("no notice record");
    }
    return rows[0];
  } catch (e) {
    logger.error(e);
    throw new Error(e);
  }
};

module.exports.uploadImage = async ({ files, userid }) => {
  if (typeof files === "undefined") {
    throw new Error("invalid image files");
  }
  if (typeof userid === "undefined") {
    throw new Error("invalid userid");
  }

  try {
    const { execSync } = require("child_process");

    const returnval = [];

    for (const i in files) {
      const image = files[i];

      if (image.size > constants.BBS_IMAGEFILE_SIZELIMIT) {
        throw new Error(
          "파일 크기는 " +
            constants.BBS_IMAGEFILE_SIZELIMIT / 1000 / 1000 +
            "MB를 넘을 수 없습니다."
        );
      }

      const allowedExtension = ["jpeg", "jpg", "png", "gif"];
      const extension = image.name.split(".").pop();
      if (!allowedExtension.includes(extension.toLowerCase())) {
        throw new Error("jpeg, png, gif 파일 확장자만 업로드 가능합니다.");
      }

      const query = squel
        .insert()
        .into("bbs_images")
        .set("imagename", image.name)
        .set("imagepath", image.md5 + "." + extension)
        .set("userid", userid)
        .set("size", image.size)
        .set("date", common.getTimestamp())
        .toParam();

      const path = `/data/bbsimage/${image.md5.slice(0, 1)}/${image.md5.slice(
        1,
        3
      )}/`;

      if (process.env.NODE_ENV === "production") {
        execSync(
          `ssh -p 4869 root@${constants.BBS_IMAGEFILE_UPLOADIP} "mkdir -p ${path}" && scp -P 4869 ${image.tempFilePath} root@${constants.BBS_IMAGEFILE_UPLOADIP}:${path}${image.md5}.${extension}`
        );
      } else {
        console.log(
          `ssh -p 4869 root@${constants.BBS_IMAGEFILE_UPLOADIP} "mkdir -p ${path}" && scp -P 4869 ${image.tempFilePath} root@${constants.BBS_IMAGEFILE_UPLOADIP}:${path}${image.md5}.${extension}`
        );
      }

      const [result] = await db.query(query.text, query.values);

      returnval.push({
        id: result.insertId,
        imagepath: image.md5 + "." + extension,
      });
    }

    return returnval;
  } catch (e) {
    logger.error(e);
    throw "업로드 파일 처리 중 에러가 발생했습니다.";
  }
};

module.exports.getWriteImages = async (writeid) => {
  if (typeof writeid === "undefined") {
    throw "invalid writeid";
  }

  try {
    const [rows] = await db.query(
      "select * from bbs_images where writeid = ?",
      writeid
    );

    return rows;
  } catch (e) {
    logger.error(e);
    throw "DB error while get images";
  }
};

module.exports.getCategories = async () => {
  try {
    const [rows] = await db.query("select * from bbs_category");

    return rows;
  } catch (e) {
    logger.error(e);
    throw new Error("DB err");
  }
};

module.exports.getCategoryName = async (id) => {
  if (typeof id === "undefined") {
    id = 0;
  }

  try {
    const [row] = await db.query(
      "select name from bbs_category where id = ?",
      id
    );

    return row[0].name;
  } catch (e) {
    logger.error(e);
    throw new Error("err");
  }
};
