import pino from "pino";
import { IncomingMessage } from "http";

const isProd = process.env.NODE_ENV === "production";

// TODO: remove tight cloupling
export type Loggable = pino.Logger & {
  withRequest(req: IncomingMessage): pino.Logger;
};

const logLevel = isProd ? "info" : "debug";

// Only use pino-pretty in development, not in production builds
const pinoConfig: pino.LoggerOptions = {
  level: logLevel,
  base: null, // Remove default fields
};

// Simple logger without worker threads to avoid Next.js module resolution issues
// pino-pretty transport causes worker thread errors in Next.js dev mode
export const logger: any = pino(pinoConfig);

// TODO: mover para middleware
logger.withRequest = (req: any) => {
  return req ? logger.child({ req }) : logger;
};
