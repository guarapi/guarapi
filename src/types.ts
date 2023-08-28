import { IncomingMessage, ServerResponse } from 'node:http';

export type HttpListen = (port: number, host: string, callback?: () => void) => void;

export type HttpClose = (callback?: () => void) => void;

export type GuarapiLogger = (lvl: 'info' | 'error', data: string | IncomingMessage) => void;

export interface Guarapi {
  (req: IncomingMessage, res: ServerResponse): void;
  logger: GuarapiLogger;
  listen: HttpListen;
  close: HttpClose;
}

export interface GuarapiConfig {
  logger?: GuarapiLogger;
}
