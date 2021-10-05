const redis = require("redis");
const express = require("express");
const app = express();
const session = require("express-session");
const cookieParser = require("cookie-parser");
const device = require("express-device");
const fileUpload = require("express-fileupload");
const router = require("./router/index.js");
const Userlib = require("./lib/user");
const expressPort = 4000;

app.listen(expressPort, () => {
  console.log(
    "server run in " + process.env.NODE_ENV + " mode on port " + expressPort
  );
});

const RedisStore = require("connect-redis")(session);
const redisClient = redis.createClient();

app.disable("x-powered-by");
app.set("trust proxy", 1);

app.use(express.json());
app.use(device.capture());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser("바꿔라"));
app.use(
  session({
    store: new RedisStore({ client: redisClient }),
    secret: "바꿔라",
    resave: false,
    saveUninitialized: true,
  })
);
app.use(
  fileUpload({
    createParentPath: true,
    useTempFiles: true,
    tempFileDir: "/tmp/",
  })
);

app.use(async (req, res, next) => {
  // 로그인 세션이 없고, 토큰이 설정되어있으면 토큰로그인
  if (typeof req.session.user === "undefined") {
    let token = req.header("Authorization");
    if (typeof token !== "undefined") {
      token = token.replace("Bearer ", "");
      try {
        const userid = await Userlib.getTokenUser(token);

        // 토큰이 존재하지 않으면 로그아웃 처리
        if (userid !== false) {
          const user = await Userlib.getUserFromId(userid);

          delete user.password;
          delete user.salt;
          req.session.user = user;
        }
      } catch (e) {
        console.error(e);
      }
    }
  }

  process.env.NODE_ENV === "production"
    ? res.header("Access-Control-Allow-Origin", "https://hiyobi.me")
    : res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.header("Access-Control-Allow-Methods", "GET, PUT, POST, DELETE, OPTION");
  next();
});

app.use(router);
