import http, { Server } from 'node:http';
import guarapi from '../src/index';
import type { GuarapiConfig } from '../src/types';

describe('Guarapi', () => {
  afterAll(() => {
    jest.clearAllMocks();
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
});
