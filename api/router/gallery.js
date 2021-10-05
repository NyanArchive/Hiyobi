const Gallery = require("../lib/classes/Gallery");
const gallerylib = require("../lib/gallery");
const common = require("../lib/common");
const logger = require("../lib/logger");

module.exports.list = async (req, res) => {
  const paging = Number(req.params.id);
  try {
    const gallery = await gallerylib.gallerySearch({ paging: paging });
    const result = {
      list: [],
      count: gallery.count,
    };

    for (const i in gallery.rows) {
      const gall = new Gallery(gallery.rows[i]);
      await gall.translateGallery();
      await gall.getCount();
      result.list.push(gall.toJSON());
    }
    res.json(result);
  } catch (e) {
    logger.error(e);
    res.json({ errorMsg: e });
  }
};

module.exports.search = async (req, res) => {
  if (typeof req.body.search === "undefined" || req.body.search.length === 0) {
    res.json({
      errorMsg: "검색어를 입력해주세요.",
    });
    return;
  }
  try {
    const gallery = await gallerylib.gallerySearch({
      tags: req.body.search,
      paging: req.body.paging,
    });

    const result = {
      list: [],
      count: gallery.count,
    };

    for (const i in gallery.rows) {
      const gall = new Gallery(gallery.rows[i]);
      await gall.translateGallery();
      await gall.getCount();
      result.list.push(gall.toJSON());
    }
    res.json(result);
    return;
  } catch (e) {
    res.json({ errorMsg: e });
  }
};

module.exports.info = async (req, res) => {
  let info = await gallerylib.galleryInfo(req.params.id);
  info = new Gallery(info);
  await info.translateGallery();
  await info.getCount();
  res.json(info.toJSON());
};

module.exports.random = async (req, res) => {
  const random = await gallerylib.getRandomGallery({
    tags: req.body.search,
    count: 5,
  });
  const result = [];
  for (const i in random) {
    const tmp = new Gallery(random[i]);
    await tmp.translateGallery();
    await tmp.getCount();
    result.push(tmp.toJSON());
  }

  res.json(result);
};

module.exports.upload = async (req, res) => {
  if (!common.isLogined(req)) {
    res.json({ errorMsg: "로그인이 필요합니다." });
    return;
  }

  const info = JSON.parse(req.body.info);

  info.uploader = req.session.user.id;
  info.uploadername = req.session.user.name;
  info.uploadercomment = info.comment;
  delete info.comment;

  try {
    const result = await gallerylib.uploadGallery({
      json: info,
      zipfile: req.files.zipfile,
    });
    if (result === true) {
      res.json({ status: "success" });
    } else {
      res.json({ errorMsg: result });
    }
  } catch (e) {
    res.json({ errorMsg: e.toString() });
  }
};

module.exports.getUserUpload = async (req, res) => {
  if (!common.isLogined(req)) {
    res.json({ errorMsg: "로그인이 필요합니다." });
    return;
  }

  try {
    const list = await gallerylib.getUserUploadedGallery(req.session.user.id);
    res.json(list);
  } catch (e) {
    logger.error(e);
    res.json({ errorMsg: "업로드 목록을 가져오는 도중 에러가 발생했습니다." });
  }
};

module.exports.getGalleryComments = async (req, res) => {
  try {
    const comments = await gallerylib.getGalleryComment(req.params.id);

    res.json(comments);
  } catch (e) {
    res.json({
      errorMsg: e,
    });
  }
};

module.exports.writeComment = async (req, res) => {
  if (!common.isLogined(req)) {
    res.json({ errorMsg: "로그인이 필요합니다." });
    return;
  }

  try {
    await gallerylib.writeComment({
      galleryid: req.body.id,
      comment: req.body.comment,
      user: req.session.user,
    });

    res.json({ status: "success" });
  } catch (e) {
    res.json({ errorMsg: e });
  }
};

module.exports.deleteComment = async (req, res) => {
  if (!common.isLogined(req)) {
    res.json({ errorMsg: "로그인이 필요합니다." });
    return;
  }

  try {
    await gallerylib.deleteComment({
      id: req.body.id,
      userid: req.session.user.id,
    });
    res.json({ status: "success" });
  } catch (e) {
    res.json({ errorMsg: e });
  }
};

module.exports.getAutoCompleteJson = async (req, res) => {
  const json = await gallerylib.generateGalleryAutoCompleteJson();
  res.json(json);
};

module.exports.viewCountUp = async (req, res) => {
  try {
    const id = req.params.id;
    if (typeof id === "undefined") {
      res.json({ errorMsg: "invalid id" });
      return;
    }

    await gallerylib.viewCount({
      sessionId: req.session.id,
      galleryid: id,
    });

    res.json({ status: "success" });
  } catch (e) {
    logger.error(e);
    res.json({ errorMsg: "err" });
  }
};

module.exports.galleryLike = async (req, res) => {
  try {
    const result = await gallerylib.galleryLike({
      userid: req.session.user.id,
      sessionId: req.session.id,
      galleryid: req.params.id,
    });

    if (result === true) {
      res.json({
        status: "success",
        result: "add",
      });
    } else {
      res.json({
        status: "success",
        result: "delete",
      });
    }
  } catch (e) {
    logger.error(e);
    res.json({ errorMsg: "err" });
  }
};
