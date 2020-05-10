import winston from "winston";

let options = {
  console: {
    level: "debug",
    handleExceptions: true,
    json: false,
    colorize: true,
  },
};

let logger = winston.createLogger({
  transports: [new winston.transports.Console(options.console)],
  exitOnError: false,
});

/* eslint-disable no-unused-vars */
logger.stream = {
  write: function (message, encoding) {
    logger.info(message);
  },
};
/* eslint-enable no-unused-vars */

export default logger;
