import http from 'node:http';
import request from 'supertest';
import guarapi, { routerPlugin, Router, routes } from '../../src';

describe('Guarapi - plugins/router', () => {
  const buildApp = () => {
    const app = guarapi();
    const server = http.createServer(app);

    app.plugin(routerPlugin);

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
});
