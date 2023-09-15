import { IncomingMessage } from 'node:http';
import { Middleware, Plugin } from '../types';
import nextPipeline from '../lib/next-pipeline';
import { MethodsKeys, routes } from '../lib/router';

const routerPlugin: Plugin = () => {
  const extractRouteParams = (route: string, matchedParams?: string[]) => {
    const params: Record<
      string,
      string | number | null | undefined | (string | number | null | undefined)[]
    > = {};
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
      return methodRoutes.reduce<Middleware[]>((acc, { route, handler }) => {
        const regex = new RegExp(
          `^${route
            .replace(/(\/:[\w_]+[*])$/, '(/[^/]+.*)')
            .replace(/(:[\w_]+[^*/])/g, '([^/]+)')}$`,
        );
        const match = (url.replace(/\/$/, '') || '/').match(regex);

        if (match) {
          const params = extractRouteParams(route, match);

          return [
            ...acc,
            (req, res, next) => {
              // @todo Request interface extending IncomingMessage
              handler({ ...req, params } as unknown as IncomingMessage, res, next);
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
