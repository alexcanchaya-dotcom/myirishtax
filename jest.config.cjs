module.exports = {
  testEnvironment: 'node',
  transform: {
    // tsconfig.jest.json = tsconfig.json with jsx compiled, so page components can be rendered in tests.
    '^.+\\.(ts|tsx)$': ['ts-jest', { tsconfig: 'tsconfig.jest.json' }],
  },
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
  moduleFileExtensions: ['ts', 'tsx', 'js'],
  testMatch: ['**/tests/**/*.test.(ts|tsx|js)'],
};
