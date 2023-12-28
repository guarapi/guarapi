import type { Server } from 'node:http';
import type { Http2Server } from 'node:http2';
import {
  Guarapi,
  GuarapiConfig,
  HttpClose,
  HttpListen,
  Middleware,
  MiddlewareError,
  Plugin,
  Request,
  Response,
} from './types';
import { nextPipeline, createServer } from './lib';

function Guarapi(config?: GuarapiConfig): Guarapi {
  let server: Server | Http2Server | null = null;
  const { serverOptions = { isHTTP2: false } } = config || {};
  const pluginsPre: Middleware[] = [];
  const pluginsPost: Middleware[] = [];
  const pluginsError: MiddlewareError[] = [];

  const patchReq = (req: Request) => {
    if (serverOptions.isHTTP2) {
      req.url = req.headers[':path'] as string;
      req.method = req.headers[':method'] as string;

      return req;
    }

    return req;
  };

  const patchRes = (res: Response) => {
    res.status = (statusCode) => {
      res.statusCode = statusCode;

      return res;
    };

    res.json = (obj) => {
      res.setHeader('content-type', 'application/json; charset=utf-8');
      res.end(JSON.stringify(obj));

      return res;
    };

    res.send = (str) => {
      res.setHeader('content-type', 'text/plain; charset=utf-8');
      res.end(str);

      return res;
    };

    return res;
  };

  const runPipelineWithFallbackError = (pipeline: Middleware[], req: Request, res: Response) => {
    try {
      nextPipeline(pipeline, req, res, null, (err) => {
        if (err) {
          nextPipeline(pluginsError, req, res, err);
        }
      });
    } catch (err) {
      console.error('Unhandled sync rejection detected');
      nextPipeline(pluginsError, req, res, err);
    }
  };

  const GuarapiApp: Guarapi = (req, res) => {
    runPipelineWithFallbackError(pluginsPre, patchReq(req), patchRes(res));

    res.once('finish', () => {
      runPipelineWithFallbackError(pluginsPost, patchReq(req), patchRes(res));
    });
  };

  const listen: HttpListen = (port, host, callback) => {
    server = createServer(serverOptions, GuarapiApp);

    server!.listen(port, host, () => {
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
