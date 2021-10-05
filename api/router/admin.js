/**
 * 추가해야할 기능
 *  - 갤러리 삭제 기능
 *  - 갤러리 수정 기능
 *  - 갤러리댓글 삭제 기능
 *
 *  - 게시판 삭제 기능
 *  - 게시판댓글 삭제 기능
 *  - 게시판 채널 관리기능
 *
 *  - 유저 Attr 수정 기능
 */

const { auditLog, checkPermission } = require("../lib/admin");
const {
  deleteWrite,
  deleteComment: deleteBoardComment,
} = require("../lib/board");
const { isLogined } = require("../lib/common");
const {
  deleteGallery,
  restoreGallery,
  deleteComment,
} = require("../lib/gallery");
const logger = require("../lib/logger");
const { attrValue } = require("../lib/user");

module.exports.deleteGallery = async (req, res) => {
  try {
    if (typeof req.body.ids === "undefined" || !Array.isArray(req.body.ids)) {
      res.json({ errorMsg: "invalid ids" });
      return;
    }

    if (!isLogined(req)) {
      res.json({ errorMsg: "need Login" });
      return;
    }

    // 권한 체크
    if (!(await checkPermission(req.session.user.id, attrValue.OP_GALLERY))) {
      res.json({ errorMsg: "no permission" });
      return;
    }

    const ids = req.body.ids;
    const comment = req.body.comment;

    await Promise.all(
      ids.map(async (id) => {
        await deleteGallery(id);
        await auditLog({
          type: "deleteGallery",
          action: id,
          description: comment,
          userid: req.session.user.id,
        });
      })
    );

    res.json({ status: "success" });
  } catch (e) {
    logger.error(e);
    res.json({ errorMsg: "error" });
  }
};

module.exports.restoreGallery = async (req, res) => {
  try {
    if (typeof req.body.ids === "undefined" || !Array.isArray(req.body.ids)) {
      res.json({ errorMsg: "invalid ids" });
      return;
    }

    if (!isLogined(req)) {
      res.json({ errorMsg: "need Login" });
      return;
    }

    // 권한 체크
    if (!(await checkPermission(req.session.user.id, attrValue.OP_GALLERY))) {
      res.json({ errorMsg: "no permission" });
      return;
    }

    const ids = req.body.ids;
    const comment = req.body.comment;

    await Promise.all(
      ids.map(async (id) => {
        await restoreGallery(id);
        await auditLog({
          type: "restoreGallery",
          action: id,
          description: comment,
          userid: req.session.user.id,
        });
      })
    );

    res.json({ status: "success" });
  } catch (e) {
    logger.error(e);
    res.json({ errorMsg: "error" });
  }
};

module.exports.deleteGalleryComment = async (req, res) => {
  try {
    if (typeof req.body.ids === "undefined" || !Array.isArray(req.body.ids)) {
      res.json({ errorMsg: "invalid ids" });
      return;
    }

    if (!isLogined(req)) {
      res.json({ errorMsg: "need Login" });
      return;
    }

    // 권한 체크
    if (!(await checkPermission(req.session.user.id, attrValue.OP_GALLERY))) {
      res.json({ errorMsg: "no permission" });
      return;
    }

    const ids = req.body.ids;
    const comment = req.body.comment;

    await Promise.all(
      ids.map(async (id) => {
        await deleteComment({ id: id, userid: 0, admin: true });
        await auditLog({
          type: "deleteGalleryComment",
          action: id,
          description: comment,
          userid: req.session.user.id,
        });
      })
    );

    res.json({ status: "success" });
  } catch (e) {
    logger.error(e);
    res.json({ errorMsg: "error" });
  }
};

module.exports.deleteBoardWrite = async (req, res) => {
  try {
    if (typeof req.body.ids === "undefined" || !Array.isArray(req.body.ids)) {
      res.json({ errorMsg: "invalid ids" });
      return;
    }

    if (!isLogined(req)) {
      res.json({ errorMsg: "need Login" });
      return;
    }

    // 권한 체크
    if (!(await checkPermission(req.session.user.id, attrValue.OP_BOARD))) {
      res.json({ errorMsg: "no permission" });
      return;
    }

    const ids = req.body.ids;
    const comment = req.body.comment;

    await Promise.all(
      ids.map(async (id) => {
        await deleteWrite({ writeid: id, userid: 0, admin: true });
        await auditLog({
          type: "deleteBoardWrite",
          action: id,
          description: comment,
          userid: req.session.user.id,
        });
      })
    );

    res.json({ status: "success" });
  } catch (e) {
    logger.error(e);
    res.json({ errorMsg: "err" });
  }
};

module.exports.deleteBoardComment = async (req, res) => {
  try {
    if (typeof req.body.ids === "undefined" || !Array.isArray(req.body.ids)) {
      res.json({ errorMsg: "invalid ids" });
      return;
    }

    if (!isLogined(req)) {
      res.json({ errorMsg: "need Login" });
      return;
    }

    // 권한 체크
    if (!(await checkPermission(req.session.user.id, attrValue.OP_BOARD))) {
      res.json({ errorMsg: "no permission" });
      return;
    }

    const ids = req.body.ids;
    const comment = req.body.comment;

    await Promise.all(
      ids.map(async (id) => {
        await deleteBoardComment({ commentid: id, userid: 0, admin: true });
        await auditLog({
          type: "deleteBoardComment",
          action: id,
          description: comment,
          userid: req.session.user.id,
        });
      })
    );

    res.json({ status: "success" });
  } catch (e) {
    logger.error(e);
    res.json({ errorMsg: "err" });
  }
};

module.exports.listUserAttrs = async (req, res) => {};
