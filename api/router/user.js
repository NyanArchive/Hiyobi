const user = require("../lib/user");
const UserClass = require("../lib/classes/User");
const common = require("../lib/common");
const logger = require("../lib/logger");
const notilib = require("../lib/notification");

module.exports.register = async (req, res) => {
  try {
    const result = await user.createUser({
      email: req.body.email,
      name: req.body.name,
      password: req.body.password,
      ip: common.getIpAddress(req),
    });

    if (result === true) {
      res.json({ result: "ok" });
      return;
    } else {
      res.json({ errorMsg: result });
    }
  } catch (e) {
    logger.error(e);
    res.json({ errorMsg: "회원가입 중 에러가 발생했습니다." });
  }
};

module.exports.updatePassword = async (req, res) => {
  if (!common.isLogined(req)) {
    res.json({ errorMsg: "로그인이 필요합니다." });
    return;
  }
  try {
    const result = await user.changePassword({
      userid: req.session.user.id,
      password: req.body.password,
    });

    if (result === true) {
      res.json({ result: "ok" });
    } else {
      res.json({ errorMsg: result });
    }
  } catch (e) {
    res.json({ errorMsg: "패스워드 변경중 에러가 발생했습니다." });
  }
};

/**
 *
 * @param {import("request").Request} req
 * @param {import("request").Response} res
 * @returns
 */
module.exports.login = async (req, res) => {
  try {
    const result = await user.login({
      email: req.body.email,
      password: req.body.password,
      session: req.session,
    });

    if (typeof result === "string") {
      res.json({ errorMsg: result });
      return;
    } else {
      const userc = new UserClass(result);
      const data = userc.toJSON();

      if (req.body.remember === true || req.body.remember === "true") {
        const token = await user.setLoginToken({
          userid: userc.id,
        });
        data.token = token;
        res.cookie("token", token, { maxAge: 31536000000 });
      }

      res.json({
        result: "ok",
        data: data,
      });
    }
  } catch (e) {
    logger.error(e);
    res.json({ errorMsg: "로그인 중 에러가 발생했습니다." });
  }
};

/**
 *
 * @param {import("request").Request} req
 * @param {import("request").Response} res
 * @returns
 */
module.exports.logout = async (req, res) => {
  try {
    let token;

    if (typeof req.cookies.token !== "undefined" && req.cookies.token !== "") {
      token = req.cookies.token;
    }
    if (typeof req.header("Authorization") !== "undefined") {
      token = req.header("Authorization").replace("Bearer ", "");
    }
    await user.unsetUserToken({ token: token, session: req.session });
    res.clearCookie("token");
    res.json({ result: "ok" });
  } catch (e) {
    logger.error(e);
    res.json({ errorMsg: "로그아웃중 에러가 발생했습니다." });
  }
};

module.exports.getUserInfo = async (req, res) => {
  if (!common.isLogined(req)) {
    res.status(401).json({
      result: "notlogined",
    });
    return;
  }

  const userc = new UserClass(req.session.user);
  res.json({
    result: "ok",
    data: userc.toJSON(),
  });
};

module.exports.unregister = async (req, res) => {
  if (!common.isLogined(req)) {
    res.json({ errorMsg: "로그인 후 사용가능합니다." });
    return;
  }
  try {
    await user.deleteUser(req.session.user.id);
    req.session.destroy();
    res.json({ result: "ok" });
  } catch (e) {
    console.error(e);
    logger.error(e);
    res.json({ errorMsg: "유저 삭제중 에러가 발생했습니다." });
  }
};

module.exports.verificationCheck = async (req, res) => {
  try {
    const result = await user.verificationCheck(req.body.code);
    if (result === true) {
      res.json({ result: "ok" });
      return;
    } else {
      res.json({ errorMsg: result });
      return;
    }
  } catch (e) {
    res.json({ errorMsg: "기타에러" });
  }
};

module.exports.resendVerificationMail = async (req, res) => {
  if (typeof req.body.email === "undefined") {
    res.json({ errorMsg: "이메일을 입력해주세요." });
    return;
  }

  try {
    const userinfo = await user.getUserFromEmail(req.body.email);
    if (userinfo === null || userinfo.verified === 1) {
      res.json({ result: "ok" });
      return;
    }
    await user.sendVerifyMail(req.body.email);
    res.json({ result: "ok" });
  } catch (e) {
    console.error(e);
    logger.error(e);
    res.json({ result: "ok" });
  }
};

module.exports.getNotifications = async (req, res) => {
  if (!common.isLogined(req)) {
    res.json({ errorMsg: "로그인이 필요합니다." });
    return;
  }

  try {
    const result = await notilib.getNotifications(req.session.user.id);

    res.json({
      result: "ok",
      data: result,
    });
  } catch (e) {
    console.error(e);
    res.json({
      errorMsg: "알 수 없는 서버에러",
    });
  }
};

module.exports.readNotification = async (req, res) => {
  if (!common.isLogined(req)) {
    res.json({ errorMsg: "로그인이 필요합니다." });
    return;
  }

  try {
    const result = await notilib.setReaded({
      notiid: Number(req.params.notiid),
      userid: req.session.user.id,
    });

    if (result === true) {
      res.json({ result: "ok" });
    } else {
      res.json({ errorMsg: result });
    }
  } catch (e) {
    res.json({ errorMsg: "에러발생" });
  }
};

module.exports.readAllNotification = async (req, res) => {
  if (!common.isLogined(req)) {
    res.json({ errorMsg: "로그인이 필요합니다." });
    return;
  }

  try {
    const result = await notilib.setReadedAll({ userid: req.session.user.id });

    if (result === true) {
      res.json({ result: "ok" });
    } else {
      res.json({ errorMsg: "에러발생" });
    }
  } catch (e) {
    res.json({ errorMsg: "에러발생" });
  }
};

module.exports.getUserCanUploadGallery = async (req, res) => {
  if (!common.isLogined(req)) {
    res.json({ errorMsg: "로그인되지 않았습니다." });
    return;
  }

  try {
    const status = await user.canUploadGallery({ userid: req.session.user.id });

    if (status !== true) {
      res.json({
        status: "unavailable",
        reason: status,
      });
      return;
    }

    res.json({ status: "success" });
  } catch (e) {
    res.json({
      errorMsg: "err",
    });
  }
};
