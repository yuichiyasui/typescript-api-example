import { pino } from "pino";

import { env } from "./env.js";

const baseConfig = {
  level: env.LOG_LEVEL || "info",
  formatters: {
    level: (label: string) => {
      return { level: label };
    },
  },
  timestamp: pino.stdTimeFunctions.isoTime,
};

const developmentConfig = {
  ...baseConfig,
  transport: {
    target: "pino-pretty",
    options: {
      colorize: true,
      translateTime: "SYS:standard",
      ignore: "pid,hostname",
    },
  },
};

export const logger =
  env.NODE_ENV === "development" ? pino(developmentConfig) : pino(baseConfig);

export type Logger = typeof logger;
