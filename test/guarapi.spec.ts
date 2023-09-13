import http, { Server } from 'node:http';
import request from 'supertest';
import guarapi, { middlewarePlugin } from '../src/index';
import type { GuarapiConfig } from '../src/types';

describe('Guarapi', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetAllMocks();
    jest.restoreAllMocks();
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
    const config: GuarapiConfig = {
      logger: () => null,
    };
    const app = guarapi(config);
    expect(app).toHaveProperty('logger');
    expect(app).toHaveProperty('listen');
  });

  it('should app call listen callback', () => {
    const config: GuarapiConfig = {
      logger: () => null,
    };
    const app = guarapi(config);
    const listenCallback = jest.fn();
    const server = {
      listen: jest.fn((_port?: number, _host?: string, cb?: () => void) => cb && cb()),
    };
    jest.spyOn(http, 'createServer').mockImplementation(() => server as unknown as Server);
    app.listen(3000, '0.0.0.0', listenCallback);
    expect(listenCallback).toBeCalled();
  });

  it('should call all plugins pre/post in request handler pipeline', async () => {
    const app = guarapi();
    const server = http.createServer(app);

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
});
