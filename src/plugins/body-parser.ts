import { Plugin } from '../types';

declare module '../types' {
  interface Request {
    body?: unknown;
  }
}

const bodyParserPlugin: Plugin = () => {
  return {
    name: 'bodyParser',
    pre: async (req, res, next) => {
      const contentType = req.headers['content-type'];

      if (!contentType || !/application\/(.*\+)?json/.test(contentType)) {
        next();
        return;
      }

      const buffers: Buffer[] = [];

      req.on('data', (data) => {
        buffers.push(data);
      });

      req.on('end', () => {
        try {
          req.body = JSON.parse(Buffer.concat(buffers).toString());
          next();
        } catch (error) {
          next(error);
        }
      });
    },
  };
};

export default bodyParserPlugin;
