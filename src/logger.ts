import type { GuarapiLogger } from './types';

const logger: GuarapiLogger = (lvl, data) => {
  const msg = `${new Date().toISOString()} ${
    typeof data === 'string'
      ? data
      : `${[data.method, data.url, data.headers['user-agent']].join(' ')}`
  }\n`;
  process[lvl === 'error' ? 'stderr' : 'stdout'].write(msg);
};

export default logger;
