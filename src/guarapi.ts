import http, { Server } from 'node:http';
import { Guarapi, GuarapiConfig, HttpClose, HttpListen, Middleware, Plugin } from './types';
import next from './next';

function Guarapi(config?: GuarapiConfig): Guarapi {
  let server: Server | null = null;
  const pluginsPre: Middleware[] = [];
  const pluginsPost: Middleware[] = [];

  const GuarapiApp: Guarapi = (req, res) => {
    next(pluginsPre, req, res);
    res.once('finish', () => {
      next(pluginsPost, req, res);
    });
  };

  const listen: HttpListen = (port, host, callback) => {
    server = http.createServer(GuarapiApp);
    server.listen(port, host, () => {
      if (callback) callback();
    });
  };

  const close: HttpClose = (callback) => {
    server?.close(callback);
    server = null;
  };

  const plugin = (init: Plugin) => {
    const { pre, post } = init(GuarapiApp, config) || {};
    if (pre) pluginsPre.push(pre);
    if (post) pluginsPost.push(post);
  };

  GuarapiApp.listen = listen;
  GuarapiApp.close = close;
  GuarapiApp.plugin = plugin;
  GuarapiApp.use = () => {
    throw new Error('Not Implemented. Please activate middleware plugin.');
  };
  GuarapiApp.logger = () => {
    throw new Error('Not Implemented. Please activate logger plugin.');
  };

  return GuarapiApp;
}

export default Guarapi;
