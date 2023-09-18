import { URL } from 'node:url';
import nextPipeline from '../lib/next-pipeline';
import { MethodsKeys, routes } from '../lib/router';
import { Middleware, Params, Plugin, Request } from '../types';

const BASE_URL = 'http://localhost/';

const routerPlugin: Plugin = () => {
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
              handler({ ...req, params, query } as Request, res, next);
            },
          ];
        }

        return acc;
      }, []);
    }

    return [];
  };

  return {
    name: 'router',
    pre: (req, res, next) => {
      if (req.method && req.url) {
        const handlers = matchRoutes(req.method as MethodsKeys, req.url);
        nextPipeline(handlers, req, res, null, next);
      } else {
        next(new Error('Not Found'));
      }
    },
    error: (error, req, res) => {
      res.end(JSON.stringify({ error }));
    },
  };
};

export default routerPlugin;
