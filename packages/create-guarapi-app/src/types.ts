export type Option = {
  type: 'string' | 'boolean';
  short?: string;
  default?: string | boolean;
  description?: string;
  question?: string;
  answer?: { y: boolean; n: boolean; selected: 'n' | 'y' };
};

export type Options = {
  [k: string]: Option;
};

export type ArgsValuesObj = { [k: string]: string | boolean | undefined };

export type ParsedArgsValuesObj = {
  name: string;
  example: string;
  help: boolean;
  version: boolean;
  yes: boolean;
  'no-typescript': boolean;
  'no-eslint': boolean;
};

export type CallbackErrorOrResult = (err: unknown, result: unknown) => void;
