module.exports = {
  testEnvironment: 'node',
  verbose: true,
  automock: false,
  testMatch: ['**/*.test.ts', '**/*.spec.ts'],
  coverageDirectory: './coverage',
  coverageReporters: ['lcov', 'text'],
  transform: {
    '^.+\\.(t|j)sx?$': '@swc/jest',
  },
};
