import http from 'node:http';
import request from 'supertest';
import guarapi, { Router, middlewarePlugin } from '../../src';

describe('Guarapi - lib/router', () => {
  const buildApp = () => {
    const app = guarapi();
    const server = http.createServer(app);

    app.plugin(middlewarePlugin);

    return { app, server };
  };

  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetAllMocks();
    jest.restoreAllMocks();
  });

  it('should dispatch a route', async () => {
    const { app, server } = buildApp();
    const router = Router();
    const routeOne = jest.fn();

    router.get('/', (req, res) => {
      routeOne();
      res.end('ok');
    });

    app.use(router);

    await request(server).get('/').expect(200);

    expect(routeOne).toBeCalledTimes(1);
  });

  it('should dispatch a deep path route', async () => {
    const { app, server } = buildApp();
    const router = Router();
    const routeOne = jest.fn();

    router.get('/deep/path/route', (req, res) => {
      routeOne();
      res.end('ok');
    });

    app.use(router);

    await request(server).get('/deep/path/route').expect(200);

    expect(routeOne).toBeCalledTimes(1);
  });

  it('should dispatch a route with middleware path', async () => {
    const { app, server } = buildApp();
    const router = Router();
    const routeOne = jest.fn();

    router.get('/', (req, res) => {
      routeOne();
      res.end('ok');
    });

    app.use('/user', router);

    await request(server).get('/user').expect(200);

    expect(routeOne).toBeCalledTimes(1);
  });

  it('should dispatch a deep path route with middleware deep path', async () => {
    const { app, server } = buildApp();
    const router = Router();
    const routeOne = jest.fn();

    router.get('/route/deep/path', (req, res) => {
      routeOne();
      res.end('ok');
    });

    app.use('/middleware/deep/path', router);

    await request(server).get('/middleware/deep/path/route/deep/path').expect(200);

    expect(routeOne).toBeCalledTimes(1);
  });

  it('should not dispatch a route with middleware path', async () => {
    const { app, server } = buildApp();
    const router = Router();
    const routeOne = jest.fn();

    router.get('/', (req, res) => {
      routeOne();
      res.end('ok');
    });

    app.use('/no-match', router);

    app.use((_req, res) => {
      res.end();
    });

    await request(server).get('/').expect(200);

    expect(routeOne).not.toBeCalled();
  });

  it('should run routes in pipeline', async () => {
    const { app, server } = buildApp();
    const router = Router();
    const routeOne = jest.fn();
    const routeTwo = jest.fn();

    router.get('/', (req, res, next) => {
      routeOne();
      next();
    });

    router.get('/', (req, res) => {
      routeTwo();
      res.end('ok');
    });

    app.use(router);

    await request(server).get('/').expect(200);

    expect(routeOne).toBeCalledTimes(1);
    expect(routeTwo).toBeCalledTimes(1);
  });

  it('should run async routes in pipeline', async () => {
    const { app, server } = buildApp();
    const router = Router();
    const routeOne = jest.fn();
    const routeTwo = jest.fn();

    router.get('/', async (req, res, next) => {
      await new Promise((resolve) => setTimeout(resolve));
      routeOne();
      next();
    });

    router.get('/', async (req, res) => {
      await new Promise((resolve) => setTimeout(resolve));
      routeTwo();
      res.end('ok');
    });

    app.use(router);

    await request(server).get('/').expect(200);

    expect(routeOne).toBeCalledTimes(1);
    expect(routeTwo).toBeCalledTimes(1);
  });

  it('should route pass error in next function', async () => {
    const { app, server } = buildApp();
    const router = Router();
    const routeOne = jest.fn();
    const routeTwo = jest.fn();

    router.get('/', (req, res, next) => {
      routeOne();
      next(new Error('Internal server error'));
    });

    router.get('/', () => {
      routeTwo();
    });

    app.use(router);

    await request(server).get('/').expect(500);

    expect(routeOne).toBeCalledTimes(1);
    expect(routeTwo).not.toBeCalled();
  });

  it('should route with unhandled sync errors', async () => {
    const { app, server } = buildApp();
    const router = Router();
    const routeOne = jest.fn();
    const routeTwo = jest.fn();

    jest.spyOn(console, 'error').mockImplementation(() => {});

    router.get('/', () => {
      routeOne();
      throw new Error('Internal server error');
    });

    router.get('/', () => {
      routeTwo();
    });

    app.use(router);

    await request(server).get('/').expect(200);

    expect(console.error).toBeCalledWith('Unhandled sync rejection detected');
    expect(routeOne).toBeCalledTimes(1);
    expect(routeTwo).not.toBeCalled();
  });

  it('should route with params', async () => {
    const { app, server } = buildApp();
    const router = Router();
    const routeParams = jest.fn();

    router.get('/user/:user_id', (req, res) => {
      routeParams(req.params);
      res.end();
    });

    app.use(router);

    await request(server).get('/user/user-id-1').expect(200);

    expect(routeParams).toBeCalledWith({ user_id: 'user-id-1' });
  });

  it('should route with wildcard params', async () => {
    const { app, server } = buildApp();
    const router = Router();
    const routeParams = jest.fn();

    router.get('/:path*', (req, res) => {
      routeParams(req.params);
      res.end();
    });

    app.use(router);

    await request(server).get('/deep/path/name').expect(200);

    expect(routeParams).toBeCalledWith({ path: ['deep', 'path', 'name'] });
  });

  it('should route with queryString', async () => {
    const { app, server } = buildApp();
    const router = Router();
    const routeQueryString = jest.fn();

    router.get('/', (req, res) => {
      routeQueryString(req.query);
      res.end();
    });

    app.use(router);

    await request(server).get('/?my-query-string').expect(200);

    expect(routeQueryString).toBeCalledWith(new URLSearchParams({ 'my-query-string': '' }));
  });

  it('should route with params and queryString', async () => {
    const { app, server } = buildApp();
    const router = Router();
    const routeParams = jest.fn();
    const routeQueryString = jest.fn();

    router.get('/user/:user_id', (req, res) => {
      routeParams(req.params);
      routeQueryString(req.query);
      res.end();
    });

    app.use(router);

    await request(server).get('/user/user-id-1?my-query-string').expect(200);

    expect(routeParams).toBeCalledWith({ user_id: 'user-id-1' });
    expect(routeQueryString).toBeCalledWith(new URLSearchParams({ 'my-query-string': '' }));
  });

  it('should not match route', async () => {
    const { app, server } = buildApp();
    const router = Router();
    const routeOne = jest.fn();

    router.get('/not/match/route', (req, res) => {
      routeOne();
      res.end();
    });

    app.use(router);

    await request(server).get('/match/route').expect(404);

    expect(routeOne).not.toBeCalled();
  });

  it('should not has method routes', async () => {
    const { app, server } = buildApp();
    const router = Router();
    const routeOne = jest.fn();

    router.options('/not/match/route', (req, res) => {
      routeOne();
      res.end();
    });

    app.use(router);

    await request(server).delete('/not/match/route').expect(404);

    expect(routeOne).not.toBeCalled();
  });

  it('should error middleware catch 404 error', async () => {
    const { app, server } = buildApp();
    const router = Router();
    const routeOne = jest.fn();
    const catchError = jest.fn();

    router.options('/not/match/route', (req, res) => {
      routeOne();
      res.end();
    });

    app.use(router);

    app.use((error, _req, res, _next) => {
      catchError((error as Error).message);
      res.end();
    });

    await request(server).delete('/not/match/route').expect(404);

    expect(routeOne).not.toBeCalled();
    expect(catchError).toBeCalledWith('Not Found');
  });
});
