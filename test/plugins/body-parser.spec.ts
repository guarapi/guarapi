import http from 'node:http';
import request from 'supertest';
import guarapi, { bodyParserPlugin, middlewarePlugin } from '../../src';

describe('Guarapi - plugins/body-parser', () => {
  const buildApp = () => {
    const app = guarapi();
    const server = http.createServer(app);

    app.plugin(bodyParserPlugin);
    app.plugin(middlewarePlugin);

    return { app, server };
  };

  beforeEach(() => {
    jest.useFakeTimers();
    jest.clearAllMocks();
    jest.resetAllMocks();
    jest.restoreAllMocks();
  });

  it('should parse json', async () => {
    const { app, server } = buildApp();
    const body = jest.fn();
    const payload = { a: { b: ['c', 'd', null, true] } };

    app.use((req, res) => {
      body(req.body);
      res.end();
    });

    await request(server)
      .post('/')
      .set('Content-type', 'application/json')
      .send(payload)
      .expect(200);

    expect(body).toBeCalledWith(payload);
  });

  it('should not parse wrong content-type', async () => {
    const { app, server } = buildApp();
    const body = jest.fn();
    const payload = 'name=Guarapi';

    app.use((req, res) => {
      body(req.body);
      res.end();
    });

    await request(server)
      .post('/')
      .set('Content-type', 'multipart/form-data; boundary=X-GUARAPI-BOUNDARY')
      .send(payload)
      .expect(200);

    expect(body).toBeCalledWith(undefined);
  });

  it('should not parse wrong content-type', async () => {
    const { app, server } = buildApp();
    const bodyHandler = jest.fn();
    const errorHandler = jest.fn();
    const payload = '{ name = Guarapi }';

    app.use((req, res) => {
      bodyHandler(req.body);
      res.end();
    });

    app.use((error, req, res, _next) => {
      errorHandler();
      res.end();
    });

    await request(server)
      .post('/')
      .set('Content-type', 'application/json; charset=utf-8')
      .send(payload)
      .expect(200);

    expect(bodyHandler).not.toBeCalled();
    expect(errorHandler).toBeCalled();
  });
});
