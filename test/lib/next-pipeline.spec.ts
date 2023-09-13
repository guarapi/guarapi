import { IncomingMessage, ServerResponse } from 'node:http';
import nextPipeline from '../../src/lib/next-pipeline';

describe('Guarapi - lib/next-pipeline', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetAllMocks();
    jest.restoreAllMocks();
  });

  it('should run pipeline', () => {
    const fnOne = jest.fn();
    const fnTwo = jest.fn();
    const pipeline = [
      (req, res, next) => {
        fnOne();
        next();
      },
      (req, res, next) => {
        fnTwo();
        next();
      },
    ];

    nextPipeline(pipeline, {} as IncomingMessage, {} as ServerResponse);

    expect(fnOne).toBeCalledTimes(1);
    expect(fnTwo).toBeCalledTimes(1);
  });

  it('should run async pipeline', (done) => {
    const fnOne = jest.fn();
    const fnTwo = jest.fn();
    const pipeline = [
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
        expect(fnOne).toBeCalledTimes(1);
        expect(fnTwo).toBeCalledTimes(1);
        done();
      },
    ];

    nextPipeline(pipeline, {} as IncomingMessage, {} as ServerResponse);
  });

  it('should run and break pipeline passing an error in next function', () => {
    const fnOne = jest.fn();
    const fnTwo = jest.fn();
    const pipeline = [
      (req, res, next) => {
        fnOne();
        next(new Error('Something goes wrong'));
      },
      (req, res, next) => {
        fnTwo();
        next();
      },
    ];

    expect(() => nextPipeline(pipeline, {} as IncomingMessage, {} as ServerResponse)).toThrow(
      'Something goes wrong',
    );
    expect(fnOne).toBeCalledTimes(1);
    expect(fnTwo).not.toBeCalled();
  });

  it('should run and break pipeline throwing an error', () => {
    const fnOne = jest.fn();
    const fnTwo = jest.fn();
    const pipeline = [
      () => {
        fnOne();
        throw new Error('Something goes wrong');
      },
      (req, res, next) => {
        fnTwo();
        next();
      },
    ];

    expect(() => nextPipeline(pipeline, {} as IncomingMessage, {} as ServerResponse)).toThrow(
      'Something goes wrong',
    );
    expect(fnOne).toBeCalledTimes(1);
    expect(fnTwo).not.toBeCalled();
  });
});
