const { getTimestamp } = require("./common");
const logger = require("./logger");
const { getUserAttribute, attrValue } = require("./user");

const db = require("./DB").promise();

module.exports.auditLog = async ({ type, action, description, userid }) => {
  try {
    await db.query(
      "insert into audit set type = ?, action = ?, description = ?, userid = ?, date = ?",
      [type, action, description, userid, getTimestamp()]
    );

    return true;
  } catch (e) {
    logger.error(e);
    logger.error(
      `audit log err type = ${type} action = ${action} desc = ${description} userid = ${userid}`
    );
  }
};

module.exports.checkPermission = async (userid, perm) => {
  if (typeof userid === "undefined" || typeof perm === "undefined") {
    throw new Error("invalid value");
  }

  // administrator
  if (
    !(await getUserAttribute({
      userid: userid,
      attribute: attrValue.ADMINISTRATOR,
    })) &&
    // operator
    (await getUserAttribute({
      userid: userid,
      attribute: attrValue.OPERATOR,
    })) !== perm
  ) {
    return false;
  }

  return true;
};
