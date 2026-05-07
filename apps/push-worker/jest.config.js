module.exports = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: '.',
  testEnvironment: 'node',
  testRegex: '.*\\.spec\\.ts$',
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },
  moduleNameMapper: {
    '^@modules/(.*)$': '<rootDir>/../../src/modules/$1',
    '^@shared/(.*)$': '<rootDir>/../../src/shared/$1',
    '^@infrastructure/(.*)$': '<rootDir>/../../src/infrastructure/$1',
  },
};
