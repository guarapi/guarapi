import { createInterface } from 'node:readline/promises';
import { ArgsValuesObj, Options, ParsedArgsValuesObj } from '../types';

async function getValuesInteractive(options: Options): Promise<ParsedArgsValuesObj> {
  const readLine = createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const interactiveValues: ArgsValuesObj = {};

  for (const optionKey of Object.keys(options)) {
    const option = options[optionKey];

    if (!option.question) {
      continue;
    }

    if (option.type === 'boolean') {
      const selected = option.answer?.selected || '';
      const boolValues = '(y/n)'.replace(selected, selected.toLocaleUpperCase());
      const question = `${option.question} ${boolValues}: `;
      const answer = (await readLine.question(question)).toLocaleLowerCase() as 'y' | 'n';
      interactiveValues[optionKey] = option.answer?.[answer] || option.default;
    } else {
      const question = `${option.question}${option.default ? ` (default: ${option.default})` : ''}`;
      const answer = await readLine.question(question);
      interactiveValues[optionKey] = answer || option.default;
    }
  }

  await readLine.close();

  return interactiveValues as ParsedArgsValuesObj;
}

export default getValuesInteractive;
