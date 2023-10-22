import { exec } from 'node:child_process';

export default async function commandExists(
  command: string,
  args: string[] = ['--version'],
): Promise<void> {
  return new Promise((resolve, reject) => {
    exec(`${command} ${args?.join(' ')}`, (error) => {
      if (error) {
        reject(new Error(`Command: "${command}" not installed`));
      }

      resolve();
    });
  });
}
