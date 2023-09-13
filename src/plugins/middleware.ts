import { Middleware, MiddlewareError, Plugin } from '../types';
import nextMiddleware from '../lib/next-pipeline';

declare module '../types' {
  interface Guarapi {
    use: <T extends Middleware | MiddlewareError>(middleware: T) => void;
  }
}

function getArgsLength<T = () => void>(fn: T) {
  if (!fn) return 0;

  return (
    fn
      .toString()
      .replace(/\s+/g, '')
      .match(/\((.*?)\)/)?.[1] || ''
  ).split(',').length;
}

const middlewarePlugin: Plugin = (app) => {
  const middlewares: Middleware[] = [];
  const errorMiddlewares: MiddlewareError[] = [];

  Object.defineProperty(app, 'use', {
    value: (middleware: Middleware | MiddlewareError) => {
      if (getArgsLength(middleware) <= 3) {
        middlewares.push(middleware as Middleware);
      } else {
        errorMiddlewares.push(middleware as MiddlewareError);
      }
    },
  });

  return {
    name: 'middleware',
    pre: (req, res, next) => {
      const finalSuccessHandler: Middleware = () => {
        next();
      };

      nextMiddleware([...middlewares, finalSuccessHandler], req, res);
    },
    error: (error, req, res) => {
      const finalErrorHandler: MiddlewareError = (error) => {
        res.end(JSON.stringify({ error }));
      };

      nextMiddleware([...errorMiddlewares, finalErrorHandler], req, res, error);
    },
  };
};

export default middlewarePlugin;
