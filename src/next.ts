import { IncomingMessage, ServerResponse } from 'node:http';
import { Middleware } from './types';

export default function nextMiddleware<T extends Middleware>(
  arr: T[],
  req: IncomingMessage,
  res: ServerResponse,
) {
  function next(index: number) {
    const callback = arr[index];

    if (callback) {
      callback(req, res, () => next(index + 1));
    }

    if (index < arr.length) {
      next(index + 1);
    }
  }

  next(0);
}
