import request from 'supertest';
import guarapi, { createServer, middlewarePlugin } from '../../src/index';
import { MiddlewareError, Plugin } from '../../src/types';

describe('Guarapi - plugins/middleware', () => {
  const buildApp = (plugins = [middlewarePlugin]) => {
    const app = guarapi();
    const server = createServer({}, app);

    plugins.forEach((plugin) => {
      app.plugin(plugin);
    });

    return { app, server };
  };

  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetAllMocks();
    jest.restoreAllMocks();
  });

  it('should run pipeline', async () => {
    const { app, server } = buildApp();
    const middlewareOne = jest.fn();
    const middlewareTwo = jest.fn();

    app.use((req, res, next) => {
      middlewareOne();
      next();
    });

    app.use((req, res, next) => {
      middlewareTwo();
      next();
    });

    app.use((req, res) => {
      res.end('ok');
    });

    await request(server).get('/');

    expect(middlewareOne).toBeCalledTimes(1);
    expect(middlewareTwo).toBeCalledTimes(1);
  });

  it('should run pipeline with async middlewares', async () => {
    const { app, server } = buildApp();
    const middlewareOne = jest.fn();
    const middlewareTwo = jest.fn();

    app.use((req, res, next) => {
      middlewareOne();
      next();
    });

    app.use(async (req, res, next) => {
      await new Promise((resolve) => setTimeout(resolve));
      middlewareTwo();
      next();
    });

    app.use((req, res) => {
      res.end('ok');
    });

    await request(server).get('/');

    expect(middlewareOne).toBeCalledTimes(1);
    expect(middlewareTwo).toBeCalledTimes(1);
  });

  it('should run pipeline with throw error handle', async () => {
    const { app, server } = buildApp();
    const middlewareOne = jest.fn();
    const middlewareTwo = jest.fn();
    const middlewareThree = jest.fn();
    const middlewareFour = jest.fn();

    jest.spyOn(console, 'error').mockImplementation(() => {});

    app.use((req, res, next) => {
      middlewareOne();
      next();
    });

    app.use(() => {
      throw new Error('You should catch errors and pass in next function');
    });

    app.use((req, res, next) => {
      middlewareTwo();
      next();
    });

    app.use((req, res) => {
      middlewareThree();
      res.end('ok');
    });

    app.use<MiddlewareError>((error, req, res, _next) => {
      middlewareFour(error);
      res.end('ERROR');
    });

    await request(server).get('/');

    expect(console.error).toBeCalledWith('Unhandled sync rejection detected');
    expect(middlewareOne).toBeCalledTimes(1);
    expect(middlewareTwo).not.toBeCalled();
    expect(middlewareThree).not.toBeCalled();
    expect(middlewareFour).toBeCalledTimes(1);
    expect(middlewareFour).toBeCalledWith(
      new Error('You should catch errors and pass in next function'),
    );
  });

  it('should run pipeline with next param error handle', async () => {
    const { app, server } = buildApp();
    const middlewareOne = jest.fn();
    const middlewareTwo = jest.fn();
    const middlewareThree = jest.fn();
    const middlewareFour = jest.fn();

    app.use((req, res, next) => {
      middlewareOne();
      next();
    });

    app.use((_req, _res, next) => {
      next(new Error('Unexpected error'));
    });

    app.use((req, res, next) => {
      middlewareTwo();
      next();
    });

    app.use((req, res) => {
      middlewareThree();
      res.end('ok');
    });

    app.use<MiddlewareError>((error, req, res, _next) => {
      middlewareFour();
      res.end('ERROR');
    });

    await request(server).get('/');

    expect(middlewareOne).toBeCalledTimes(1);
    expect(middlewareTwo).not.toBeCalledTimes(1);
    expect(middlewareThree).not.toBeCalledTimes(1);
    expect(middlewareFour).toBeCalledTimes(1);
  });

  it('should plugins pipeline not break if it has no final middleware', async () => {
    const { app, server } = buildApp();
    const pluginOneHandler = jest.fn();
    const pluginOne: Plugin = () => ({
      name: 'plugin one',
      pre: (req, res) => {
        pluginOneHandler();
        res.end('ok');
      },
    });

    app.plugin(pluginOne);

    app.use((req, res, next) => {
      next();
    });

    await request(server).get('/');

    expect(pluginOneHandler).toBeCalledTimes(1);
  });

  it('should pipeline not break without req.url', async () => {
    const { app, server } = buildApp([]);
    const pluginOneHandler = jest.fn();

    app.plugin(() => ({
      name: 'remove req.url plugin',
      pre: (req, res, next) => {
        delete req.url;
        next();
      },
    }));

    app.plugin(middlewarePlugin);

    app.use((req, res) => {
      pluginOneHandler(req.url);
      res.end();
    });

    await request(server).get('/').expect(200);

    expect(pluginOneHandler).toBeCalledTimes(1);
    expect(pluginOneHandler).toBeCalledWith(undefined);
  });
});
