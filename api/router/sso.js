const common = require("../lib/common");
const logger = require("../lib/logger");
var path = require("path");
const Userlib = require("../lib/user");
var redis = require("redis");
const { customAlphabet } = require("nanoid");
var client = redis.createClient();

client.on("error", function (err) {
  console.log("Error " + err);
});
/*
client.set("hello", "Node.js");

client.get("hello", function (err, val) {
  console.log(val);
  client.quit();
});
*/
const nanoid = customAlphabet(
  "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789",
  32
);
const allowedKey = "vfinJeLSfFKfhsdkfuhsd";

module.exports.requestLoginURL = async (req, res) => {
  if (typeof req.body.key === "undefined" || req.body.key !== allowedKey) {
    res.status(401).end();
    return;
  }

  if (
    typeof req.body.host === "undefined" ||
    typeof req.body.redirect === "undefined" ||
    typeof req.body.returnUrl === "undefined"
  ) {
    res.status(400).end();
    return;
  }
  const redirecturl = new URL(req.body.redirect);
  const returnurl = new URL(req.body.returnUrl);
  if (req.body.host !== redirecturl.host || req.body.host !== returnurl.host) {
    console.log(req.body.host, redirecturl.host, returnurl.host);
    res.status(400).end();
    return;
  }

  const token = nanoid();
  const result = {
    requestToken: token,
    date: common.getTimestamp(),
    host: req.body.host,
    returnUrl: req.body.returnUrl,
    redirect: req.body.redirect,
    loginUrl:
      process.env.NODE_ENV === "production"
        ? "https://api.hiyobi.me/sso/login?t=" + token
        : "http://localhost:4000/sso/login?t=" + token,
  };
  client.set("LOGINREQ_" + token, JSON.stringify(result));

  res.json(result);
};

/**
 *
 * @param {import("express").Request} req express request
 * @param {import("express").Response} res express response
 * @returns
 */
module.exports.loginLanding = (req, res) => {
  try {
    // 로그인요청 토큰 검증
    if (typeof req.query.t === "undefined") {
      res.status(400).end();
      return;
    }
    client.get("LOGINREQ_" + req.query.t, async (err, tokendata) => {
      if (err) {
        logger.error(err);
        res.status(500).end();
        return;
      }
      tokendata = JSON.parse(tokendata);

      // 토큰이 5분 이상 되었으면 그냥 삭제하고 리턴
      if (tokendata.date + 300 < common.getTimestamp()) {
        client.del("LOGINREQ_" + req.query.t);
        res.status(400).end();
        return;
      }

      if (req.cookies.token) {
        // 클라이언트에 토큰 쿠키가 있으면 토큰으로 로그인처리
        const userid = await Userlib.getTokenUser(req.cookies.token);
        if (userid !== false) {
          const user = await Userlib.getUserFromId(userid);

          delete user.password;
          delete user.salt;
          req.session.user = user;
        }
      }

      // 이미 로그인이 되어있으면 인증토큰 생성하고 리다이렉트
      if (common.isLogined(req)) {
        const token = nanoid();

        // 인증토큰 생성
        client.set(
          "LOGIN_" + token,
          JSON.stringify({
            id: req.session.user.id,
            name: req.session.user.name,
            redirect: tokendata.redirect,
            tokenCreatedDate: common.getTimestamp(),
          }),
          () => {
            // 로그인토큰은 삭제
            client.del("LOGINREQ_" + req.query.t);
            const url = new URL(tokendata.returnUrl);

            url.searchParams.append("t", token);
            res.redirect(url.toString());
          }
        );
      } else {
        // 로그인 안되어있으면 로그인페이지 출력
        res.sendFile(path.join(__dirname, "../", "static/SSOLogin.html"));
      }
    });
  } catch (e) {
    logger.error(e);
    res.status(500).end("oops");
  }
};

/**
 *
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 */
module.exports.verifyLoginToken = (req, res) => {
  if (typeof req.body.key === "undefined" || req.body.key !== allowedKey) {
    res.status(401).end();
    return;
  }
  if (typeof req.body.token === "undefined") {
    res.status(400).end();
    return;
  }

  try {
    client.get("LOGIN_" + req.body.token, (err, tokendata) => {
      if (err) {
        throw err;
      }
      tokendata = JSON.parse(tokendata);

      // 토큰 생성된지 2분이 넘었으면 삭제후 그냥 리턴
      if (tokendata + 120 < common.getTimestamp()) {
        client.del("LOGIN_" + req.body.token);
        res.status(400).end();
        return;
      }

      res.json(tokendata);
      // 처리 되었으니 삭제
      client.del("LOGIN_" + req.body.token);
    });
  } catch (e) {
    logger.error(e);
    res.status(500).end();
  }
};

module.exports.logoutPage = (req, res) => {
  res.sendFile(path.join(__dirname, "../", "static/SSOLogout.html"));
};
