module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: [
    '**/__tests__/**/*.test.ts',
    '**/?(*.)+(spec|test).ts',
    // Exclure les tests d'intégration qui nécessitent un serveur
    '!**/__tests__/**/*.integration.test.ts',
    '!**/__tests__/**/websocket.test.ts'
  ],
  transform: {
    '^.+\\.ts$': ['ts-jest', {
      tsconfig: {
        baseUrl: '.',
        paths: {
          '@/*': ['src/*'],
          '@shared/*': ['../shared/*']
        }
      }
    }],
  },
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/**/*.test.ts',
    '!src/**/*.integration.test.ts',
  ],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@/game/(.*)$': '<rootDir>/src/game/$1',
    '^@/players/(.*)$': '<rootDir>/src/players/$1',
    '^@/planets/(.*)$': '<rootDir>/src/planets/$1',
    '^@/ships/(.*)$': '<rootDir>/src/ships/$1',
    '^@/alliances/(.*)$': '<rootDir>/src/alliances/$1',
    '^@/messaging/(.*)$': '<rootDir>/src/messaging/$1',
    '^@/utils/(.*)$': '<rootDir>/src/utils/$1',
    '^@shared/(.*)$': '<rootDir>/../shared/$1',
  },
  testTimeout: 10000
};

