import { Middleware, MiddlewareError, Plugin, Request } from '../types';
import nextPipeline from '../lib/next-pipeline';

declare module '../types' {
  interface Guarapi {
    use<T = Middleware>(middleware: T): void;
    use<T = Middleware>(path: string, middleware: T): void;
  }
}

function getArgsLength<T>(fn: T) {
  return (
    (fn as () => void)
      .toString()
      .replace(/\s+/g, '')
      .match(/\((.*?)\)/)?.[1] || ''
  ).split(',').length;
}

const middlewarePlugin: Plugin = (app) => {
  const middlewares: { path: string; handler: Middleware }[] = [];
  const errorMiddlewares: MiddlewareError[] = [];

  function use<P, M>(path: P, middleware?: M): void {
    const middlewarePath = (typeof path === 'string' ? path : '/').replace(/\/?$/, '');
    const middlewareHandler = (typeof path && middleware ? middleware : path) as
      | Middleware
      | MiddlewareError;

    if (getArgsLength(middlewareHandler) <= 3) {
      middlewares.push({
        path: middlewarePath,
        handler: (req, res, next) => {
          req.middlewarePath = middlewarePath;
          (middlewareHandler as Middleware)(req as Request, res, next);
        },
      });
    } else {
      errorMiddlewares.push(middlewareHandler as MiddlewareError);
    }
  }

  function matchMiddlewares(matchPath: string = '') {
    return middlewares.reduce<Middleware[]>((acc, { path, handler }) => {
      if (!matchPath.startsWith(path)) {
        return acc;
      }

      return [...acc, handler];
    }, []);
  }

  Object.defineProperty(app, 'use', {
    value: use,
  });

  return {
    name: 'middleware',
    pre: (req, res, next) => {
      try {
        nextPipeline(matchMiddlewares(req.url!), req, res, null, next);
      } catch (error) {
        next(error);
      }
    },
    error: (error, req, res) => {
      nextPipeline(errorMiddlewares, req, res, error, () => {
        res.end(JSON.stringify({ error }));
      });
    },
  };
};

export default middlewarePlugin;
