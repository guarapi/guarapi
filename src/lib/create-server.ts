import { Middleware, ServerOptions } from '../types';

const createSecureServer = (options: ServerOptions, handler: Middleware) => {
  const httpCreateSecureServer = options.isHTTP2
    ? // eslint-disable-next-line @typescript-eslint/no-var-requires
      require('node:http2').createSecureServer
    : // eslint-disable-next-line @typescript-eslint/no-var-requires
      require('node:http').createSecureServer(options, handler);

  return httpCreateSecureServer(options, handler);
};

const createServer = (options: ServerOptions, handler: Middleware) => {
  const httpCreateServer = options.isHTTP2
    ? // eslint-disable-next-line @typescript-eslint/no-var-requires
      require('node:http2').createServer
    : // eslint-disable-next-line @typescript-eslint/no-var-requires
      require('node:http').createServer;

  return httpCreateServer(options, handler);
};

export default (options: ServerOptions, handler: Middleware) => {
  if (options.isSSL) {
    return createSecureServer(options, handler);
  }

  return createServer(options, handler);
};
