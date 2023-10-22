import { CACHE_PATH, EXAMPLES_FOLDER, EXAMPLES_REPO } from '../constants';
import dirExists from './path-exists';
import { cloneFolders, pull } from './git';

export default async function ensureTemplatesDir() {
  if (await dirExists(CACHE_PATH)) {
    await pull();
    return;
  }

  await cloneFolders(EXAMPLES_REPO, [EXAMPLES_FOLDER]);
}
