const squel = require("squel");
const db = require("./DB").promise();
const common = require("./common");

module.exports.addNotification = async ({
  userid,
  link,
  title,
  content,
  type,
}) => {
  if (isNaN(userid)) {
    return "userid value not valid";
  }
  if (typeof link === "undefined" || link === "") {
    return "link not defined";
  }
  if (typeof title === "undefined" || title === "") {
    return "title not defined";
  }
  if (typeof content === "undefined" || content === "") {
    return "content not defined";
  }
  if (typeof type === "undefined" || type === "") {
    return "type not defined";
  }

  const query = squel
    .insert()
    .into("notification")
    .set("userid", userid)
    .set("link", link)
    .set("title", title)
    .set("content", content)
    .set("type", type)
    .set("isread", 0)
    .set("date", common.getTimestamp())
    .toParam();

  try {
    const [result] = await db.query(query.text, query.values);
    return true;
  } catch (e) {
    throw new Error(e);
  }
};

module.exports.setReaded = async ({ notiid, userid }) => {
  if (isNaN(notiid)) {
    return "notification id not valid";
  }
  if (isNaN(userid)) {
    return "userid not valid";
  }

  try {
    await db.query(
      "update notification set isread = 1 where id = ? and userid = ?",
      [notiid, userid]
    );
    return true;
  } catch (e) {
    throw new Error(e);
  }
};

module.exports.setReadedAll = async ({ userid }) => {
  if (typeof userid === "undefined") {
    return "userid not valid";
  }

  try {
    await db.query(
      "update notification set isread = 1 where userid = ?",
      userid
    );
    return true;
  } catch (e) {
    throw new Error(e);
  }
};

module.exports.getNotifications = async (userid) => {
  if (isNaN(userid)) {
    throw new Error("invalid userid");
  }
  try {
    const date = common.getTimestamp() - 7776000;
    const [
      rows,
    ] = await db.query(
      "select * from notification where userid = ? and date > ? order by id desc limit 100",
      [userid, date]
    );
    return rows;
  } catch (e) {
    console.error(e);
    throw new Error(e);
  }
};
