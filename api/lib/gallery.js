const db = require("./DB").promise();
const common = require("./common");
const logger = require("./logger");
const l10n = require("./l10n");
const MongoConnection = require("./MongoConnection");
const { customAlphabet } = require("nanoid");
const fs = require("fs").promises;
const os = require("os");
const sanitizeHtml = require("sanitize-html");
const userlib = require("./user");
const { PAGELIMIT_GALLERY, GALLERY_COUNTDUPTIME } = require("../lib/constants");
const Gallery = require("./classes/Gallery");
const squel = require("squel");

module.exports.gallerySearch = async ({ tags, paging, admin }) => {
  const mdb = await MongoConnection.connect();
  const Galleries = await mdb.collection("galleries");

  let find = {};

  if (typeof tags !== "undefined") {
    const q_artists = [];
    const q_groups = [];
    const q_parodys = [];
    const q_characters = [];
    const q_tags = [];

    for (const i in tags) {
      const tag = tags[i];

      // 제목검색과 태그검색 나눔
      const split = splitTag(tag);

      // 콜론이 없으면 제목 검색 진행
      if (split.length === 1) {
        // 만약 검색어에 숫자만 있으면 번호검색
        if (!isNaN(split[0])) {
          find.id = Number(split[0]);
        }
        // 숫자가 아니면 제목검색 진행
        else {
          // split[0] = split[0].replace(/_/gi, " ");
          find.$text = { $search: split[0] };
        }
      }
      // 콜론이 있으면 태그 검색 진행
      else {
        split[1] = split[1].replace(/_/gi, " ");
        split[1] = await this.getTranslatedTag(split);
        // 콜론앞에 따라 검색 조건 입력
        switch (split[0]) {
          case "artist":
          case "작가":
            q_artists.push(split[1]);
            break;
          case "group":
          case "그룹":
            q_groups.push(split[1]);
            break;
          case "series":
          case "원작":
            q_parodys.push(split[1]);
            break;
          case "character":
          case "캐릭":
            q_characters.push(split[1]);
            break;
          case "type":
          case "종류":
            find = { ...find, type: typeConvert(split[1]) };
            break;
          case "tag":
          case "태그":
            q_tags.push(split[1]);
            break;
          case "female":
          case "male":
            q_tags.push(split[1]);
            break;
          case "여":
          case "남":
            q_tags.push(split[1]);
            break;
        }
      }
    }

    if (q_artists.length !== 0) {
      find.artists = { $all: q_artists };
    }
    if (q_groups.length !== 0) {
      find.groups = { $all: q_groups };
    }
    if (q_parodys.length !== 0) {
      find.parodys = { $all: q_parodys };
    }
    if (q_characters.length !== 0) {
      find.characters = { $all: q_characters };
    }
    if (q_tags.length !== 0) {
      find.tags = { $all: q_tags };
    }
  }

  if (typeof paging === "undefined" || !Number.isInteger(paging)) {
    paging = 1;
  }

  if (!admin) {
    find.invisible = { $ne: true };
  }

  try {
    const query = await Galleries.find(find)
      .limit(PAGELIMIT_GALLERY)
      .skip(PAGELIMIT_GALLERY * (paging - 1))
      .sort({ _id: -1 });

    // count
    const count = await query.count();
    return { rows: await query.toArray(), count: count };
  } catch (e) {
    logger.error(e);
    throw new Error("DB Error");
  }
};

module.exports.galleryInfo = async (id, { admin } = {}) => {
  if (typeof id === "undefined") {
    throw new Error("invalid id");
  }
  try {
    if (!isNaN(id)) {
      id = Number(id);
    }
    const mdb = await MongoConnection.connect();
    const Galleries = await mdb.collection("galleries");
    const find = { id: id };
    if (!admin) find.invisible = { $ne: true };
    const result = await Galleries.findOne(find);

    return result;
  } catch (e) {
    logger.error(e);
    throw e;
  }
};

module.exports.getRandomGallery = async ({ tags, count }) => {
  if (typeof count === "undefined") {
    count = 5;
  }
  try {
    const mdb = await MongoConnection.connect();
    const Galleries = await mdb.collection("galleries");

    let find = {};

    if (typeof tags !== "undefined") {
      const q_artists = [];
      const q_groups = [];
      const q_parodys = [];
      const q_characters = [];
      const q_tags = [];

      for (const i in tags) {
        const tag = tags[i];

        // 제목검색과 태그검색 나눔
        const split = splitTag(tag);

        // 콜론이 없으면 제목 검색 진행
        if (split.length === 1) {
          // 만약 검색어에 숫자만 있으면 번호검색
          if (!isNaN(split[0])) {
            find.id = split[0];
          }
          // 숫자가 아니면 제목검색 진행
          else {
            split[0] = split[0].replace(/_/gi, " ");
            find.title = new RegExp(split[0]);
          }
        }
        // 콜론이 있으면 태그 검색 진행
        else {
          split[1] = split[1].replace(/_/gi, " ");
          split[1] = await this.getTranslatedTag(split);
          // 콜론앞에 따라 검색 조건 입력
          switch (split[0]) {
            case "artist":
            case "작가":
              q_artists.push(split[1]);
              break;
            case "group":
            case "그룹":
              q_groups.push(split[1]);
              break;
            case "series":
            case "원작":
              q_parodys.push(split[1]);
              break;
            case "character":
            case "캐릭":
              q_characters.push(split[1]);
              break;
            case "type":
            case "종류":
              find = { ...find, type: typeConvert(split[1]) };
              break;
            case "tag":
            case "태그":
              q_tags.push(split[1]);
              break;
            case "female":
            case "male":
              q_tags.push(split[1]);
              break;
            case "여":
            case "남":
              q_tags.push(split[1]);
              break;
          }
        }
      }

      if (q_artists.length !== 0) {
        find.artists = { $all: q_artists };
      }
      if (q_groups.length !== 0) {
        find.groups = { $all: q_groups };
      }
      if (q_parodys.length !== 0) {
        find.parodys = { $all: q_parodys };
      }
      if (q_characters.length !== 0) {
        find.characters = { $all: q_characters };
      }
      if (q_tags.length !== 0) {
        find.tags = { $all: q_tags };
      }
    }

    find.invisible = { $ne: true };

    const query = await Galleries.aggregate([
      { $match: find },
      { $sample: { size: count } },
    ]);
    return await query.toArray();
  } catch (e) {
    logger.error(e);
    throw new Error("DB Error");
  }
};

module.exports.getTranslatedTag = async (split) => {
  let type = 1;
  switch (split[0]) {
    case "artist":
    case "작가":
      type = 2;
      break;
    case "group":
    case "그룹":
      type = 3;
      break;
    case "series":
    case "원작":
      type = 4;
      break;
    case "character":
    case "캐릭":
      type = 5;
      break;
    case "tag":
    case "태그":
      type = 6;
      break;
    case "female":
    case "여":
      type = 7;
      break;
    case "male":
    case "남":
      type = 7;
      break;
  }
  if (type !== 1) {
    if (type === 7) {
      const result = await l10n.tagToOriginal({
        type: 6,
        translate: split[0] + ":" + split[1],
      });
      return result;
    } else {
      const result = await l10n.tagToOriginal({
        type: type,
        translate: split[1],
      });
      return result;
    }
  } else {
    return split[1];
  }
};

module.exports.uploadGallery = async ({ json, zipfile }) => {
  if (typeof json === "undefined" || typeof zipfile === "undefined") {
    throw new Error("Input data is invalid");
  }

  try {
    uploadJsonValidation(json);
  } catch (e) {
    logger.error(e);
    throw e;
  }

  const canUploadGallery = require("./user").canUploadGallery;
  const canupload = await canUploadGallery({ userid: json.uploader });
  if (canupload !== true) {
    throw new Error(canupload);
  }

  try {
    const mdb = await MongoConnection.connect();
    const Galleries = await mdb.collection("galleries");
    const jobQueue = await mdb.collection("jobQueue");

    // id중복 확인
    const randid = customAlphabet(
      "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIKJLMNOPQRSTUVWXYZ",
      6
    );
    while (1) {
      const id = randid();
      const result = await Galleries.findOne({ id: id });
      if (result === null || result.length === 0) {
        json.id = id;
        break;
      }
    }

    json.language = "korean";
    json.source = "hiyobi";
    json.invisible = true;
    json.uploadStatus = "waiting";
    json.date = common.getTimestamp();

    // 만약 한글태그가 있으면 영문으로 변환
    // 태그가 현재 있는 태그인지 확인 (태그 임의 입력 금지)
    for (const i in json.artists) {
      json.artists[i] = await l10n.tagToOriginal({
        type: 2,
        translate: json.artists[i],
      });

      // 태그가 존재하지 않으면
      if ((await Galleries.findOne({ artists: json.artists[i] })) === null) {
        return `작가 태그가 존재하지 않음 (${json.artists[i]})`;
      }
    }
    for (const i in json.groups) {
      json.groups[i] = await l10n.tagToOriginal({
        type: 3,
        translate: json.groups[i],
      });
      if ((await Galleries.findOne({ groups: json.groups[i] })) === null) {
        return `그룹 태그가 존재하지 않음 (${json.groups[i]})`;
      }
    }
    for (const i in json.parodys) {
      json.parodys[i] = await l10n.tagToOriginal({
        type: 4,
        translate: json.parodys[i],
      });
      if ((await Galleries.findOne({ parodys: json.parodys[i] })) === null) {
        return `원작 태그가 존재하지 않음 (${json.parodys[i]})`;
      }
    }
    for (const i in json.characters) {
      json.characters[i] = await l10n.tagToOriginal({
        type: 5,
        translate: json.characters[i],
      });
      if (
        (await Galleries.findOne({ characters: json.characters[i] })) === null
      ) {
        return `캐릭 태그가 존재하지 않음 (${json.characters[i]})`;
      }
    }
    for (const i in json.tags) {
      json.tags[i] = await l10n.tagToOriginal({
        type: 6,
        translate: json.tags[i],
      });
      if ((await Galleries.findOne({ tags: json.tags[i] })) === null) {
        return `태그가 존재하지 않음 (${json.tags[i]})`;
      }
    }

    try {
      await fs.mkdir(os.tmpdir() + "/htemp", { recursive: true });
      await zipfile.mv(os.tmpdir() + "/htemp/" + json.id + ".zip");
      await Galleries.insertOne(json);
      await jobQueue.insertOne({
        command: "gallery_upload",
        data: json.id,
        assignedTo: "runner",
        status: "waiting",
        insertedDate: json.date,
        runAtDate: json.date,
      });

      return true;
    } catch (e) {
      logger.error(e);
      throw new Error("업로드 파일 처리 중 에러가 발생했습니다.");
    }
  } catch (e) {
    logger.error(e);
    throw new Error("업로드 처리중 알 수 없는 오류가 발생했습니다.");
  }
};

module.exports.getUserUploadedGallery = async (userid) => {
  if (typeof userid === "undefined") {
    throw new Error("invalid userid");
  }

  try {
    const mdb = await MongoConnection.connect();
    const Galleries = await mdb.collection("galleries");

    const list = await Galleries.find({ uploader: userid })
      .project({
        id: true,
        title: true,
        uploader: true,
        uploadername: true,
        invisible: true,
        uploadStatus: true,
        errorMsg: true,
        date: true,
      })
      .toArray();

    if (list === null || list.length === 0) {
      return [];
    } else {
      return list;
    }
  } catch (e) {
    logger.error(e);
    throw e;
  }
};

module.exports.getGalleryComment = async (id) => {
  try {
    if (typeof id === "undefined") {
      throw new Error("invalid galleryid");
    }

    const query = "select * from gallery_comment where galleryid = ?";

    const [rows] = await db.query(query, [id]);

    return rows;
  } catch (e) {
    logger.error(e);
    throw new Error("error while get Gallery Comments");
  }
};

module.exports.writeComment = async ({ galleryid, comment, user }) => {
  if (typeof galleryid === "undefined") {
    throw new Error("invalid id");
  }
  if (typeof comment === "undefined") {
    throw new Error("invalid comment");
  }

  try {
    // check perm
    if (
      !(await userlib.getUserAttribute({
        userid: user.id,
        attribute: userlib.attrValue.GALLERY_COMMENT_ALLOW,
      }))
    ) {
      throw new Error("no permission");
    }

    comment = sanitizeHtml(comment, {
      allowedTags: [],
      allowedAttributes: [],
    });

    if (
      comment.includes("discord") ||
      comment.includes("디코") ||
      comment.includes("디스코드")
    ) {
      throw new Error("no link");
    }

    if (common.checkZalgo(comment)) {
      throw new Error("invalid value");
    }

    await db.query(
      "insert into gallery_comment set userid = ?, name = ?, galleryid = ?, comment = ?, date = ?",
      [user.id, user.name, galleryid, comment, common.getTimestamp()]
    );

    await db.query(
      "insert into gallery_viewcount set comment = 1, galleryid = ? on duplicate key update comment = comment + 1",
      [galleryid]
    );

    return true;
  } catch (e) {
    logger.error(e);
    throw new Error("write error");
  }
};

module.exports.deleteComment = async ({ id, userid, admin }) => {
  if (typeof id === "undefined") {
    throw new Error("invalid id");
  }
  if (typeof userid === "undefined") {
    throw new Error("invalid userid");
  }

  try {
    const rows = await db.query("select * from gallery_comment where id = ?", [
      id,
    ]);

    if (rows.length === 0) {
      return true;
    }

    let sql = "delete from gallery_comment where id = ? and userid = ?";
    if (admin) {
      sql = "delete gallery_comment where id = ?";
    }
    await db.query(sql, [id, userid]);

    await db.query(
      "update gallery_viewcount set comment = comment - 1 where galleryid = ?",
      [id]
    );

    return true;
  } catch (e) {
    logger.error(e);
    throw new Error("err");
  }
};

module.exports.generateGalleryAutoCompleteJson = async () => {
  const mdb = await MongoConnection.connect();
  const Galleries = await mdb.collection("galleries");

  const jsonarr = [];
  const artists = await Galleries.distinct("artists", {
    invisible: { $ne: true },
  });
  const groups = await Galleries.distinct("groups", {
    invisible: { $ne: true },
  });
  const parodys = await Galleries.distinct("parodys", {
    invisible: { $ne: true },
  });
  const characters = await Galleries.distinct("characters", {
    invisible: { $ne: true },
  });
  const tags = await Galleries.distinct("tags", { invisible: { $ne: true } });

  for (const i in artists) {
    jsonarr.push("artist:" + artists[i]);
  }
  for (const i in groups) {
    jsonarr.push("group:" + groups[i]);
  }
  for (const i in parodys) {
    const translated = await l10n.tagToTranslate({
      type: 4,
      original: parodys[i],
    });
    jsonarr.push("series:" + parodys[i]);
    jsonarr.push("series:" + translated);
  }
  for (const i in characters) {
    const translated = await l10n.tagToTranslate({
      type: 5,
      original: characters[i],
    });
    jsonarr.push("character:" + characters[i]);
    jsonarr.push("character:" + translated);
  }
  for (const i in tags) {
    const translated = await l10n.tagToTranslate({
      type: 6,
      original: tags[i],
    });
    if (tags[i].startsWith("female") || tags[i].startsWith("male")) {
      jsonarr.push(tags[i]);
      if (tags[i] !== translated) jsonarr.push(translated);
    } else {
      jsonarr.push("tag:" + tags[i]);
      jsonarr.push("tag:" + translated);
    }
  }

  jsonarr.push("type:doujinshi");
  jsonarr.push("type:manga");
  jsonarr.push("type:artistcg");
  jsonarr.push("type:gamecg");
  jsonarr.push("종류:동인지");
  jsonarr.push("종류:망가");
  jsonarr.push("종류:Cg아트");
  jsonarr.push("종류:게임Cg");

  const uniq = [...new Set(jsonarr)];

  return uniq;
};

module.exports.deleteGallery = async (gid) => {
  try {
    const mdb = await MongoConnection.connect();
    const Galleries = await mdb.collection("galleries");

    await Galleries.updateOne({ id: gid }, { $set: { invisible: true } });

    return true;
  } catch (e) {
    throw new Error(e);
  }
};

module.exports.restoreGallery = async (gid) => {
  try {
    const mdb = await MongoConnection.connect();
    const Galleries = await mdb.collection("galleries");

    await Galleries.updateOne({ id: gid }, { $unset: { invisible: true } });

    return true;
  } catch (e) {
    throw new Error(e);
  }
};

module.exports.viewCount = async ({ sessionId, galleryid }) => {
  //
  const date = common.getTimestamp();

  const [
    rows,
  ] = await db.query(
    "select * from gallery_tmpviewcount where session = ? and galleryid = ? and date <= ?",
    [sessionId, galleryid, date + GALLERY_COUNTDUPTIME]
  );

  // 중복에 안걸렸으면
  if (rows.length === 0) {
    // 카운트 추가
    await db.query(
      " insert into gallery_tmpviewcount set session = ?, galleryid = ?, date = ?",
      [sessionId, galleryid, date]
    );

    await db.query(
      "INSERT INTO gallery_viewcount SET galleryid = ?, count = 1 ON DUPLICATE KEY UPDATE count = count + 1",
      [galleryid]
    );
  }

  return true;
};

module.exports.getGalleryCount = async (id) => {
  const [
    rows,
  ] = await db.query("select * from gallery_viewcount where galleryid = ?", [
    id,
  ]);

  if (rows.length === 0) {
    return null;
  } else {
    return rows[0];
  }
};

module.exports.galleryLike = async ({ userid, sessionId, galleryid }) => {
  // check
  const sql = squel
    .select()
    .from("gallery_like")
    .field("count (*) as cnt")
    .where("galleryid = ?", galleryid);

  // 회원
  if (userid) {
    sql.where("userid = ?", userid);
  } else {
    // 비회원
    sql.where("sessionid", sessionId);
  }

  const query = sql.toParam();
  const [rows] = await db.query(query.text, query.values);

  // 없으면 추가
  if (rows[0].cnt === 0) {
    const sql = squel
      .insert()
      .into("gallery_like")
      .set("galleryid", galleryid)
      .set("date", common.getTimestamp());

    if (userid) {
      sql.set("userid", userid);
      await db.query(
        "INSERT INTO gallery_viewcount SET galleryid = ?, likebtn = 1 ON DUPLICATE KEY UPDATE likebtn = likebtn + 1",
        [galleryid]
      );
    } else {
      sql.set("sessionid", sessionId);
      await db.query(
        "INSERT INTO gallery_viewcount SET galleryid = ?, likebtn_anony = 1 ON DUPLICATE KEY UPDATE likebtn_anony = likebtn_anony + 1",
        [galleryid]
      );
    }

    const query = sql.toParam();
    await db.query(query.text, query.values);

    return true;
  } else {
    // 있으면 삭제
    const sql = squel
      .remove()
      .from("gallery_like")
      .where("galleryid", galleryid);

    // 회원
    if (userid) {
      sql.where("userid = ?", userid);
      await db.query(
        "update gallery_viewcount set likebtn = likebtn + 1 where galleryid = ?",
        [galleryid]
      );
    } else {
      // 비회원
      sql.where("sessionid", sessionId);
      await db.query(
        "update gallery_viewcount set likebtn_anony = likebtn_anony + 1 where galleryid = ?",
        [galleryid]
      );
    }

    const query = sql.toParam();
    await db.query(query.text, query.values);

    return false;
  }
};

const typeConvert = (word) => {
  switch (word) {
    case "doujinshi":
      return 1;
    case "동인지":
      return 1;
    case "manga":
      return 2;
    case "망가":
      return 2;
    case "artistcg":
      return 3;
    case "Cg아트":
      return 3;
    case "gamecg":
      return 4;
    case "게임Cg":
      return 4;
  }
};

const uploadJsonValidation = (json) => {
  if (typeof json === "undefined") {
    throw new Error("값이 넘어오지 않았습니다.");
  }

  if (typeof json.title !== "string" || json.title === "") {
    throw new Error("제목이 설정되지 않았습니다.");
  } else if (
    typeof json.type !== "number" ||
    (json.type < 1 && json.type > 5)
  ) {
    throw new Error("정확한 종류를 선택해주세요.");
  } else if (typeof json.uploader !== "number") {
    throw new Error("업로더 값 넘어오지 않음.");
  } else if (
    typeof json.uploadername !== "string" ||
    json.uploadername === ""
  ) {
    throw new Error("업로더 값 넘어오지 않음.");
  } else if (
    typeof json.artists === "undefined" ||
    !Array.isArray(json.artists)
  ) {
    throw new Error("invalid artists value");
  } else if (
    typeof json.groups === "undefined" ||
    !Array.isArray(json.groups)
  ) {
    throw new Error("invalid groups value");
  } else if (
    typeof json.parodys === "undefined" ||
    !Array.isArray(json.parodys)
  ) {
    throw new Error("invalid parodys value");
  } else if (
    typeof json.characters === "undefined" ||
    !Array.isArray(json.characters)
  ) {
    throw new Error("invalid characters value");
  } else if (typeof json.tags === "undefined" || !Array.isArray(json.tags)) {
    throw new Error("invalid tags value");
  }
};

const splitTag = (tag) => {
  let split = tag.split(":");
  split = [split.shift(), split.join(":")];
  split = split.filter((val) => {
    if (val === "") {
      return false;
    }
    return true;
  });
  return split;
};
