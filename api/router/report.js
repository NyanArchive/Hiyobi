const reportlib = require("../lib/report");
const common = require("../lib/common");
const logger = require("../lib/logger");

module.exports.sendReport = async (req, res) => {
  if (!common.isLogined(req)) {
    res.json({ errorMsg: "로그인이 필요합니다." });
    return;
  }

  try {
    const result = await reportlib.sendReport({
      type: req.body.type,
      target: req.body.target,
      reason: req.body.reason,
      userid: req.session.user.id,
      username: req.session.user.name,
    });

    if (result === true) {
      res.json({ status: "success" });
    } else {
      res.json({ errorMsg: result });
    }
  } catch (e) {
    res.json({ errorMsg: "err" });
    logger.error(e);
  }
};
