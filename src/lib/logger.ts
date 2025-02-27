import pino from 'pino';
import { IncomingMessage } from 'http';

const isProd = process.env.NODE_ENV === 'production'

// TODO: remove tight cloupling
export type Loggable = pino.Logger & {
  withRequest(req: IncomingMessage): pino.Logger;
};

const logLevel = isProd ? 'info' : 'debug';

const transport = pino.transport({
  target: 'pino-pretty',
  options: {
    colorize: true,
    translateTime: 'SYS:standard'
  }
});

export const logger: any = pino(
  {
    level: logLevel,
    base: null, // Remove default fields
    transport,
  }
);

// TODO: mover para middleware
logger.withRequest = (req: any) => {
  return req ? logger.child({ req }) : logger;
};

