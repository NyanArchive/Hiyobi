const board = require("../lib/board");
const BoardClass = require("../lib/classes/Board");
const common = require("../lib/common");

module.exports.search = async (req, res) => {
  try {
    const paging = Number(req.params.id);
    const result = await board.search({
      paging: paging,
      search: {
        type: req.body.type,
        searchstr: req.body.search,
        category: req.body.category,
      },
    });

    const list = result.list.map((val) => {
      return new BoardClass(val).toJSONList();
    });

    res.json({
      list: list,
      count: result.count,
    });
    return;
  } catch (e) {
    console.error(e);
    res.json({ errorMsg: "게시판 목록을 가져오는 도중 에러가 발생했습니다." });
  }
};

module.exports.view = async (req, res) => {
  if (typeof req.params.id === "undefined") {
    res.json({
      errorMsg: "잘못된 요청입니다.",
    });
    return;
  }

  const id = Number(req.params.id);
  try {
    let view = await board.view(id);
    view = new BoardClass(view);
    await view.getComments();
    await view.getImages();

    res.json(view.toJSON());
    return;
  } catch (e) {
    console.error(e);
    res.json({ errorMsg: "글을 가져오는 도중 에러가 발생했습니다." });
  } finally {
    await board.countup(id);
  }
};

module.exports.write = async (req, res) => {
  if (!common.isLogined(req)) {
    res.json({ errorMsg: "로그인 후 사용 가능합니다." });
    return;
  }
  try {
    const body = {
      title: req.body.title,
      category: req.body.category,
      content: req.body.content,
      userid: req.session.user.id,
      images: req.body.images,
    };

    const writeid = await board.write(body);

    res.json({ writeid: writeid });
    return;
  } catch (e) {
    console.error(e);
    res.json({ errorMsg: "글 작성중 에러가 발생했습니다." });
  }
};

module.exports.delete = async (req, res) => {
  if (!common.isLogined(req)) {
    res.json({ errorMsg: "로그인 후 사용 가능합니다." });
    return;
  }
  try {
    await board.deleteWrite({
      writeid: Number(req.params.id),
      userid: req.session.user.id,
    });
    res.json({ result: "ok" });
  } catch (e) {
    console.error(e);
    res.json({ errorMsg: "글 삭제중 에러가 발생했습니다." });
  }
};

module.exports.writeComment = async (req, res) => {
  if (!common.isLogined(req)) {
    res.json({ errorMsg: "로그인 후 사용 가능합니다." });
    return;
  }
  try {
    await board.writeComment({
      writeid: req.body.writeid,
      parentid: req.body.parentid,
      userid: req.session.user.id,
      name: req.session.user.name,
      memo: req.body.content,
    });
    res.json({ result: "ok" });
  } catch (e) {
    console.error(e);
    res.json({ errorMsg: "댓글 작성중 에러가 발생했습니다." });
  }
};

module.exports.deleteComment = async (req, res) => {
  if (!common.isLogined(req)) {
    res.json({ errorMsg: "로그인 후 사용 가능합니다." });
    return;
  }
  try {
    await board.deleteComment({
      commentid: Number(req.params.id),
      userid: req.session.user.id,
    });
    res.json({ result: "ok" });
  } catch (e) {
    console.error(e);
    res.json({ errorMsg: "댓글 삭제중 에러가 발생했습니다." });
  }
};

module.exports.getNotice = async (req, res) => {
  try {
    const row = await board.getNotice();
    const anno = new BoardClass(row);
    res.json({
      result: "ok",
      data: anno.toJSON(),
    });
  } catch (e) {
    res.json({ errorMsg: "에러발생" });
  }
};

module.exports.uploadImage = async (req, res) => {
  if (!common.isLogined(req)) {
    res.json({ errorMsg: "로그인 후 사용 가능합니다." });
    return;
  }

  if (typeof req.files === "undefined") {
    res.json({
      errorMsg: "업로드 파일이 없습니다.",
    });
    return;
  }
  if (!Array.isArray(req.files.files)) {
    const tmp = req.files.files;
    req.files.files = [];
    req.files.files.push(tmp);
  }
  try {
    const uploaded = await board.uploadImage({
      files: req.files.files,
      userid: req.session.user.id,
    });

    if (uploaded.length === 0) {
      res.json({
        errorMsg: "업로드 결과 값이 없습니다.",
      });
      return;
    }

    res.json(uploaded);
  } catch (e) {
    res.json({
      errorMsg: e,
    });
  }
};

module.exports.getCategories = async (req, res) => {
  try {
    const result = await board.getCategories();

    res.json(result);
  } catch (e) {
    res.json({
      errorMsg: e,
    });
  }
};
