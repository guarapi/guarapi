module.exports = {
  testEnvironment: 'node',
  verbose: true,
  automock: false,
  testMatch: ['**/*.test.ts', '**/*.spec.ts'],
  coverageDirectory: './coverage',
  coverageReporters: ['text', 'html', 'json'],
  transform: {
    '^.+\\.(t|j)sx?$': '@swc/jest',
  },
};
