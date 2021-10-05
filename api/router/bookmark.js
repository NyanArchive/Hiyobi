const common = require("../lib/common");
const bookmarklib = require("../lib/bookmark");
const logger = require("../lib/logger");

module.exports.list = async (req, res) => {
  if (!common.isLogined(req)) {
    res.json({
      errorMsg: "로그인이 필요합니다.",
    });
    return;
  }

  try {
    const result = await bookmarklib.getBookmark({
      type: req.body.type,
      paging: req.params.id,
      userid: req.session.user.id,
    });

    res.json(result);
  } catch (e) {
    res.json({ errorMsg: e });
  }
};

module.exports.add = async (req, res) => {
  if (!common.isLogined(req)) {
    res.json({
      errorMsg: "로그인이 필요합니다.",
    });
    return;
  }
  if (
    typeof req.body.search === "undefined" &&
    typeof req.body.galleryid === "undefined"
  ) {
    res.json({
      errorMsg: "북마크값이 없습니다.",
    });
  }
  try {
    const result = await bookmarklib.addBookmark({
      userid: req.session.user.id,
      search: req.body.search,
      galleryid: req.body.galleryid,
    });

    if (result === true) {
      res.json({ result: "ok" });
    } else {
      res.json({ errorMsg: result });
    }
  } catch (e) {
    console.error(e);
    res.json({ errorMsg: e });
  }
};

module.exports.delete = async (req, res) => {
  if (!common.isLogined(req)) {
    res.json({
      errorMsg: "로그인이 필요합니다.",
    });
    return;
  }
  if (typeof req.params.id === "undefined") {
    res.json({
      errorMsg: "북마크값이 없습니다.",
    });
    return;
  }
  try {
    await bookmarklib.deleteBookmark({
      userid: req.session.user.id,
      bookmarkid: req.params.id,
    });
    res.json({ result: "ok" });
  } catch (e) {
    console.error(e);
    logger.error(e);
    res.json({ errorMsg: e });
  }
};
