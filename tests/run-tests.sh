#!/bin/bash

echo "🧪 Xero MCP Server Test Suite"
echo "=============================="

# Check if Jest is installed
if ! command -v jest &> /dev/null; then
    echo "❌ Jest not found. Installing test dependencies..."
    npm install --save-dev @types/jest jest ts-jest
fi

# Check if server dependencies are installed
if [ ! -d "node_modules" ]; then
    echo "❌ Dependencies not found. Installing..."
    npm install
fi

# Build the project first
echo "🔨 Building project..."
npm run build

# Start the server in background for testing
echo "🚀 Starting test server..."
PORT=3001 npm start &
SERVER_PID=$!

# Wait for server to start
sleep 3

# Run the tests
echo "🧪 Running tests..."

if [ "$1" = "debug" ]; then
    DEBUG_TESTS=true npm test -- --verbose
elif [ "$1" = "coverage" ]; then
    npm run test:coverage
elif [ "$1" = "watch" ]; then
    npm run test:watch
else
    npm test
fi

# Clean up
echo "🧹 Cleaning up..."
kill $SERVER_PID 2>/dev/null

echo "✅ Test run complete!" 