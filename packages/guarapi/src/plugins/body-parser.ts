import querystring from 'querystring';
import { Plugin } from '../types';

declare module '../types' {
  interface Request {
    body?: unknown;
  }
}

function convertFlatKeyToNestedKeys(
  flatKey: string,
  nestedObj: Record<string, unknown>,
  value: unknown,
) {
  const keys = flatKey
    .replace(/\[(.*?)\]/g, '.$1')
    .replace(/\.+/g, '.')
    .split('.');
  const lastKeyIndex = keys.length - 1;

  keys.forEach((key, i) => {
    const nestedKey = key || Object.keys(nestedObj).length.toString();
    nestedObj[nestedKey] = i === lastKeyIndex ? value : nestedObj[nestedKey] || {};
    nestedObj = nestedObj[nestedKey] as Record<string, unknown>;
  });
}

function parseFormEncodedData(formEncodedData: string): Record<string, unknown> {
  const parsedData = querystring.parse(formEncodedData);
  const obj: Record<string, unknown> = {};

  for (const key in parsedData) {
    if (Object.prototype.hasOwnProperty.call(parsedData, key)) {
      convertFlatKeyToNestedKeys(key, obj, parsedData[key]);
    }
  }

  return obj;
}

const MAX_PAYLOAD_SIZE_BYTES = 2097152;

const bodyParserPlugin: Plugin = (_app, config) => {
  const { maxPayloadSize = MAX_PAYLOAD_SIZE_BYTES } = config || {};
  return {
    name: 'formUrlencodedParser',
    pre: async (req, res, next) => {
      const contentType = req.headers['content-type'];
      const contentLength = req.headers['content-length']
        ? parseInt(req.headers['content-length'], 10)
        : 0;

      if (contentLength > maxPayloadSize) {
        next(new Error(`Max payload ${maxPayloadSize}`));
        return;
      }

      if (!contentType || !/application\/((.*\+)?json|x-www-form-urlencoded)/.test(contentType)) {
        next();
        return;
      }

      const buffers: Buffer[] = [];

      req.on('data', (data) => {
        buffers.push(data);
      });

      req.on('end', () => {
        try {
          const bodyData = Buffer.concat(buffers).toString();
          if (contentType.includes('json')) {
            req.body = JSON.parse(bodyData);
          } else if (contentType.includes('x-www-form-urlencoded')) {
            req.body = parseFormEncodedData(bodyData);
          }
          next();
        } catch (error) {
          next(error);
        }
      });
    },
  };
};

export default bodyParserPlugin;
