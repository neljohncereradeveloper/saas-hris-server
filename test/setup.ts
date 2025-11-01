import 'reflect-metadata';

// Global test timeout
jest.setTimeout(30000);

// Mock console.error to keep test output clean
console.error = jest.fn();

// Global beforeAll hook
beforeAll(async () => {
  // Add any global setup here
});

// Global afterAll hook
afterAll(async () => {
  // Add any global cleanup here
});

// Global beforeEach hook
beforeEach(async () => {
  // Reset all mocks before each test
  jest.clearAllMocks();
});
