const db = require("../lib/DB").promise();

async function init() {
  const [list] = await db.query(
    'select * from bookmark where search like "%#_%" escape "#"'
  );

  for (const i in list) {
    console.log(`${Number(i) + 1}/${list.length}`);
    const row = list[i];

    await db.query("update bookmark set search = ? where id = ?", [
      row.search.replace(/_/gi, " "),
      row.id,
    ]);
  }

  process.exit();
}

init();
