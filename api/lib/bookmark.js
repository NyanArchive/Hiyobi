const db = require("./DB").promise();
const squel = require("squel");
const logger = require("./logger");
const common = require("./common");
const constants = require("./constants");

module.exports.getBookmark = async ({ type, paging, userid }) => {
  // type 1 : 갤러리, type 2 : 검색어
  userid = Number(userid);
  paging = Number(paging);
  if (!Number.isInteger(userid)) {
    throw new Error("invalid userid");
  }
  if (!Number.isInteger(paging)) {
    throw new Error("invalid paging");
  }

  if (paging < 1) {
    paging = 1;
  }

  const sql = squel
    .select()
    .from("bookmark")
    .where("userid = ?", userid)
    .order("id", false)
    .limit(constants.PAGELIMIT_GALLERY)
    .offset(constants.PAGELIMIT_GALLERY * (paging - 1));

  if (typeof type !== "undefined") {
    if (type === 1) {
      sql.where("galleryid not null");
    } else if (type === 2) {
      sql.where("search not null");
    }
  }

  const query = sql.toParam();

  try {
    const [rows] = await db.query(query.text, query.values);

    const countquery = sql
      .limit(null)
      .offset(null)
      .field("count(*)", "cnt")
      .toParam();
    const [count] = await db.query(countquery.text, countquery.values);

    return {
      list: rows,
      count: count[0].cnt,
    };
  } catch (e) {
    logger.error(e);
    throw new Error(e);
  }
};

module.exports.addBookmark = async ({ userid, search, galleryid }) => {
  const dupsql = squel.select().from("bookmark").where("userid = ?", userid);
  const sql = squel.insert().into("bookmark").set("userid", userid);

  if (typeof search === "undefined" && typeof galleryid === "undefined") {
    return new Error("invalid bookmark");
  }

  if (search) {
    dupsql.where("search = ?", search);
    sql.set("search", search);
  } else {
    dupsql.where("galleryid = ?", galleryid);
    sql.set("galleryid", galleryid);
  }

  try {
    const dupquery = dupsql.toParam();
    const [dup] = await db.query(dupquery.text, dupquery.values);

    if (dup.length !== 0) {
      return "이미 등록된 북마크입니다.";
    }

    const query = sql.toParam();
    const [result] = await db.query(query.text, query.values);

    return true;
  } catch (e) {
    logger.error(e);
    throw e;
  }
};

module.exports.deleteBookmark = async ({ userid, bookmarkid }) => {
  if (typeof userid === "undefined") {
    throw new Error("invalid userid");
  }
  if (typeof bookmarkid === "undefined") {
    throw new Error("invalid id");
  }

  try {
    const [
      check,
    ] = await db.query("select * from bookmark where userid = ? and id = ?", [
      userid,
      bookmarkid,
    ]);
    if (check.length === 0) {
      throw new Error("invalid request");
    }

    const [
      result,
    ] = await db.query("delete from bookmark where userid = ? and id = ?", [
      userid,
      bookmarkid,
    ]);

    return;
  } catch (e) {
    console.error(e);
    logger.error(e);
    throw new Error(e);
  }
};
