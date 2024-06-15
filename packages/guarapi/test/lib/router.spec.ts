import { request } from '../utils';
import guarapi, {
  GuarapiConfig,
  MiddlewareError,
  Router,
  createServer,
  middlewarePlugin,
} from '../../src';

describe('Guarapi - lib/router', () => {
  const buildApp = (options?: GuarapiConfig) => {
    const app = guarapi(options);
    const server = createServer(options?.serverOptions || {}, app);

    app.plugin(middlewarePlugin);

    return { app, server };
  };

  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetAllMocks();
    jest.restoreAllMocks();
  });

  it('should dispatch a route', async () => {
    const http1 = buildApp();
    const http2 = buildApp({ serverOptions: { isHTTP2: true } });
    const routerHttp1 = Router();
    const routerHttp2 = Router();
    const routeHandlerHttp1 = jest.fn();
    const routeHandlerHttp2 = jest.fn();

    routerHttp1.get('/', (req, res) => {
      routeHandlerHttp1();
      res.end('ok');
    });

    routerHttp2.get('/', (req, res) => {
      routeHandlerHttp2();
      res.end('ok');
    });

    http1.app.use(routerHttp1);
    http2.app.use(routerHttp2);

    await request(http1.server).get('/').expect(200);
    await request(http2.server, { http2: true }).get('/').expect(200);

    expect(routeHandlerHttp1).toHaveBeenCalledTimes(1);
    expect(routeHandlerHttp2).toHaveBeenCalledTimes(1);
  });

  it('should dispatch a deep path route', async () => {
    const http1 = buildApp();
    const http2 = buildApp({ serverOptions: { isHTTP2: true } });
    const routerHttp1 = Router();
    const routerHttp2 = Router();
    const routeHandlerHttp1 = jest.fn();
    const routeHandlerHttp2 = jest.fn();

    routerHttp1.get('/deep/path/route', (req, res) => {
      routeHandlerHttp1();
      res.end('ok');
    });

    routerHttp2.get('/deep/path/route', (req, res) => {
      routeHandlerHttp2();
      res.end('ok');
    });

    http1.app.use(routerHttp1);
    http2.app.use(routerHttp2);

    await request(http1.server).get('/deep/path/route').expect(200);
    await request(http2.server, { http2: true }).get('/deep/path/route').expect(200);

    expect(routeHandlerHttp1).toHaveBeenCalledTimes(1);
    expect(routeHandlerHttp2).toHaveBeenCalledTimes(1);
  });

  it('should dispatch a route with middleware path', async () => {
    const http1 = buildApp();
    const http2 = buildApp({ serverOptions: { isHTTP2: true } });
    const routerHttp1 = Router();
    const routerHttp2 = Router();
    const routeHandlerHttp1 = jest.fn();
    const routeHandlerHttp2 = jest.fn();

    routerHttp1.get('/', (req, res) => {
      routeHandlerHttp1();
      res.end('ok');
    });

    routerHttp2.get('/', (req, res) => {
      routeHandlerHttp2();
      res.end('ok');
    });

    http1.app.use('/user', routerHttp1);
    http2.app.use('/user', routerHttp2);

    await request(http1.server).get('/user').expect(200);
    await request(http2.server, { http2: true }).get('/user').expect(200);

    expect(routeHandlerHttp1).toHaveBeenCalledTimes(1);
    expect(routeHandlerHttp2).toHaveBeenCalledTimes(1);
  });

  it('should dispatch a route with multiple handlers', async () => {
    const http1 = buildApp();
    const http2 = buildApp({ serverOptions: { isHTTP2: true } });
    const routerHttp1 = Router();
    const routerHttp2 = Router();
    const routeHandlerOneHttp1 = jest.fn();
    const routeHandlerTwoHttp1 = jest.fn();
    const routeHandlerOneHttp2 = jest.fn();
    const routeHandlerTwoHttp2 = jest.fn();

    routerHttp1.get(
      '/',
      (req, res, next) => {
        routeHandlerOneHttp1();
        next();
      },
      (req, res) => {
        routeHandlerTwoHttp1();
        res.end('ok');
      },
    );

    routerHttp2.get(
      '/',
      (req, res, next) => {
        routeHandlerOneHttp2();
        next();
      },
      (req, res) => {
        routeHandlerTwoHttp2();
        res.end('ok');
      },
    );

    http1.app.use('/user', routerHttp1);
    http2.app.use('/user', routerHttp2);

    await request(http1.server).get('/user').expect(200);
    await request(http2.server, { http2: true }).get('/user').expect(200);

    expect(routeHandlerOneHttp1).toHaveBeenCalledTimes(1);
    expect(routeHandlerTwoHttp1).toHaveBeenCalledTimes(1);
    expect(routeHandlerOneHttp2).toHaveBeenCalledTimes(1);
    expect(routeHandlerTwoHttp2).toHaveBeenCalledTimes(1);
  });

  it('should dispatch a deep path route with middleware deep path', async () => {
    const http1 = buildApp();
    const http2 = buildApp({ serverOptions: { isHTTP2: true } });
    const routerHttp1 = Router();
    const routerHttp2 = Router();
    const routeHandlerHttp1 = jest.fn();
    const routeHandlerHttp2 = jest.fn();

    routerHttp1.get('/route/deep/path', (req, res) => {
      routeHandlerHttp1();
      res.end('ok');
    });

    routerHttp2.get('/route/deep/path', (req, res) => {
      routeHandlerHttp2();
      res.end('ok');
    });

    http1.app.use('/middleware/deep/path', routerHttp1);
    http2.app.use('/middleware/deep/path', routerHttp2);

    await request(http1.server).get('/middleware/deep/path/route/deep/path').expect(200);
    await request(http2.server, { http2: true })
      .get('/middleware/deep/path/route/deep/path')
      .expect(200);

    expect(routeHandlerHttp1).toHaveBeenCalledTimes(1);
    expect(routeHandlerHttp2).toHaveBeenCalledTimes(1);
  });

  it('should not dispatch a route with middleware path', async () => {
    const http1 = buildApp();
    const http2 = buildApp({ serverOptions: { isHTTP2: true } });
    const routerHttp1 = Router();
    const routerHttp2 = Router();
    const routeHandlerHttp1 = jest.fn();
    const routeHandlerHttp2 = jest.fn();

    routerHttp1.get('/', (req, res) => {
      routeHandlerHttp1();
      res.end('ok');
    });

    routerHttp2.get('/', (req, res) => {
      routeHandlerHttp2();
      res.end('ok');
    });

    http1.app.use('/no-match', routerHttp1);
    http2.app.use('/no-match', routerHttp2);

    http1.app.use((_req, res) => {
      res.end();
    });

    http2.app.use((_req, res) => {
      res.end();
    });

    await request(http1.server).get('/').expect(200);
    await request(http2.server, { http2: true }).get('/').expect(200);

    expect(routeHandlerHttp1).not.toBeCalled();
    expect(routeHandlerHttp2).not.toBeCalled();
  });

  it('should run routes in pipeline', async () => {
    const http1 = buildApp();
    const http2 = buildApp({ serverOptions: { isHTTP2: true } });
    const routerHttp1 = Router();
    const routerHttp2 = Router();
    const routeHandlerOneHttp1 = jest.fn();
    const routeHandlerTwoHttp1 = jest.fn();
    const routeHandlerOneHttp2 = jest.fn();
    const routeHandlerTwoHttp2 = jest.fn();

    routerHttp1.get('/', (req, res, next) => {
      routeHandlerOneHttp1();
      next();
    });

    routerHttp1.get('/', (req, res) => {
      routeHandlerTwoHttp1();
      res.end('ok');
    });

    routerHttp2.get('/', (req, res, next) => {
      routeHandlerOneHttp2();
      next();
    });

    routerHttp2.get('/', (req, res) => {
      routeHandlerTwoHttp2();
      res.end('ok');
    });

    http1.app.use(routerHttp1);
    http2.app.use(routerHttp2);

    await request(http1.server).get('/').expect(200);
    await request(http2.server, { http2: true }).get('/').expect(200);

    expect(routeHandlerOneHttp1).toHaveBeenCalledTimes(1);
    expect(routeHandlerTwoHttp1).toHaveBeenCalledTimes(1);
    expect(routeHandlerOneHttp2).toHaveBeenCalledTimes(1);
    expect(routeHandlerTwoHttp2).toHaveBeenCalledTimes(1);
  });

  it('should run async routes in pipeline', async () => {
    const http1 = buildApp();
    const http2 = buildApp({ serverOptions: { isHTTP2: true } });
    const routerHttp1 = Router();
    const routerHttp2 = Router();
    const routeHandlerOneHttp1 = jest.fn();
    const routeHandlerTwoHttp1 = jest.fn();
    const routeHandlerOneHttp2 = jest.fn();
    const routeHandlerTwoHttp2 = jest.fn();

    routerHttp1.get('/', async (req, res, next) => {
      await new Promise((resolve) => setTimeout(resolve));
      routeHandlerOneHttp1();
      next();
    });

    routerHttp1.get('/', async (req, res) => {
      await new Promise((resolve) => setTimeout(resolve));
      routeHandlerTwoHttp1();
      res.end('ok');
    });

    routerHttp2.get('/', async (req, res, next) => {
      await new Promise((resolve) => setTimeout(resolve));
      routeHandlerOneHttp2();
      next();
    });

    routerHttp2.get('/', async (req, res) => {
      await new Promise((resolve) => setTimeout(resolve));
      routeHandlerTwoHttp2();
      res.end('ok');
    });

    http1.app.use(routerHttp1);
    http2.app.use(routerHttp2);

    await request(http1.server).get('/').expect(200);
    await request(http2.server, { http2: true }).get('/').expect(200);

    expect(routeHandlerOneHttp1).toHaveBeenCalledTimes(1);
    expect(routeHandlerTwoHttp1).toHaveBeenCalledTimes(1);
    expect(routeHandlerOneHttp2).toHaveBeenCalledTimes(1);
    expect(routeHandlerTwoHttp2).toHaveBeenCalledTimes(1);
  });

  it('should route pass error in next function', async () => {
    const http1 = buildApp();
    const http2 = buildApp({ serverOptions: { isHTTP2: true } });
    const routerHttp1 = Router();
    const routerHttp2 = Router();
    const routeHandlerOneHttp1 = jest.fn();
    const routeHandlerTwoHttp1 = jest.fn();
    const routeHandlerOneHttp2 = jest.fn();
    const routeHandlerTwoHttp2 = jest.fn();

    routerHttp1.get('/', (req, res, next) => {
      routeHandlerOneHttp1();
      next(new Error('Internal server error'));
    });

    routerHttp1.get('/', () => {
      routeHandlerTwoHttp1();
    });

    routerHttp2.get('/', (req, res, next) => {
      routeHandlerOneHttp2();
      next(new Error('Internal server error'));
    });

    routerHttp2.get('/', () => {
      routeHandlerTwoHttp2();
    });

    http1.app.use(routerHttp1);
    http2.app.use(routerHttp2);

    await request(http1.server).get('/').expect(500);
    await request(http2.server, { http2: true }).get('/').expect(500);

    expect(routeHandlerOneHttp1).toHaveBeenCalledTimes(1);
    expect(routeHandlerTwoHttp1).not.toBeCalled();
    expect(routeHandlerOneHttp2).toHaveBeenCalledTimes(1);
    expect(routeHandlerTwoHttp2).not.toBeCalled();
  });

  it('should route with unhandled sync errors', async () => {
    const http1 = buildApp();
    const http2 = buildApp({ serverOptions: { isHTTP2: true } });
    const routerHttp1 = Router();
    const routerHttp2 = Router();
    const routeHandlerOneHttp1 = jest.fn();
    const routeHandlerTwoHttp1 = jest.fn();
    const routeHandlerOneHttp2 = jest.fn();
    const routeHandlerTwoHttp2 = jest.fn();

    jest.spyOn(console, 'error').mockImplementation(() => {});

    routerHttp1.get('/', () => {
      routeHandlerOneHttp1();
      throw new Error('Internal server error');
    });

    routerHttp1.get('/', () => {
      routeHandlerTwoHttp1();
    });

    routerHttp2.get('/', () => {
      routeHandlerOneHttp2();
      throw new Error('Internal server error');
    });

    routerHttp2.get('/', () => {
      routeHandlerTwoHttp2();
    });

    http1.app.use(routerHttp1);
    http2.app.use(routerHttp2);

    await request(http1.server).get('/').expect(200);
    await request(http2.server, { http2: true }).get('/').expect(200);

    expect(console.error).not.toHaveBeenCalledWith('Unhandled sync rejection detected');
    expect(routeHandlerOneHttp1).toHaveBeenCalledTimes(1);
    expect(routeHandlerTwoHttp1).not.toBeCalled();
    expect(routeHandlerOneHttp2).toHaveBeenCalledTimes(1);
    expect(routeHandlerTwoHttp2).not.toBeCalled();
  });

  it('should route with params', async () => {
    const http1 = buildApp();
    const http2 = buildApp({ serverOptions: { isHTTP2: true } });
    const router = Router();
    const routeParams = jest.fn();

    router.get('/user/:user_id', (req, res) => {
      routeParams(req.params);
      res.end();
    });

    http1.app.use(router);
    http2.app.use(router);

    await request(http1.server).get('/user/user-id-1').expect(200);
    await request(http2.server, { http2: true }).get('/user/user-id-1').expect(200);

    expect(routeParams).toHaveBeenCalledTimes(2);
    expect(routeParams).toHaveBeenCalledWith({ user_id: 'user-id-1' });
  });

  it('should route with wildcard params', async () => {
    const http1 = buildApp();
    const http2 = buildApp({ serverOptions: { isHTTP2: true } });
    const router = Router();
    const routeParams = jest.fn();

    router.get('/:path*', (req, res) => {
      routeParams(req.params);
      res.end();
    });

    http1.app.use(router);
    http2.app.use(router);

    await request(http1.server).get('/deep/path/name').expect(200);
    await request(http2.server, { http2: true }).get('/deep/path/name').expect(200);

    expect(routeParams).toHaveBeenCalledTimes(2);
    expect(routeParams).toHaveBeenCalledWith({ path: ['deep', 'path', 'name'] });
  });

  it('should route with queryString', async () => {
    const http1 = buildApp();
    const http2 = buildApp({ serverOptions: { isHTTP2: true } });
    const router = Router();
    const routeQueryString = jest.fn();

    router.get('/', (req, res) => {
      routeQueryString(req.query);
      res.end();
    });

    http1.app.use(router);
    http2.app.use(router);

    await request(http1.server).get('/?my-query-string').expect(200);
    await request(http2.server, { http2: true }).get('/?my-query-string').expect(200);

    expect(routeQueryString).toHaveBeenCalledTimes(2);
    expect(routeQueryString).toHaveBeenCalledWith(new URLSearchParams({ 'my-query-string': '' }));
  });

  it('should route with params and queryString', async () => {
    const http1 = buildApp();
    const http2 = buildApp({ serverOptions: { isHTTP2: true } });
    const router = Router();
    const routeParams = jest.fn();
    const routeQueryString = jest.fn();

    router.get('/user/:user_id', (req, res) => {
      routeParams(req.params);
      routeQueryString(req.query);
      res.end();
    });

    http1.app.use(router);
    http2.app.use(router);

    await request(http1.server).get('/user/user-id-1?my-query-string').expect(200);
    await request(http2.server, { http2: true }).get('/user/user-id-1?my-query-string').expect(200);

    expect(routeParams).toHaveBeenCalledTimes(2);
    expect(routeQueryString).toHaveBeenCalledTimes(2);
    expect(routeParams).toHaveBeenCalledWith({ user_id: 'user-id-1' });
    expect(routeQueryString).toHaveBeenCalledWith(new URLSearchParams({ 'my-query-string': '' }));
  });

  it('should not match route', async () => {
    const http1 = buildApp();
    const http2 = buildApp({ serverOptions: { isHTTP2: true } });
    const router = Router();
    const routeOne = jest.fn();

    router.get('/not/match/route', (req, res) => {
      routeOne();
      res.end();
    });

    http1.app.use(router);
    http2.app.use(router);

    await request(http1.server).get('/match/route').expect(404);
    await request(http2.server, { http2: true }).get('/match/route').expect(404);

    expect(routeOne).not.toBeCalled();
  });

  it('should not has method routes', async () => {
    const http1 = buildApp();
    const http2 = buildApp({ serverOptions: { isHTTP2: true } });
    const router = Router();
    const routeOne = jest.fn();

    router.options('/not/match/route', (req, res) => {
      routeOne();
      res.end();
    });

    http1.app.use(router);
    http2.app.use(router);

    await request(http1.server).delete('/not/match/route').expect(404);
    await request(http2.server, { http2: true }).delete('/not/match/route').expect(404);

    expect(routeOne).not.toBeCalled();
  });

  it('should error middleware catch 404 error', async () => {
    const http1 = buildApp();
    const http2 = buildApp({ serverOptions: { isHTTP2: true } });
    const router = Router();
    const routeOne = jest.fn();
    const catchError = jest.fn();

    router.options('/not/match/route', (req, res) => {
      routeOne();
      res.end();
    });

    http1.app.use(router);
    http2.app.use(router);

    http1.app.use<MiddlewareError>((error, _req, res, _next) => {
      catchError((error as Error).message);
      res.end();
    });

    http2.app.use<MiddlewareError>((error, _req, res, _next) => {
      catchError((error as Error).message);
      res.end();
    });

    await request(http1.server).delete('/not/match/route').expect(404);
    await request(http2.server, { http2: true }).delete('/not/match/route').expect(404);

    expect(routeOne).not.toBeCalled();
    expect(catchError).toHaveBeenCalledTimes(2);
    expect(catchError).toHaveBeenCalledWith('Not Found');
  });
});
