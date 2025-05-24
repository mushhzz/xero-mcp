#!/bin/bash

echo "🚀 Starting M365 Copilot Studio Compliant Xero MCP Server..."
echo "🎯 Platform: Microsoft 365 Copilot Studio"
echo "🔧 Transport: StreamableHTTP + SSE (Server-Sent Events)"
echo "📡 Endpoints: /sse (GET), /mcp (POST), /health (GET)"

# Set environment for production Microsoft 365 Copilot deployment
export TRANSPORT_MODE=m365
export NODE_ENV=production

# Start the M365 compliant server
npm run start:m365