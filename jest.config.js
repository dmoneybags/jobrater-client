const config = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  moduleNameMapper: {
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
  },
  testMatch: ['<rootDir>/src/tests/**/*.(test|spec).(ts|tsx|js|jsx)'],
  setupFiles: ['./src/tests/mocks/localStorageMock.js'],
  setupFilesAfterEnv: ['./src/tests/jest.setup.mjs'], // Ensure this is also in .mjs format
  transform: {
    '^.+\\.jsx?$': 'babel-jest',
    '^.+\\.mjs$': 'babel-jest',
    '^.+\\.tsx?$': 'ts-jest',
  },
  transformIgnorePatterns: [
    'node_modules/(?!@applicantiq/applicantiq_core)', // Process this package
  ],
};

export default config;