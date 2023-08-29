import { IncomingMessage, ServerResponse } from 'node:http';

export type HttpListen = (port: number, host: string, callback?: () => void) => void;

export type HttpClose = (callback?: () => void) => void;

export type GuarapiLogger = (lvl: 'info' | 'error', data: string | IncomingMessage) => void;

export type Middleware = (req: IncomingMessage, res: ServerResponse, next: () => void) => void;

export interface GuarapiConfig {
  logger?: GuarapiLogger;
}

export interface PluginConfig {
  name: string;
  data?: Record<string | number | symbol, unknown>;
  pre?: Middleware;
  post?: Middleware;
}

export interface Guarapi {
  (req: IncomingMessage, res: ServerResponse): void;
  listen: HttpListen;
  close: HttpClose;
  plugin: (init: (app: Guarapi, config?: GuarapiConfig) => PluginConfig) => void;
}

export type Plugin = (app: Guarapi, config?: GuarapiConfig) => PluginConfig;
