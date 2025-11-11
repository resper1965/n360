/**
 * Jest Configuration
 * Backend testing setup
 */

module.exports = {
  // Ambiente de teste
  testEnvironment: 'node',
  
  // Padrão de arquivos de teste
  testMatch: [
    '**/__tests__/**/*.test.js',
    '**/?(*.)+(spec|test).js'
  ],
  
  // Cobertura de código
  collectCoverageFrom: [
    '**/*.js',
    '!**/node_modules/**',
    '!**/coverage/**',
    '!**/logs/**',
    '!**/__tests__/**',
    '!jest.config.js',
    '!index-old.js'
  ],
  
  // Thresholds de cobertura (80% target)
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  },
  
  // Reporters
  coverageReporters: ['text', 'lcov', 'html'],
  
  // Setup files
  setupFilesAfterEnv: ['<rootDir>/__tests__/setup.js'],
  
  // Timeout padrão (5s)
  testTimeout: 5000,
  
  // Verbose output
  verbose: true,
  
  // Clear mocks entre testes
  clearMocks: true,
  
  // Restore mocks após cada teste
  restoreMocks: true,
};



