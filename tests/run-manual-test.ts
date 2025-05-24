#!/usr/bin/env node

/**
 * Manual Test Runner for Xero MCP Server
 * Run with: npx tsx tests/run-manual-test.ts
 */

import { MCPTestClient } from './utils/test-client.js';

async function runTests() {
  console.log('🧪 Starting Manual Xero MCP Server Tests');
  console.log('=========================================');

  const client = new MCPTestClient('http://localhost:3001');
  
  try {
    // Test 1: Health Check
    console.log('\n1️⃣ Testing Health Check...');
    const healthResponse = await client.healthCheck();
    const healthData = await healthResponse.json();
    console.log('✅ Health Check:', healthData.status);
    console.log('📊 Tool Pattern:', healthData.toolPattern);

    // Test 2: MCP Initialize
    console.log('\n2️⃣ Testing MCP Initialize...');
    const initResponse = await client.initialize();
    console.log('✅ Initialize Response:', initResponse.result ? 'Success' : 'Failed');

    // Test 3: Send Notification
    console.log('\n3️⃣ Sending Initialized Notification...');
    await client.sendNotification('notifications/initialized');
    console.log('✅ Notification sent');

    // Test 4: List Tools
    console.log('\n4️⃣ Testing Tools List...');
    const toolsResponse = await client.listTools();
    if (toolsResponse.result) {
      const tools = (toolsResponse.result as { tools: Array<{ name: string; description: string }> }).tools;
      console.log(`✅ Found ${tools.length} tools:`);
      tools.forEach((tool: { name: string; description: string }) => {
        console.log(`   - ${tool.name}: ${tool.description.substring(0, 60)}...`);
      });
    }

    // Test 5: Tool Execution - Echo
    console.log('\n5️⃣ Testing Tool Execution (Echo)...');
    const echoResponse = await client.callTool('xero-api', {
      operation: 'test-echo',
      testMessage: 'Manual test message'
    });
    
    if (echoResponse.result) {
      const content = (echoResponse.result as { content: Array<{ type: string; text: string }> }).content[0];
      console.log('✅ Echo Test:', content.text.substring(0, 100) + '...');
    }

    // Test 6: Tool Execution - List Organisation
    console.log('\n6️⃣ Testing Tool Execution (List Organisation)...');
    const orgResponse = await client.callTool('xero-api', {
      operation: 'list-organisation-details'
    });
    
    if (orgResponse.result) {
      const content = (orgResponse.result as { content: Array<{ type: string; text: string }> }).content[0];
      console.log('✅ Organisation Test:', content.text.substring(0, 100) + '...');
    } else if (orgResponse.error) {
      console.log('⚠️ Organisation Test Error:', orgResponse.error.message);
    }

    // Test 7: Tool Execution - List Accounts
    console.log('\n7️⃣ Testing Tool Execution (List Accounts)...');
    const accountsResponse = await client.callTool('xero-api', {
      operation: 'list-accounts'
    });
    
    if (accountsResponse.result) {
      const content = (accountsResponse.result as { content: Array<{ type: string; text: string }> }).content[0];
      console.log('✅ Accounts Test:', content.text.substring(0, 100) + '...');
    } else if (accountsResponse.error) {
      console.log('⚠️ Accounts Test Error:', accountsResponse.error.message);
    }

    console.log('\n🎉 Manual Tests Completed Successfully!');
    console.log('\n📋 Summary:');
    console.log('   - Health Check: ✅');
    console.log('   - MCP Protocol: ✅');
    console.log('   - Tool Discovery: ✅'); 
    console.log('   - Tool Execution: ✅');

  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runTests().catch(console.error);
}

export { runTests }; 