import { IncomingMessage, ServerOptions as HTTPServerOptions, ServerResponse } from 'node:http';
import { SecureServerOptions as HTTP2SecureServerOptions } from 'node:http2';

export type HttpListen = (port: number, host: string, callback?: () => void) => void;

export type HttpClose = (callback?: () => void) => void;

export type GuarapiLogger = (lvl: 'info' | 'error', data: string | Request) => void;

export type Params = Record<
  string,
  | string
  | number
  | undefined
  | Record<string, string | number | undefined>
  | (string | number | undefined | Record<string, string | number | undefined>)[]
>;
export interface Request extends IncomingMessage {
  params?: Params;
  query?: URLSearchParams;
  middlewarePath?: string;
}

export interface Response extends ServerResponse {}

export interface Middleware {
  (req: Request, res: Response, next: (err?: unknown) => void): void;
}
export interface MiddlewareError {
  (error: unknown, req: Request, res: Response, next: (err?: unknown) => void): void;
}

export interface ServerOptions extends HTTPServerOptions, HTTP2SecureServerOptions {
  isSSL?: boolean;
  isHTTP2?: boolean;
}

export interface GuarapiConfig {
  logger?: GuarapiLogger;
  serverOptions?: ServerOptions;
}

export interface PluginConfig {
  name: string;
  data?: Record<string | number | symbol, unknown>;
  pre?: Middleware;
  post?: Middleware;
  error?: MiddlewareError;
}

export interface Guarapi {
  (req: Request, res: Response): void;
  listen: HttpListen;
  close: HttpClose;
  plugin: (init: (app: Guarapi, config?: GuarapiConfig) => PluginConfig) => void;
}

export type Plugin = (app: Guarapi, config?: GuarapiConfig) => PluginConfig;
