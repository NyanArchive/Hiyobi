const router = require("express").Router();
const gallery = require("./gallery");
const board = require("./board");
const user = require("./user");
const bookmark = require("./bookmark");
const report = require("./report");
const admin = require("./admin");
const sso = require("./sso");
const apicache = require("apicache");
const redis = require("redis");
const crypto = require("crypto");

const redisClient = redis.createClient();
const cache = apicache.options({
  redisClient: redisClient,
  enabled: process.env.NODE_ENV === "production",
}).middleware;
const cachepost = apicache.options({
  redisClient: redisClient,
  appendKey: (req, res) => {
    return (
      req.method +
      crypto
        .createHash("sha256")
        .update(JSON.stringify(req.body), "utf8")
        .digest("hex")
    );
  },
  enabled: process.env.NODE_ENV === "production",
}).middleware;

router.get("/list", cache("1 minute"), gallery.list);
router.get("/list/:id", cache("1 minute"), gallery.list);
router.post("/gallery/upload", gallery.upload);
router.post("/gallery/comments/write", gallery.writeComment);
router.post("/gallery/comments/delete", gallery.deleteComment);
router.get("/gallery/:id/like", gallery.galleryLike);
router.get("/gallery/:id/view", gallery.viewCountUp);
router.get("/gallery/:id/comments", gallery.getGalleryComments);
router.get("/gallery/:id", cache("1 minute"), gallery.info);
router.post("/random", gallery.random);
router.post("/search", cachepost("5 minutes"), gallery.search);

router.get("/board/list", board.search);
router.get("/board/list/:id", board.search);
router.post("/board/search", board.search);
router.post("/board/search/:id", board.search);
router.get("/board/categorylist", board.getCategories);
router.get("/board/:id", board.view);
router.delete("/board/comment/:id", board.deleteComment);
router.delete("/board/:id", board.delete);
router.post("/board/write", board.write);
router.post("/board/writecomment", board.writeComment);
router.post("/board/uploadimage", board.uploadImage);
router.get("/notice", cache("1 minute"), board.getNotice);

router.get("/user/info", user.getUserInfo);
router.post("/user/login", user.login);
router.post("/user/logout", user.logout);
router.post("/user/register", user.register);
router.post("/user/unregister", user.unregister);
router.post("/user/password", user.updatePassword);
router.post("/user/verfication", user.verificationCheck);
router.post("/user/resendverfication", user.resendVerificationMail);
router.get("/user/getuploads", gallery.getUserUpload);
router.get("/user/notification", user.getNotifications);
router.get("/user/notification/readall", user.readAllNotification);
router.get("/user/notification/read/:notiid", user.readNotification);
router.get("/user/uploadlimitcheck", user.getUserCanUploadGallery);

router.post("/bookmark", bookmark.list);
router.post("/bookmark/add", bookmark.add);
router.post("/bookmark/:id", bookmark.list);
router.delete("/bookmark/:id", bookmark.delete);

router.post("/report", report.sendReport);

router.post("/admin/gallery/delete", admin.deleteGallery);
router.post("/admin/gallery/restore", admin.restoreGallery);
router.post("/admin/gallery/comment/delete", admin.deleteGalleryComment);
router.post("/admin/board/write/delete", admin.deleteBoardWrite);
router.post("/admin/board/comment/delete", admin.deleteBoardComment);

router.get("/sso/login", sso.loginLanding);
router.get("/sso/logout", sso.logoutPage);
router.post("/sso/request", sso.requestLoginURL);
router.post("/sso/validate", sso.verifyLoginToken);

process.env.NODE_ENV !== "production" &&
  router.get("/auto.json", gallery.getAutoCompleteJson);

module.exports = router;
