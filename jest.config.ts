import type { Config } from 'jest';

const config: Config = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: '.',
  testEnvironment: 'node',
  transform: {
    '^.+\\.ts$': [
      'ts-jest',
      {
        tsconfig: 'tsconfig.json',
      },
    ],
  },
  moduleNameMapper: {
    '^@core/(.*)$': '<rootDir>/src/core/$1',
    '^@features/(.*)$': '<rootDir>/src/features/$1',
    '^@shared/(.*)$': '<rootDir>/src/shared/$1',
    '^@infrastructure/(.*)$': '<rootDir>/src/infrastructure/$1',
  },
  setupFilesAfterEnv: ['<rootDir>/test/setup.ts'],
  collectCoverageFrom: [
    'src/**/*.(t|j)s',
    '!src/**/*.module.ts',
    '!src/**/*.entity.ts',
    '!src/**/*.dto.ts',
    '!src/**/*.spec.ts',
    '!src/**/*.e2e-spec.ts',
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov'],
  verbose: true,
  testPathIgnorePatterns: ['/node_modules/', '/dist/'],
  moduleDirectories: [
    'node_modules',
    'src',
    'src/features',
    'src/shared',
    'src/infrastructure',
  ],
  roots: ['<rootDir>/src', '<rootDir>/test'],
  modulePaths: ['<rootDir>/src'],
  testMatch: ['**/__tests__/**/*.[jt]s?(x)', '**/?(*.)+(spec|test).[jt]s?(x)'],
  transformIgnorePatterns: ['node_modules/(?!@nestjs)'],
};

export default config;
