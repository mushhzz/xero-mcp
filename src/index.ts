#!/usr/bin/env node

import { startXeroMcpServer } from "./server/xero-m365-server.js";

const main = async () => {
  console.log(`🚀 Starting Xero MCP Server with comprehensive logging...`);
  await startXeroMcpServer();
};

main().catch((error) => {
  console.error("❌ Error starting Xero MCP Server:", error);
  process.exit(1);
});
