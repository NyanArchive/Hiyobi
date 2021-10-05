const db = require("../lib/DB").promise();

async function init() {
  await db.query(
    "ALTER TABLE `gallery_viewcount` ADD `comment` INT UNSIGNED NOT NULL AFTER `count`"
  );

  const [rows] = await db.query(
    "select galleryid, count(*) as cnt from gallery_comment group by galleryid"
  );

  for (const i in rows) {
    const row = rows[i];

    await db.query(
      "INSERT INTO gallery_viewcount SET comment = ?, galleryid = ? ON DUPLICATE KEY UPDATE comment = ?",
      [row.cnt, row.galleryid, row.cnt]
    );
  }

  process.exit();
}

init();
