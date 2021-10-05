const { getTimestamp } = require("../../lib/common");
const { GALLERY_COUNTDUPTIME } = require("../../lib/constants");

const db = require("../../lib/DB").promise();

async function init() {
  await db.query("delete from gallery_tmpviewcount where date <= ?", [
    getTimestamp() - GALLERY_COUNTDUPTIME,
  ]);
  process.exit();
}

init();
