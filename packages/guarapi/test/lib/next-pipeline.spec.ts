import nextPipeline from '../../src/lib/next-pipeline';
import { Middleware, Request, Response } from '../../src/types';

describe('Guarapi - lib/next-pipeline', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetAllMocks();
    jest.restoreAllMocks();
  });

  it('should run pipeline', () => {
    const fnOne = jest.fn();
    const fnTwo = jest.fn();
    const pipeline: Middleware[] = [
      (req, res, next) => {
        fnOne();
        next();
      },
      (req, res, next) => {
        fnTwo();
        next();
      },
    ];

    nextPipeline(pipeline, {} as Request, {} as Response);

    expect(fnOne).toHaveBeenCalledTimes(1);
    expect(fnTwo).toHaveBeenCalledTimes(1);
  });

  it('should run async pipeline', (done) => {
    const fnOne = jest.fn();
    const fnTwo = jest.fn();
    const pipeline: Middleware[] = [
      async (req, res, next) => {
        fnOne();
        await new Promise((resolve) => setTimeout(resolve));
        next();
      },
      async (req, res, next) => {
        fnTwo();
        await new Promise((resolve) => setTimeout(resolve));
        next();
      },
      async () => {
        expect(fnOne).toHaveBeenCalledTimes(1);
        expect(fnTwo).toHaveBeenCalledTimes(1);
        done();
      },
    ];

    nextPipeline(pipeline, {} as Request, {} as Response);
  });

  it('should run and break pipeline passing an error in next function', () => {
    const fnOne = jest.fn();
    const fnTwo = jest.fn();
    const pipeline: Middleware[] = [
      (req, res, next) => {
        fnOne();
        next(new Error('Something goes wrong'));
      },
      (req, res, next) => {
        fnTwo();
        next();
      },
    ];

    nextPipeline(pipeline, {} as Request, {} as Response, null, (err) => {
      expect(err).toBeInstanceOf(Error);
      expect((err as Error).message).toEqual('Something goes wrong');
      expect(fnOne).toHaveBeenCalledTimes(1);
      expect(fnTwo).not.toBeCalled();
    });
  });

  it('should run and break pipeline throwing an error', () => {
    const fnOne = jest.fn();
    const fnTwo = jest.fn();
    const pipeline: Middleware[] = [
      () => {
        fnOne();
        throw new Error('You should catch errors and pass in next function');
      },
      (req, res, next) => {
        fnTwo();
        next();
      },
    ];

    expect(() => {
      nextPipeline(pipeline, {} as Request, {} as Response, null, () => {
        expect(fnOne).toHaveBeenCalledTimes(1);
        expect(fnTwo).not.toBeCalled();
      });
    }).toThrow('You should catch errors and pass in next function');
  });

  it('should run and break async pipeline throwing an error', () => {
    const fnOne = jest.fn();
    const fnTwo = jest.fn();
    const pipeline: Middleware[] = [
      async (req, res, next) => {
        try {
          await Promise.reject(new Error('Something goes wrong'));
          fnOne();
        } catch (err) {
          next(err);
        }
      },
      (req, res, next) => {
        fnTwo();
        next();
      },
    ];

    nextPipeline(pipeline, {} as Request, {} as Response, null, (err) => {
      expect(err).toBeInstanceOf(Error);
      expect((err as Error).message).toEqual('Something goes wrong');
      expect(fnOne).not.toBeCalled();
      expect(fnTwo).not.toBeCalled();
    });
  });
});
