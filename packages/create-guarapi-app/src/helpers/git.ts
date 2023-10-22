import path from 'node:path';
import { promisify } from 'node:util';
import { writeFile } from 'node:fs/promises';
import { spawn } from 'node:child_process';
import { CACHE_PATH } from '../constants';
import { CallbackErrorOrResult, ParsedArgsValuesObj } from '../types';
import pathExists from './path-exists';

const cloneMetadata = promisify(function cloneMetadata(
  repo: string,
  callback: CallbackErrorOrResult,
): void {
  spawn('git', ['clone', '--no-checkout', '--depth=1', '--filter=tree:0', repo, CACHE_PATH]).on(
    'exit',
    (exit) => {
      if (exit === 1) {
        callback(new Error('Command git clone exited with unexpected error'), null);
        return;
      }

      callback(null, '');
    },
  );
});

const configSparseCheckout = promisify(function configSparseFolders(
  folders: string[],
  callback: CallbackErrorOrResult,
): void {
  spawn('git', ['sparse-checkout', 'set', folders.join(',')], { cwd: CACHE_PATH }).on(
    'exit',
    (exit) => {
      if (exit === 1) {
        callback(new Error('Command git sparse-checkout exited with unexpected error'), null);
        return;
      }

      callback(null, '');
    },
  );
});

const checkout = promisify(function checkout(callback) {
  spawn('git', ['checkout'], { cwd: CACHE_PATH }).on('exit', (exit) => {
    if (exit === 1) {
      callback(new Error('Command git clone exited with unexpected error'), null);
      return;
    }

    callback(null, '');
  });
});

const initProject = promisify(function initProject(
  values: ParsedArgsValuesObj,
  callback: CallbackErrorOrResult,
) {
  const projectCwd = path.resolve(process.cwd(), values.name);

  spawn('git', ['init'], { cwd: projectCwd }).on('exit', (exit) => {
    if (exit === 1) {
      callback(new Error('Command git init exited with unexpected error'), null);
      return;
    }

    callback(null, '');
  });
});

const addFilesProject = promisify(function addFilesProject(
  values: ParsedArgsValuesObj,
  callback: CallbackErrorOrResult,
) {
  const projectCwd = path.resolve(process.cwd(), values.name);

  spawn('git', ['add', '.'], { cwd: projectCwd }).on('exit', (exit) => {
    if (exit === 1) {
      callback(new Error('Command git init exited with unexpected error'), null);
      return;
    }

    callback(null, '');
  });
});

const commitProject = promisify(function commitProject(
  values: ParsedArgsValuesObj,
  callback: CallbackErrorOrResult,
) {
  const projectCwd = path.resolve(process.cwd(), values.name);

  spawn('git', ['commit', '-am', 'Initial commit'], { cwd: projectCwd }).on('exit', (exit) => {
    if (exit === 1) {
      callback(new Error('Command git commit exited with unexpected error'), null);
      return;
    }

    callback(null, '');
  });
});

export const pull = promisify(function pull(callback) {
  spawn('git', ['pull'], { cwd: CACHE_PATH }).on('exit', (exit) => {
    if (exit === 1) {
      callback(new Error('Command git pull exited with unexpected error'), null);
      return;
    }

    callback(null, '');
  });
});

export async function cloneFolders(repo: string, folders: string[]) {
  await cloneMetadata(repo);
  await configSparseCheckout(folders);
  await checkout();
}

export async function setupProjectRepo(values: ParsedArgsValuesObj) {
  const projectGitIgnore = path.resolve(process.cwd(), values.name, '.gitignore');

  if (!(await pathExists(projectGitIgnore))) {
    await writeFile(projectGitIgnore, 'node_modules\n');
  }

  await initProject(values);
  await addFilesProject(values);
  await commitProject(values);
}
