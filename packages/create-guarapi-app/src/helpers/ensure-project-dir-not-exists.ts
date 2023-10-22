import path from 'node:path';
import pathExists from './path-exists';
import { ParsedArgsValuesObj } from '../types';

export default async function projectDirNotExists(values: ParsedArgsValuesObj) {
  const dest = path.resolve(process.cwd(), values.name);

  if (await pathExists(dest)) {
    throw new Error(`The destination "${values.name}" directory already exists`);
  }
}
