import http from 'node:http';
import request from 'supertest';
import guarapi, { routerPlugin, Router, routes, middlewarePlugin, Plugin } from '../../src';

describe('Guarapi - plugins/router', () => {
  const buildApp = (plugins: Plugin[] = []) => {
    const app = guarapi();
    const server = http.createServer(app);

    app.plugin(routerPlugin);
    plugins.forEach((plugin) => app.plugin(plugin));

    return { app, server };
  };

  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetAllMocks();
    jest.restoreAllMocks();
  });

  afterEach(() => {
    routes.clear();
  });

  it('should add route to Router', async () => {
    Router.get('/', () => {});
    Router.get('/', () => {});

    expect(routes.get('GET')).toHaveLength(2);
  });

  it('should dispatch a route', async () => {
    const { server } = buildApp();
    const routeOne = jest.fn();

    Router.get('/', (req, res) => {
      routeOne();
      res.end('ok');
    });

    await request(server).get('/');

    expect(routeOne).toBeCalledTimes(1);
  });

  it('should run routes in pipeline', async () => {
    const { server } = buildApp();
    const routeOne = jest.fn();
    const routeTwo = jest.fn();

    Router.get('/', (req, res, next) => {
      routeOne();
      next();
    });

    Router.get('/', (req, res) => {
      routeTwo();
      res.end('ok');
    });

    await request(server).get('/');

    expect(routeOne).toBeCalledTimes(1);
    expect(routeTwo).toBeCalledTimes(1);
  });

  it('should run async routes in pipeline', async () => {
    const { server } = buildApp();
    const routeOne = jest.fn();
    const routeTwo = jest.fn();

    Router.get('/', async (req, res, next) => {
      await new Promise((resolve) => setTimeout(resolve));
      routeOne();
      next();
    });

    Router.get('/', async (req, res) => {
      await new Promise((resolve) => setTimeout(resolve));
      routeTwo();
      res.end('ok');
    });

    await request(server).get('/');

    expect(routeOne).toBeCalledTimes(1);
    expect(routeTwo).toBeCalledTimes(1);
  });

  it('should route pass error in next function', async () => {
    const { server } = buildApp();
    const routeOne = jest.fn();
    const routeTwo = jest.fn();

    Router.get('/', (req, res, next) => {
      routeOne();
      next(new Error('Internal server error'));
    });

    Router.get('/', () => {
      routeTwo();
    });

    await request(server).get('/');

    expect(routeOne).toBeCalledTimes(1);
    expect(routeTwo).not.toBeCalled();
  });

  it('should route with unhandled sync errors', async () => {
    const { server } = buildApp();
    const routeOne = jest.fn();
    const routeTwo = jest.fn();

    jest.spyOn(console, 'error').mockImplementation(() => {});

    Router.get('/', () => {
      routeOne();
      throw new Error('Internal server error');
    });

    Router.get('/', () => {
      routeTwo();
    });

    await request(server).get('/');

    expect(console.error).toBeCalledWith('Unhandled sync rejection detected');
    expect(routeOne).toBeCalledTimes(1);
    expect(routeTwo).not.toBeCalled();
  });

  it('should route with params', async () => {
    const { server } = buildApp();
    const routeParams = jest.fn();

    Router.get('/user/:user_id', (req, res) => {
      routeParams(req.params);
      res.end();
    });

    await request(server).get('/user/user-id-1');

    expect(routeParams).toBeCalledWith({ user_id: 'user-id-1' });
  });

  it('should route with wildcard params', async () => {
    const { server } = buildApp();
    const routeParams = jest.fn();

    Router.get('/:path*', (req, res) => {
      routeParams(req.params);
      res.end();
    });

    await request(server).get('/deep/path/name');

    expect(routeParams).toBeCalledWith({ path: ['deep', 'path', 'name'] });
  });

  it('should route with queryString', async () => {
    const { server } = buildApp();
    const routeQueryString = jest.fn();

    Router.get('/', (req, res) => {
      routeQueryString(req.query);
      res.end();
    });

    await request(server).get('/?my-query-string');

    expect(routeQueryString).toBeCalledWith(new URLSearchParams({ 'my-query-string': '' }));
  });

  it('should route with params and queryString', async () => {
    const { server } = buildApp();
    const routeParams = jest.fn();
    const routeQueryString = jest.fn();

    Router.get('/user/:user_id', (req, res) => {
      routeParams(req.params);
      routeQueryString(req.query);
      res.end();
    });

    await request(server).get('/user/user-id-1?my-query-string');

    expect(routeParams).toBeCalledWith({ user_id: 'user-id-1' });
    expect(routeQueryString).toBeCalledWith(new URLSearchParams({ 'my-query-string': '' }));
  });

  it('should not match route', async () => {
    const { app, server } = buildApp([middlewarePlugin]);
    const routeOne = jest.fn();

    Router.get('/not/match/route', (req, res) => {
      routeOne();
      res.end();
    });

    app.use((req, res) => {
      res.end();
    });

    await request(server).get('/match/route');

    expect(routeOne).not.toBeCalled();
  });

  it('should not has method routes', async () => {
    const { app, server } = buildApp([middlewarePlugin]);
    const routeOne = jest.fn();

    Router.options('/not/match/route', (req, res) => {
      routeOne();
      res.end();
    });

    app.use((req, res) => {
      res.end();
    });

    await request(server).delete('/match/route');

    expect(routeOne).not.toBeCalled();
  });
});
