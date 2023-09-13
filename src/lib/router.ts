import { Middleware } from '../types';

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

export type Router = {
  [method in Methods]: (route: string, handler: Middleware) => void;
};

export const routes = new Map<MethodsKeys, { route: string; handler: Middleware }[]>();

const Router = {} as Router;

const addRoute = (method: MethodsKeys, route: string, handler: Middleware) => {
  const methodRoutes = routes.get(method);

  if (!methodRoutes) {
    routes.set(method, [{ route, handler }]);
    return;
  }

  methodRoutes.push({ route, handler });
};

Object.keys(Methods).forEach((method) => {
  Object.defineProperty(Router, method.toLocaleLowerCase(), {
    value: (route: string, handler: Middleware) => addRoute(method as MethodsKeys, route, handler),
  });
});

export default Router;
