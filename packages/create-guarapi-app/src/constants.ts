import os from 'node:os';
import path from 'node:path';
import getPackageInfo from './helpers/get-package-info';

export const CACHE_PATH = path.resolve(os.tmpdir(), getPackageInfo().name);
export const EXAMPLES_REPO = 'https://github.com/guarapi/guarapi.git';
export const EXAMPLES_FOLDER = 'examples';
