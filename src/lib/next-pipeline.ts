import { IncomingMessage, ServerResponse } from 'node:http';
import { Middleware, MiddlewareError } from '../types';

function nextPipeline(
  arr: (Middleware | MiddlewareError)[],
  req: IncomingMessage,
  res: ServerResponse,
  error?: unknown,
) {
  function next(index: number) {
    const callback = arr[index];

    if (callback) {
      if (error) {
        (callback as MiddlewareError)(error, req, res, () => {
          next(index + 1);
        });
      } else {
        (callback as Middleware)(req, res, (err) => {
          if (err) {
            throw err;
          }
          next(index + 1);
        });
      }
    }
  }

  next(0);
}
export default nextPipeline;
