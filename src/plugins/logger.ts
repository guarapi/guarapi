import { GuarapiLogger, Plugin } from '../types';

declare module '../types' {
  interface Guarapi {
    logger: GuarapiLogger;
  }
}

const logger: GuarapiLogger = (lvl, data) => {
  const msg = `"${new Date().toISOString()}";${
    typeof data === 'string'
      ? `"DEBUG";"${lvl}";"${data}"`
      : `"REQUEST";"${lvl}";"${[data?.method, data?.url, data?.headers['user-agent']].join('";"')}"`
  }\n`;
  process[lvl === 'error' ? 'stderr' : 'stdout'].write(msg);
};

const loggerPlugin: Plugin = (app) => {
  Object.defineProperty(app, 'logger', {
    value: logger,
  });

  app.use((error, req, res, next) => {
    logger('error', req);
    next(error);
  });

  return {
    name: 'logger',
    post: (req, res, next) => {
      logger('info', req);
      next();
    },
  };
};

export default loggerPlugin;
