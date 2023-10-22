import commandExists from './command-exists';

export default async function getPackageManager() {
  const packages = ['pnpm', 'yarn', 'npm'];
  const results = await Promise.allSettled(packages.map((command) => commandExists(command)));

  return packages[results.findIndex(({ status }) => status === 'fulfilled')];
}
