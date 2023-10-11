import nextPipeline from './next-pipeline';
import { Middleware, Params, Request } from '../types';

const BASE_URL = 'http://localhost/';

export enum Methods {
  GET = 'get',
  POST = 'post',
  PUT = 'put',
  PATCH = 'patch',
  DELETE = 'delete',
  HEAD = 'head',
  OPTIONS = 'options',
}

export type MethodsKeys = keyof typeof Methods;

export type RouterAPI = {
  [method in Methods]: (route: string, handler: Middleware) => void;
};

export interface Router extends RouterAPI, Middleware {}

function routerBuilder() {
  const routes = new Map<MethodsKeys, { route: string; handler: Middleware }[]>();

  const extractRouteParams = (route: string, matchedParams?: string[]) => {
    const params: Params = {};
    const paramNames = route.match(/:([^/]+)/g);

    if (paramNames) {
      paramNames.forEach((paramName, index) => {
        const key = paramName.slice(1);
        const value = matchedParams?.[index + 1];

        if (key.endsWith('*')) {
          const wildcardValue = value?.split('/').filter(Boolean);
          params[key.replace('*', '')] = wildcardValue;
        } else {
          params[key] = value;
        }
      });
    }

    return params;
  };

  const matchRoutes = (method: MethodsKeys, url: string) => {
    const methodRoutes = routes.get(method);

    if (methodRoutes) {
      const { pathname, searchParams: query } = new URL(url, BASE_URL);

      return methodRoutes.reduce<Middleware[]>((acc, { route, handler }) => {
        const regex = new RegExp(
          `^${route
            .replace(/(\/:[\w_]+[*])$/, '(/[^/]+.*)')
            .replace(/(:[\w_]+[^*/])/g, '([^/]+)')}$`,
        );

        const match = pathname.match(regex);

        if (match) {
          const params = extractRouteParams(route, match);

          return [
            ...acc,
            (req, res, next) => {
              req.params = params;
              req.query = query;
              handler(req as Request, res, next);
            },
          ];
        }

        return acc;
      }, []);
    }

    return [];
  };

  const Router = function Router(req, res, next) {
    const relativeUrl = req.url!.replace(req.middlewarePath!.replace(/\/?$/, '') || '/', '');
    const handlers = matchRoutes(req.method as MethodsKeys, relativeUrl);

    nextPipeline(handlers, req, res, null, (error) => {
      res.statusCode = error ? 500 : 404;
      next(error || new Error('Not Found'));
    });
  } as Router;

  (Object.keys(Methods) as MethodsKeys[]).forEach((method) => {
    Object.defineProperty(Router, method.toLocaleLowerCase(), {
      value: (route: string, handler: Middleware) => {
        const methodRoutes = routes.get(method);

        if (!methodRoutes) {
          routes.set(method, [{ route, handler }]);
          return;
        }

        methodRoutes.push({ route, handler });
      },
    });
  });

  return Router;
}

export default routerBuilder;
