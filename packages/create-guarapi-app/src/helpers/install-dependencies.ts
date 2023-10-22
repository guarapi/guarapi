import path from 'node:path';
import { promisify } from 'node:util';
import { spawn } from 'node:child_process';
import { CallbackErrorOrResult, ParsedArgsValuesObj } from '../types';

export default promisify(function installDependencies(
  packageManager: string,
  values: ParsedArgsValuesObj,
  callback: CallbackErrorOrResult,
) {
  const installDir = path.resolve(process.cwd(), values.name);

  spawn(packageManager, ['install'], { cwd: installDir, shell: true, stdio: 'inherit' }).on(
    'exit',
    (exit) => {
      if (exit === 1) {
        callback(
          new Error(`Command "${packageManager} install" exited with unexpected error`),
          null,
        );
        return;
      }

      callback(null, '');
    },
  );
});
