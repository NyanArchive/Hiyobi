const winston = require("winston");
const {
  combine,
  timestamp,
  printf,
  errors,
  colorize,
  prettyPrint,
} = winston.format;

const myFormat = printf(({ level, message, timestamp }) => {
  return `${timestamp} ${level}: ${message}`; // log 출력 포맷 정의
});

const logger = winston.createLogger({
  level: "info",
  format: combine(
    timestamp(),
    myFormat, // log 출력 포맷,
    errors({ stack: true }),
    colorize(),
    prettyPrint()
  ),
  maxsize: 5242880, // 5MB
  maxFiles: 5,
  defaultMeta: { service: "user-service" },
  transports: [
    //
    // - Write all logs with level `error` and below to `error.log`
    // - Write all logs with level `info` and below to `combined.log`
    //
    new winston.transports.File({
      filename: "/var/log/hiyobi/error.log",
      level: "error",
    }),
    new winston.transports.File({ filename: "/var/log/hiyobi/combined.log" }),
  ],
});

//
// If we're not in production then log to the `console` with the format:
// `${info.level}: ${info.message} JSON.stringify({ ...rest }) `
//
if (process.env.NODE_ENV !== "production") {
  logger.add(
    new winston.transports.Console({
      format: winston.format.simple(),
    })
  );
}

module.exports = logger;
