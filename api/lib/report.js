const squel = require("squel");
const { getTimestamp } = require("./common");
const db = require("./DB").promise();

module.exports.sendReport = async ({
  type,
  target,
  reason,
  userid,
  username,
}) => {
  if (typeof type === "undefined" || type === "") {
    throw new Error("type not defined");
  }
  if (typeof target === "undefined" || target === "") {
    throw new Error("targetId not defined");
  }
  if (typeof reason === "undefined" || reason === "") {
    throw new Error("reason not defined");
  }
  if (typeof userid === "undefined") {
    throw new Error("userid not defined");
  }
  if (typeof username === "undefined") {
    throw new Error("username not defined");
  }

  const sql = squel
    .insert()
    .into("report")
    .set("type", type)
    .set("target_id", target)
    .set("reason", reason)
    .set("userid", userid)
    .set("username", username)
    .set("date", getTimestamp());

  const query = sql.toParam();
  await db.query(query.text, query.values);

  return true;
};
