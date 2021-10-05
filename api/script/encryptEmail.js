const { encryptEmail } = require("../lib/user");
const db = require("../lib/DB").promise();

async function init() {
  try {
    console.log("Email encryption script start");
    const [rows] = await db.query("select * from member");

    console.log(`Total ${rows.length} rows`);

    for (const i in rows) {
      const row = rows[i];
      const enc = await encryptEmail(row.email);

      await db.query("update member set email = ? where id = ?", [enc, row.id]);
      console.log(`${Number(i) + 1}/${rows.length} done`);
    }
  } catch (e) {
    console.error(e);
  }
}

init();
