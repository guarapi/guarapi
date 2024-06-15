import { Server } from 'node:http';
import { generateCertificates, request } from '../utils';
import { ServerOptions } from '../../src';
import createServer from '../../src/lib/create-server';

describe('Guarapi - lib/create-server', () => {
  const env = process.env;
  const { certPem, keyPem } = generateCertificates();

  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
    jest.resetAllMocks();
    jest.restoreAllMocks();
    process.env = { ...env };
  });

  afterEach(() => {
    process.env = env;
  });

  it('should create http1 server with serverOptions defaults', async () => {
    const serverOptions = {};
    const httpVersion = jest.fn();
    const server = createServer(serverOptions, (req, res) => {
      httpVersion(req.httpVersion);
      res.end();
    }) as Server;

    await request(server).get('/');

    expect(httpVersion).toHaveBeenCalledWith('1.1');
  });

  it('should create http2 server', async () => {
    const serverOptions: ServerOptions = { isHTTP2: true };
    const httpVersion = jest.fn();
    const server = createServer(serverOptions, (req, res) => {
      httpVersion(req.httpVersion);
      res.end();
    }) as Server;

    await request(server, { http2: true }).get('/');

    expect(httpVersion).toHaveBeenCalledWith('2.0');
  });

  it('should create ssl http1 server', async () => {
    const serverOptions: ServerOptions = {
      isSSL: true,
      cert: certPem,
      key: keyPem,
    };
    const httpVersion = jest.fn();
    const server = createServer(serverOptions, (req, res) => {
      httpVersion(req.httpVersion);
      res.end();
    }) as Server;

    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
    await request(server).get('/').set('Host', 'localhost');

    expect(httpVersion).toHaveBeenCalledWith('1.1');
  });

  it('should create ssl http2 server', async () => {
    const serverOptions: ServerOptions = {
      isHTTP2: true,
      isSSL: true,
      cert: certPem,
      key: keyPem,
    };
    const httpVersion = jest.fn();
    const server = createServer(serverOptions, (req, res) => {
      httpVersion(req.httpVersion);
      res.end();
    }) as Server;

    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
    await request(server, { http2: true }).get('/').set('Host', 'localhost');

    expect(httpVersion).toHaveBeenCalledWith('2.0');
  });
});
