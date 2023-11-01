import request from 'supertest';
import guarapi, { createServer, loggerPlugin, middlewarePlugin } from '../../src';

describe('Guarapi - plugins/logger', () => {
  const buildApp = () => {
    const app = guarapi();
    const server = createServer({}, app);

    app.plugin(middlewarePlugin);
    app.plugin(loggerPlugin);

    return { app, server };
  };

  beforeEach(() => {
    jest.useFakeTimers();
    jest.clearAllMocks();
    jest.resetAllMocks();
    jest.restoreAllMocks();
  });

  it('should log info request', async () => {
    const { app, server } = buildApp();
    const now = new Date('2023-09-01T22:16:17.203Z');
    const expectedText = `"${now.toISOString()}";"REQUEST";"info";"GET";"/";""\n`;

    jest.setSystemTime(now);
    jest.spyOn(process.stdout, 'write').mockImplementation(() => true);

    app.use(async (req, res) => {
      res.end('ok');
    });
    await request(server).get('/');

    expect(process.stdout.write).toBeCalledWith(expectedText);
  });

  it('should log error request', async () => {
    const { app, server } = buildApp();
    const now = new Date('2023-09-01T22:16:17.203Z');
    const expectedErrorText = `"${now.toISOString()}";"REQUEST";"error";"GET";"/";""\n`;
    const expectedRequestLogText = `"${now.toISOString()}";"REQUEST";"info";"GET";"/";""\n`;

    jest.setSystemTime(now);
    jest.spyOn(process.stdout, 'write').mockImplementation(() => true);
    jest.spyOn(process.stderr, 'write').mockImplementation(() => true);

    app.use(() => {
      throw new Error('Somethig goes wrong');
    });

    await request(server).get('/');

    expect(process.stderr.write).toBeCalledWith(expectedErrorText);
    expect(process.stdout.write).toBeCalledWith(expectedRequestLogText);
  });

  it('should log debug text', async () => {
    const { app, server } = buildApp();
    const now = new Date('2023-09-01T22:16:17.203Z');
    const debugText = 'My debug text';
    const expectedTextOne = `"${now.toISOString()}";"DEBUG";"info";"${debugText}"\n`;
    const expectedTextTwo = `"${now.toISOString()}";"REQUEST";"info";"GET";"/";""\n`;

    jest.setSystemTime(now);
    jest.spyOn(process.stdout, 'write').mockImplementation(() => true);

    app.use(async (req, res) => {
      app.logger('info', debugText);
      res.end();
    });
    await request(server).get('/');

    expect(process.stdout.write).toHaveBeenNthCalledWith(1, expectedTextOne);
    expect(process.stdout.write).toHaveBeenNthCalledWith(2, expectedTextTwo);
    expect(process.stdout.write).toBeCalledTimes(2);
  });
});
