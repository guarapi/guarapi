import request from 'supertest';
import guarapi, {
  MiddlewareError,
  bodyParserPlugin,
  createServer,
  middlewarePlugin,
} from '../../src';

describe('Guarapi - plugins/body-parser', () => {
  const buildApp = () => {
    const app = guarapi({ maxPayloadSize: 1000 });
    const server = createServer({}, app);

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

    app.use<MiddlewareError>((error, req, res, _next) => {
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

  it('should parse x-www-form-urlencoded with malicious data', async () => {
    const { app, server } = buildApp();
    const body = jest.fn();
    const maliciousPayload = "name=John&age=30&comment=<script>alert('XSS!')</script>";

    app.use((req, res) => {
      body(req.body);
      res.end();
    });

    await request(server)
      .post('/')
      .set('Content-type', 'application/x-www-form-urlencoded')
      .send(maliciousPayload)
      .expect(200);

    expect(body).toBeCalledWith({
      age: '30',
      comment: "<script>alert('XSS!')</script>",
      name: 'John',
    });
  });

  it('should handle x-www-form-urlencoded with invalid UTF-8 characters', async () => {
    const { app, server } = buildApp();
    const body = jest.fn();
    const invalidPayload = 'name=John&age=30&comment=\uD800\uDC00';

    app.use((req, res) => {
      body(req.body);
      res.end();
    });

    await request(server)
      .post('/')
      .set('Content-type', 'application/x-www-form-urlencoded')
      .send(invalidPayload)
      .expect(200);

    expect(body).toBeCalledWith({ age: '30', comment: '𐀀', name: 'John' });
  });

  it('should handle malformed x-www-form-urlencoded data', async () => {
    const { app, server } = buildApp();
    const bodyHandler = jest.fn();
    const errorHandler = jest.fn();
    const malformedPayload = 'name=Guarapi%7D%20%7Bmalformed=true';

    app.use((req, res) => {
      bodyHandler(req.body);
      res.end();
    });

    app.use<MiddlewareError>((error, req, res, _next) => {
      errorHandler();
      res.end();
    });

    await request(server)
      .post('/')
      .set('Content-type', 'application/x-www-form-urlencoded')
      .send(malformedPayload)
      .expect(200);

    expect(bodyHandler).toBeCalledWith({ name: 'Guarapi} {malformed=true' });
    expect(errorHandler).not.toBeCalled();
  });

  it('should handle x-www-form-urlencoded with payload overflow', async () => {
    const { app, server } = buildApp();
    const bodyHandler = jest.fn();
    const errorHandler = jest.fn();

    const largePayload = 'name=' + 'A'.repeat(1000000);

    app.use((req, res) => {
      bodyHandler(req.body);
      res.end();
    });

    app.use<MiddlewareError>((error, req, res, _next) => {
      errorHandler();
      res.status(400).send('Payload too large');
      res.end();
    });

    const response = await request(server)
      .post('/')
      .set('Content-type', 'application/x-www-form-urlencoded')
      .send(largePayload)
      .expect(400);

    expect(bodyHandler).not.toBeCalled();
    expect(errorHandler).toBeCalled();
    expect(response.text).toBe('Payload too large');
  });
});
