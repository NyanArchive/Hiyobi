const db = require("./DB").promise();
const squel = require("squel");

module.exports.tagToTranslate = async ({ type, original }) => {
  const query = squel
    .select()
    .from("l10n")
    .where("type = ?", type)
    .where("original = ?", original);

  const sql = query.toParam();
  const [rows] = await db.query(sql.text, sql.values);

  if (rows.length === 0) {
    return original;
  } else {
    return rows[0].translated;
  }
};

module.exports.tagToOriginal = async ({ type, translate }) => {
  const query = squel
    .select()
    .from("l10n")
    .where("type = ?", type)
    .where("translated = ?", translate);

  const sql = query.toParam();
  const [rows] = await db.query(sql.text, sql.values);

  if (rows.length === 0) {
    return translate;
  } else {
    return rows[0].original;
  }
};
