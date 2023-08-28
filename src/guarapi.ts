import http, { Server } from 'node:http';
import type { Guarapi, GuarapiConfig, GuarapiLogger, HttpClose, HttpListen } from './types';
import defaultLogger from './logger';

function Guarapi(config?: GuarapiConfig): Guarapi {
  let server: Server | null = null;
  const logger: GuarapiLogger = config?.logger || defaultLogger;

  const GuarapiApp: Guarapi = (req, res) => {
    res.writeHead(200, { 'content-type': 'text/plain' });
    res.on('error', () => logger('error', req));
    res.once('close', () => logger('info', req));
    res.end('Hello World');
  };

  const listen: HttpListen = (port, host, callback) => {
    server = http.createServer(GuarapiApp);
    server.listen(port, host, () => {
      if (callback) callback();
      logger('info', `app listen on ${host} ${port}`);
    });
  };

  const close: HttpClose = (callback) => {
    server?.close(callback);
    server = null;
    logger('info', `app close`);
  };

  GuarapiApp.listen = listen;
  GuarapiApp.logger = logger;
  GuarapiApp.close = close;

  return GuarapiApp;
}

export default Guarapi;
