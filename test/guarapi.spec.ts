import http, { Server } from 'node:http';
import http2, { Http2Server } from 'node:http2';
import guarapi, { createServer, middlewarePlugin } from '../src/index';
import type { GuarapiConfig, ServerOptions } from '../src/types';
import { generateCertificates, request } from './utils';

describe('Guarapi', () => {
  const env = process.env;
  const { certPem, keyPem } = generateCertificates();

  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetAllMocks();
    jest.restoreAllMocks();
    process.env = { ...env };
  });

  afterEach(() => {
    process.env = env;
  });

  it('should create app without config', () => {
    const app = guarapi();

    expect(app).toHaveProperty('logger');
    expect(app).toHaveProperty('listen');
  });

  it('should create app with empty config object', () => {
    const config: GuarapiConfig = {};
    const app = guarapi(config);

    expect(app).toHaveProperty('logger');
    expect(app).toHaveProperty('listen');
  });

  it('should create app with custom log', () => {
    const config: GuarapiConfig = {};
    const app = guarapi(config);

    expect(app).toHaveProperty('logger');
    expect(app).toHaveProperty('listen');
  });

  it('should app call listen callback', () => {
    const config: GuarapiConfig = {};
    const app = guarapi(config);
    const listenCallback = jest.fn();
    const server = {
      listen: jest.fn((_port?: number, _host?: string, cb?: () => void) => cb && cb()),
    };

    jest.spyOn(http, 'createServer').mockImplementation(() => server as unknown as Server);
    jest.spyOn(http2, 'createServer').mockImplementation(() => server as unknown as Http2Server);

    app.listen(3000, '0.0.0.0', listenCallback);

    expect(listenCallback).toBeCalled();
  });

  it('should app call listen and close callbacks', () => {
    const app = guarapi();
    const listenCallback = jest.fn();
    const closeCallback = jest.fn();
    const server = {
      listen: jest.fn((_port?: number, _host?: string, cb?: () => void) => cb && cb()),
      close: jest.fn((cb?: () => void) => cb && cb()),
    };

    jest.spyOn(http, 'createServer').mockImplementation(() => server as unknown as Server);
    jest.spyOn(http2, 'createServer').mockImplementation(() => server as unknown as Http2Server);

    app.listen(3000, '0.0.0.0', listenCallback);
    app.close(closeCallback);

    expect(listenCallback).toBeCalled();
    expect(closeCallback).toBeCalled();
  });

  it('should call all plugins pre/post in request handler pipeline', async () => {
    const app = guarapi();
    const server = createServer({}, app);

    const pluginOne = jest.fn();

    const pluginTwoPreHandler = jest.fn();
    const pluginTwo = () => ({
      name: 'Plugin Two',
      pre: (req, res, next) => {
        pluginTwoPreHandler();
        next();
      },
    });

    const pluginThreePostHandler = jest.fn();
    const pluginThree = () => ({
      name: 'Plugin Three',
      post: (req, res, next) => {
        pluginThreePostHandler();
        next();
      },
    });

    app.plugin(pluginThree);
    app.plugin(pluginTwo);
    app.plugin(pluginOne);

    app.plugin(middlewarePlugin);
    app.use(async (req, res) => {
      res.end('ok');
    });
    await request(server).get('/');

    expect(pluginThreePostHandler).toBeCalledTimes(1);
    expect(pluginTwoPreHandler).toBeCalledTimes(1);
    expect(pluginOne).toBeCalledTimes(1);
  });

  it('should app throw err trying to use plugins not applyed', () => {
    const app = guarapi();

    expect(() => app.logger('info', 'No info')).toThrow();
    expect(() => app.use(() => {})).toThrow();
  });

  it('should app works with https server', async () => {
    const serverOptions = { isSSL: true, cert: certPem, key: keyPem };
    const app = guarapi();
    const server = createServer(serverOptions, app);
    const httpVersion = jest.fn();

    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

    app.plugin(middlewarePlugin);
    app.use((req, res) => {
      httpVersion(req.httpVersion);
      res.end('ok');
    });

    await request(server).get('/').set('Host', 'localhost');

    expect(httpVersion).toBeCalledWith('1.1');
  });

  it('should app works with http2 ssl server', async () => {
    const serverOptions: ServerOptions = { isHTTP2: true, isSSL: true, cert: certPem, key: keyPem };
    const app = guarapi();
    const server = createServer(serverOptions, app);
    const httpVersion = jest.fn();

    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

    app.plugin(middlewarePlugin);
    app.use((req, res) => {
      httpVersion(req.httpVersion);
      res.end('ok');
    });

    await request(server, { http2: true }).get('/').set('Host', 'localhost');

    expect(httpVersion).toBeCalledWith('2.0');
  });
});
