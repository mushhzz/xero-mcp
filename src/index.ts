#!/usr/bin/env node
import { startXeroMcpServer } from './server/xero-m365-server.js';

// Start the M365-optimized Xero MCP Server
startXeroMcpServer().catch(console.error);
