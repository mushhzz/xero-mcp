// Test environment setup for Jest
// Note: This file uses CommonJS syntax for Jest compatibility

// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.PORT = '3001'; // Use different port for testing

// Mock environment variables for testing
process.env.XERO_CLIENT_ID = 'test-client-id';
process.env.XERO_CLIENT_SECRET = 'test-client-secret';
process.env.XERO_REDIRECT_URI = 'http://localhost:3001/callback';

// Suppress console output during tests unless debugging
const originalConsole = console;
if (process.env.DEBUG_TESTS !== 'true') {
  console.log = () => {};
  console.debug = () => {};
  console.info = () => {};
}

// Jest timeout configuration
jest.setTimeout(30000);

// Export for CommonJS compatibility
module.exports = { originalConsole }; 