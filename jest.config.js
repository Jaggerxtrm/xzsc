module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/tests/*.test.js'],
  testPathIgnorePatterns: ['/node_modules/'],
  collectCoverageFrom: ['src/**/*.js'],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov'],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70
    }
  },
  verbose: true,
  testTimeout: 30000
};
