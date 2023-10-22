#!/usr/bin/env node

import { parseArgs } from 'node:util';
import commandExists from './helpers/command-exists';
import copyFiles from './helpers/copy-files';
import ensureProjectDirNotExists from './helpers/ensure-project-dir-not-exists';
import ensureTemplatesDir from './helpers/ensure-template-dir';
import getPackageInfo from './helpers/get-package-info';
import getPackageManager from './helpers/get-package-manager';
import getValuesInteractive from './helpers/get-values-interactive';
import installDependencies from './helpers/install-dependencies';
import printUsage from './helpers/print-usage';
import writePackageMeta from './helpers/write-package-meta';
import { setupProjectRepo } from './helpers/git';
import options from './options';
import { ParsedArgsValuesObj } from './types';

const args = process.argv.slice(2);

async function main() {
  try {
    const parsedValues = parseArgs({ options }).values as ParsedArgsValuesObj;

    if (parsedValues.version) {
      console.log(getPackageInfo().version);
      process.exit(0);
    }

    if (parsedValues.help) {
      printUsage();
      process.exit(0);
    }

    const interactive = !(args.length && parsedValues.yes);
    const values = interactive ? await getValuesInteractive(options) : parsedValues;
    const packageManager = await getPackageManager();

    await ensureProjectDirNotExists(values);
    await commandExists('git');
    await ensureTemplatesDir();
    await copyFiles(values);
    await writePackageMeta(values);
    await installDependencies(packageManager, values);
    await setupProjectRepo(values);
  } catch (error) {
    if (error instanceof Error) {
      console.log(error?.message);
    }

    process.exit(1);
  }
}

main();
