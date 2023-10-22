import path from 'node:path';
import { writeFile } from 'node:fs/promises';
import { ParsedArgsValuesObj } from '../types';
import getPackageInfo from './get-package-info';

export default async function writePackageMeta(values: ParsedArgsValuesObj) {
  const packagePath = path.resolve(process.cwd(), values.name, 'package.json');
  const packageMeta = getPackageInfo(packagePath);

  packageMeta.name = values.name;
  packageMeta.version = '0.0.0';
  delete packageMeta.private;

  await writeFile(packagePath, JSON.stringify(packageMeta, null, 2));
}
