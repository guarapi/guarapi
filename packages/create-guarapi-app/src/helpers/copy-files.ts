import path from 'node:path';
import { cp } from 'node:fs/promises';
import { ParsedArgsValuesObj } from '../types';
import { CACHE_PATH, EXAMPLES_FOLDER } from '../constants';

export default async function copyFiles(values: ParsedArgsValuesObj) {
  const src = path.resolve(CACHE_PATH, EXAMPLES_FOLDER, values.example);
  const dest = path.resolve(process.cwd(), values.name);

  await cp(src, dest, { recursive: true });
}
