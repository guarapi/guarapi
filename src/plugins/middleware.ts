import { Middleware, MiddlewareError, Plugin } from '../types';
import nextMiddleware from '../next';

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

  const finalErrorHandler: MiddlewareError = (error, req, res, next) => {
    res.end(JSON.stringify(error));
    next();
  };

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
    pre: (req, res) => {
      try {
        nextMiddleware(middlewares, req, res);
      } catch (error) {
        nextMiddleware([...errorMiddlewares, finalErrorHandler], req, res, error);
      }
    },
  };
};

export default middlewarePlugin;
