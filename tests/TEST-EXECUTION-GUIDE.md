# Test Execution Guide

## 🎯 Overview

The Xero MCP Server test suite now features a **coordinated testing approach** that properly manages server startup and test execution to resolve the hanging issues that were occurring previously.

## 🚀 Quick Start

### Primary Test Command (Recommended)
```bash
npm test
```
This runs the coordinated test runner that:
1. Starts the test server once
2. Runs integration tests
3. Provides clear status reporting

### Alternative Test Commands

```bash
# Run coordinated tests + Jest suite
npm run test:jest

# Run manual integration tests only
npm run test:manual

# Run Jest directly (requires server running separately)
npx jest

# Run with coverage
npm run test:coverage
```

## 🔧 What Was Fixed

### Server Startup Issues ✅
- **Problem**: Tests were calling `startXeroMcpServer()` without awaiting
- **Solution**: Proper async/await handling in coordinated test runner
- **Result**: Server starts reliably before tests run

### Port Configuration ✅
- **Problem**: Server defaulting to port 3000, tests expecting 3001
- **Solution**: Environment variables set before server import
- **Result**: Consistent port usage across all components

### Import Resolution ✅
- **Problem**: TypeScript Node16 requiring `.js` extensions
- **Solution**: Added `.js` extensions to all test imports
- **Result**: No more import resolution errors

### Test Coordination ✅
- **Problem**: Multiple tests starting their own servers
- **Solution**: Single server startup with shared test client
- **Result**: No more port conflicts or hanging tests

## 📁 Test Structure

```
tests/
├── run-tests.ts           # 🎯 Primary coordinated test runner
├── run-manual-test.ts     # 🔧 Manual integration tests
├── setup.ts               # ⚙️ Test environment configuration
├── protocol.test.ts       # 🔌 MCP protocol tests
├── xero-operations.test.ts # 🏢 Xero API operation tests
├── debug-tool.test.ts     # 🐛 Debug tool tests
├── utils/
│   └── test-client.ts     # 🛠️ MCP test client utility
└── mocks/
    └── xero-data.ts       # 📊 Mock data for testing
```

## 🧪 Test Execution Modes

### 1. Coordinated Integration Tests (Default)
```bash
npm test
```
**What it does:**
- Starts test server on port 3001
- Runs comprehensive integration tests
- Tests health, MCP protocol, tool discovery, and execution
- Provides detailed status reporting

**Output Example:**
```
🔬 Xero MCP Server Test Suite
=============================
🚀 Starting test server on port 3001...
✅ Server started successfully - Status: healthy
🧪 Running Basic Integration Tests
==================================
1️⃣ Testing Health Check...
✅ Health Check: healthy (mega-tool)
...
```

### 2. Full Test Suite (Jest + Integration)
```bash
npm run test:jest
```
**What it does:**
- Runs coordinated integration tests
- Then runs the full Jest test suite
- Best for comprehensive testing

### 3. Manual Integration Tests
```bash
npm run test:manual
```
**What it does:**
- Lighter version of integration tests
- Focuses on core MCP functionality
- Good for quick validation

## 🛠️ Configuration

### Test Environment Variables
```typescript
// Automatically set by test runners
process.env.NODE_ENV = 'test';
process.env.PORT = '3001';
process.env.XERO_CLIENT_ID = 'test-client-id';
process.env.XERO_CLIENT_SECRET = 'test-client-secret';
process.env.XERO_REDIRECT_URI = 'http://localhost:3001/callback';
```

### Jest Configuration
```json
{
  "preset": "ts-jest",
  "testEnvironment": "node",
  "testTimeout": 60000,
  "maxWorkers": 1,
  "runInBand": true,
  "detectOpenHandles": true,
  "forceExit": true
}
```

## 🐛 Debugging

### Enable Debug Logging
```bash
DEBUG_TESTS=true npm test
```

### Test Individual Components
```bash
# Test specific file
npx jest tests/protocol.test.ts

# Test with verbose output
npx jest --verbose

# Test with watch mode
npm run test:watch
```

### Common Issues & Solutions

#### Issue: "EADDRINUSE: address already in use"
**Solution**: Kill any existing servers on port 3001
```bash
# Windows
netstat -ano | findstr :3001
taskkill /PID <pid> /F

# Mac/Linux
lsof -ti:3001 | xargs kill -9
```

#### Issue: Tests timeout
**Solution**: 
1. Check server is starting properly
2. Verify environment variables are set
3. Use debug mode: `DEBUG_TESTS=true npm test`

#### Issue: Import errors
**Solution**: Ensure all imports use `.js` extensions for TypeScript files

## 📊 Test Coverage

The test suite covers:

- ✅ **Server Health**: Health endpoint functionality
- ✅ **MCP Protocol**: Initialize, notifications, tool discovery
- ✅ **Tool Execution**: Tool calls with various parameters
- ✅ **Error Handling**: Invalid operations, missing parameters
- ✅ **Rate Limiting**: Request throttling functionality
- ✅ **CORS**: Microsoft 365 compatibility headers
- ✅ **Response Format**: Consistent MCP response structure

## 🎉 Success Indicators

When tests are working correctly, you'll see:
```
✅ All tests completed successfully!

📋 Summary:
   - Server Health: ✅
   - MCP Protocol: ✅
   - Tool Discovery: ✅
   - Tool Execution: ✅
```

## 📝 Next Steps

1. **Run the tests**: `npm test`
2. **Verify functionality**: Check all ✅ indicators
3. **Add new tests**: Use existing patterns in test files
4. **Report issues**: Include debug output from `DEBUG_TESTS=true npm test` 