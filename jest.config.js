module.exports = {
  preset: 'jest-preset-angular',
  setupFilesAfterEnv: ['<rootDir>/setup-jest.ts'],
  testEnvironment: 'jsdom',
  moduleNameMapper: {
    '^@app/(.*)$': '<rootDir>/src/app/$1',
  },
  // without transformIgnorePatterns, importing anything from ol/* in the spec files would fail with a syntax error
  // since Jest's default config ignores all of node_modules during transformation.
  transformIgnorePatterns: [
    'node_modules/(?!(.*\\.mjs$|ol/|@noble/|rbush/|quickselect/|color-name/|color-parse/|color-rgba/|color-normalize/|color-space/))',
  ],
};
