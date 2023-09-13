import http, { IncomingMessage, Server, ServerResponse } from 'node:http';
import {
  Guarapi,
  GuarapiConfig,
  HttpClose,
  HttpListen,
  Middleware,
  MiddlewareError,
  Plugin,
} from './types';
import nextPipeline from './lib/next-pipeline';

function Guarapi(config?: GuarapiConfig): Guarapi {
  let server: Server | null = null;
  const pluginsPre: Middleware[] = [];
  const pluginsPost: Middleware[] = [];
  const pluginsError: MiddlewareError[] = [];

  const runPipelineWithFallbackError = (
    pipeline: Middleware[],
    req: IncomingMessage,
    res: ServerResponse,
  ) => {
    try {
      nextPipeline(pipeline, req, res);
    } catch (error) {
      nextPipeline(pluginsError, req, res, error);
    }
  };

  const GuarapiApp: Guarapi = (req, res) => {
    runPipelineWithFallbackError(pluginsPre, req, res);

    res.once('finish', () => {
      runPipelineWithFallbackError(pluginsPost, req, res);
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
    const { pre, post, error } = init(GuarapiApp, config) || {};
    if (pre) pluginsPre.push(pre);
    if (post) pluginsPost.push(post);
    if (error) pluginsError.push(error);
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
