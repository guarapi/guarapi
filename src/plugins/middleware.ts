import { Middleware, Plugin } from '../types';
import nextMiddleware from '../next';

declare module '../types' {
  interface Guarapi {
    use: (middleware: Middleware) => void;
  }
}

const middlewarePlugin: Plugin = (app) => {
  const middlewares: Middleware[] = [];

  Object.defineProperty(app, 'use', {
    value: (middleware: Middleware) => {
      middlewares.push(middleware);
    },
  });

  return {
    name: 'middleware',
    pre: (req, res) => {
      nextMiddleware(middlewares, req, res);
    },
  };
};

export default middlewarePlugin;
