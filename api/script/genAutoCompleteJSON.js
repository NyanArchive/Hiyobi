const gallerylib = require("../lib/gallery");
const fs = require("fs").promises;

async function init() {
  const list = await gallerylib.generateGalleryAutoCompleteJson();
  await fs.writeFile(
    "/usr/share/nginx/html/dist/auto.json",
    JSON.stringify(list),
    "utf8"
  );

  process.exit();
}

init();
