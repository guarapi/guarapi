import { Options } from './types';

const options: Options = {
  name: {
    type: 'string',
    short: 'n',
    description: 'Project name',
    question: 'Project name:',
    default: 'my-project',
  },
  example: {
    type: 'string',
    short: 'e',
    description:
      'Example folder name, pick one from: https://github.com/guarapi/guarapi/tree/main/examples',
    question: 'Example folder name:',
    default: 'basic-api',
  },
  yes: {
    type: 'boolean',
    short: 'y',
    description: 'Create app automatically answer "yes" to any prompts',
  },
  version: {
    type: 'boolean',
    short: 'v',
    description: 'Print version',
  },
  help: {
    type: 'boolean',
    short: 'h',
    description: 'Print this usage',
  },
};

export default options;
