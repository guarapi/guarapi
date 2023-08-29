import { GuarapiLogger, Plugin } from '../types';

declare module '../types' {
  interface Guarapi {
    logger: GuarapiLogger;
  }
}

const logger: GuarapiLogger = (lvl, data) => {
  const msg = `"${new Date().toISOString()}";${
    typeof data === 'string'
      ? `"DEBUG";"${data}"`
      : `"REQUEST";"${[data?.method, data?.url, data?.headers['user-agent']].join('";"')}"`
  }\n`;
  process[lvl === 'error' ? 'stderr' : 'stdout'].write(msg);
};

const loggerPlugin: Plugin = (app) => {
  Object.defineProperty(app, 'logger', {
    value: logger,
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
