# Xero MCP Server Test Suite

This directory contains comprehensive automated tests for the Xero MCP Server, covering both the mega-tool and debug tool implementations.

## Test Structure

```
tests/
├── setup.ts                 # Test environment setup
├── utils/
│   └── test-client.ts       # MCP test client for making requests
├── mocks/
│   └── xero-data.ts         # Mock Xero data for testing
├── protocol.test.ts         # MCP protocol level tests
├── xero-operations.test.ts  # Xero operations tests (viewing & creating)
├── debug-tool.test.ts       # Debug tool specific tests
└── README.md               # This file
```

## Installation

First, install the test dependencies:

```bash
npm install --save-dev @types/jest jest ts-jest
```

## Running Tests

### All Tests
```bash
npm test
```

### Watch Mode (for development)
```bash
npm run test:watch
```

### With Coverage Report
```bash
npm run test:coverage
```

### Debug Mode (with console output)
```bash
npm run test:debug
```

### Specific Test Categories
```bash
# Integration tests only
npm run test:integration

# Unit tests only  
npm run test:unit
```

## Test Categories

### 1. Protocol Tests (`protocol.test.ts`)
Tests the MCP protocol implementation:
- Server health checks
- MCP handshake (initialize, notifications)
- Tool discovery (tools/list)
- Tool execution (tools/call)
- Rate limiting
- CORS headers for M365 compatibility

### 2. Xero Operations Tests (`xero-operations.test.ts`)
Tests Xero business operations:

**View Operations:**
- `list-organisation-details` - Retrieve company information
- `list-accounts` - Get chart of accounts
- `list-contacts` - Get customer/supplier contacts

**Create Operations:**
- `create-contact` - Add new contacts (with validation)
- `create-invoice` - Create invoices (with parameter validation)

**Error Handling:**
- Invalid operations
- Missing parameters
- Network errors
- Authentication errors

**Response Format:**
- Consistent MCP response structure
- Proper content formatting
- Large response handling

### 3. Debug Tool Tests (`debug-tool.test.ts`)
Tests the simplified debug tool:
- Echo operation (`test-echo`)
- Basic Xero operations
- Error handling
- Response consistency

## Test Configuration

The test suite is configured in `package.json` with:
- **Test Framework**: Jest with TypeScript support
- **Environment**: Node.js
- **Timeout**: 30 seconds (for API calls)
- **Setup**: Automatic environment configuration
- **Coverage**: Comprehensive source code coverage

## Mock Data

The `mocks/xero-data.ts` file provides:
- Mock organisation data
- Sample accounts, contacts, invoices
- Test data for creating new records
- Response structure helpers

## Test Client

The `MCPTestClient` class provides:
- MCP protocol communication
- Tool execution
- Health checks
- Proper request/response handling

## Environment Variables

Test environment uses:
- `NODE_ENV=test`
- `PORT=3001` (different from production)
- Mock Xero credentials for testing

## Running with Different Configurations

### Test the Mega-Tool
Default configuration tests the mega-tool implementation.

### Test the Debug Tool
To test the debug tool, switch the server import in test files:
```typescript
// Change this in server startup
import { startXeroDebugServer } from '../src/server/xero-debug-server';
```

## Expected Test Results

### When Xero API is Connected:
- All protocol tests should pass
- View operations should return real data
- Create operations should either succeed or return meaningful errors

### When Xero API is Not Connected:
- Protocol tests should still pass
- Xero operations should return authentication/connection errors
- Debug tool echo operation should always work

## Troubleshooting

### Tests Failing?
1. Check if the server is running on the correct port
2. Verify environment variables are set
3. Run with debug mode to see console output
4. Check Xero API credentials if testing real operations

### Connection Issues?
```bash
# Test server health directly
curl http://localhost:3001/health

# Test MCP endpoint
curl -X POST http://localhost:3001/mcp/ \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/list"}'
```

### Debug Mode
Set `DEBUG_TESTS=true` to see all console output:
```bash
DEBUG_TESTS=true npm test
```

## CI/CD Integration

These tests are designed to run in CI/CD environments:
- No external dependencies required
- Graceful handling of API unavailability
- Comprehensive coverage reporting
- Fast execution (under 2 minutes)

## Adding New Tests

1. **For new Xero operations**: Add to `xero-operations.test.ts`
2. **For protocol changes**: Add to `protocol.test.ts`
3. **For debug features**: Add to `debug-tool.test.ts`

Follow the existing patterns for consistency and proper error handling. 