import { Middleware, MiddlewareError, Request, Response } from '../types';

function nextPipeline(
  arr: (Middleware | MiddlewareError)[],
  req: Request,
  res: Response,
  error?: unknown,
  done: (error?: unknown) => void = () => {},
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
            done(err);
            return;
          }

          next(index + 1);
        });
      }
    } else {
      done(error);
      return;
    }
  }

  next(0);
}
export default nextPipeline;
