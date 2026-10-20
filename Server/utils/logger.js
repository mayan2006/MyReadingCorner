const pino = require("pino");

const isTest = process.env.NODE_ENV === "test";
const isProd = process.env.NODE_ENV === "production" || Boolean(process.env.RENDER);

const logger = pino({
  level: isTest ? "silent" : process.env.LOG_LEVEL || "info",
  ...(isProd || isTest
    ? {}
    : {
        transport: {
          target: "pino-pretty",
          options: { colorize: true, translateTime: "SYS:standard", ignore: "pid,hostname" }
        }
      })
});

module.exports = logger;
