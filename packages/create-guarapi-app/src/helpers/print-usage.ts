import options from '../options';
import { Option } from '../types';

function printOption(optionKey: string, option: Option) {
  const short = option.short ? `-${option.short}, ` : '';
  const optionFlags = `${short}--${optionKey}`;
  const value = option.type === 'string' ? `<string:${optionKey}>` : '';
  const defaultValue =
    option.default !== undefined && option.type !== 'boolean'
      ? `(default: ${String(option.default)})`
      : '';

  return [optionFlags.padEnd(18), value, defaultValue, option.description]
    .filter(Boolean)
    .join(' ');
}

const optionStrings = Object.entries(options).map(([optionKey, option]) => {
  return printOption(optionKey, option);
});

const usageStr = `Usage:
  create-guarapi-app [options]

Options:
  ${optionStrings.join('\n  ')}
`;

export default function printUsage() {
  console.log(usageStr);
}
