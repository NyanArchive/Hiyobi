module.exports.parsetags = (str) => {
  const list = str.split("|").filter((val) => {
    if (val === "") {
      return false;
    }
    return true;
  });
  return list;
};

module.exports.tagPrefixToType = (str) => {
  switch (str) {
    case "artist":
      return 1;
    case "group":
      return 2;
    case "parody":
      return 3;
    case "series":
    case "character":
      return 4;
    case "tag":
      return 5;
    default:
      return false;
  }
};

module.exports.isValidEmail = (email) => {
  var emailCheck = /^[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/i;
  if (emailCheck.test(email)) {
    return true;
  } else {
    return false;
  }
};

module.exports.getTimestamp = () => {
  return Math.floor(Date.now() / 1000);
};

module.exports.getIpAddress = (req) => {
  if (req.headers["cf-connecting-ip"]) {
    return req.headers["cf-connecting-ip"];
  } else if (req.headers["x-forwarded-for"]) {
    const arr = req.headers["x-forwarded-for"].split(":");
    return arr[0];
  } else if (req.headers["X-Forwarded-For"]) {
    const arr = req.headers["X-Forwarded-For"].split(":");
    return arr[0];
  } else {
    return req.connection.remoteAddress;
  }
};

module.exports.isLogined = (req) => {
  if (typeof req.session.user === "undefined") {
    return false;
  }
  if (
    ((typeof req.session.user.id === "undefined") === req.session.user.id) ===
    0
  ) {
    return false;
  }
  return true;
};

module.exports.checkZalgo = (str) => {
  return /[\u0300-\u036F\u0E00-\u0E7F]/.test(str);
};
