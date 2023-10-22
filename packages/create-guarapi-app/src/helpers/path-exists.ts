import { access } from 'node:fs/promises';

export default async function pathExists(path: string) {
  try {
    await access(path);
    return true;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
      throw error;
    }

    return false;
  }
}
