import path from 'node:path';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const pkg = require(path.resolve(__dirname, '../../package.json'));

export default function getPackageInfo(packagePath?: string) {
  if (!packagePath) {
    return pkg;
  }

  return require(packagePath);
}
