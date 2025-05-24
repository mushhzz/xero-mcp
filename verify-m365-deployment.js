#!/usr/bin/env node

/**
 * Microsoft 365 Copilot Deployment Verification Script
 * 
 * This script verifies that the Xero MCP Server is properly configured
 * and ready for Microsoft 365 Copilot integration.
 */

import fetch from 'node-fetch';

const SERVER_URL = process.env.SERVER_URL || 'http://localhost:3000';

console.log('🔍 Microsoft 365 Copilot Deployment Verification');
console.log('='.repeat(50));

async function verifyEndpoint(url, expectedData = {}) {
  try {
    console.log(`\n📡 Testing: ${url}`);
    const response = await fetch(url);
    
    if (!response.ok) {
      console.log(`❌ FAIL: HTTP ${response.status} ${response.statusText}`);
      return false;
    }
    
    const data = await response.json();
    console.log(`✅ PASS: HTTP ${response.status}`);
    
    // Verify expected data
    for (const [key, value] of Object.entries(expectedData)) {
      if (data[key] === value) {
        console.log(`   ✅ ${key}: ${value}`);
      } else {
        console.log(`   ❌ Expected ${key}: ${value}, got: ${data[key]}`);
        return false;
      }
    }
    
    return true;
  } catch (error) {
    console.log(`❌ FAIL: ${error.message}`);
    return false;
  }
}

async function verifySSEEndpoint(url) {
  try {
    console.log(`\n📡 Testing SSE: ${url}`);
    const response = await fetch(url, {
      headers: {
        'Accept': 'text/event-stream',
        'Cache-Control': 'no-cache'
      }
    });
    
    if (!response.ok) {
      console.log(`❌ FAIL: HTTP ${response.status} ${response.statusText}`);
      return false;
    }
    
    // Check SSE headers
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('text/event-stream')) {
      console.log(`✅ PASS: SSE endpoint responding`);
      console.log(`   ✅ Content-Type: ${contentType}`);
      return true;
    } else {
      console.log(`❌ FAIL: Expected text/event-stream, got: ${contentType}`);
      return false;
    }
  } catch (error) {
    console.log(`❌ FAIL: ${error.message}`);
    return false;
  }
}

async function main() {
  let allPassed = true;
  
  // Test root endpoint
  const rootPassed = await verifyEndpoint(`${SERVER_URL}/`, {
    platform: 'Microsoft Copilot Studio',
    status: 'ready',
    optimizedFor: 'Microsoft 365 Copilot'
  });
  allPassed = allPassed && rootPassed;
  
  // Test SSE endpoint (Microsoft Copilot Studio connection)
  const ssePassed = await verifySSEEndpoint(`${SERVER_URL}/sse`);
  allPassed = allPassed && ssePassed;
  
  // Summary
  console.log('\n' + '='.repeat(50));
  if (allPassed) {
    console.log('🎉 ALL TESTS PASSED!');
    console.log('✅ Server is ready for Microsoft 365 Copilot deployment');
    console.log('\n📋 Next Steps:');
    console.log('1. Deploy to Azure Web Apps');
    console.log('2. Configure HTTPS domain');
    console.log('3. Set up Xero OAuth credentials');
    console.log('4. Add server endpoint to Microsoft Copilot Studio');
    console.log(`   SSE Endpoint: ${SERVER_URL}/sse`);
    console.log(`   Message Endpoint: ${SERVER_URL}/mcp/xero`);
    process.exit(0);
  } else {
    console.log('❌ DEPLOYMENT VERIFICATION FAILED');
    console.log('🔧 Please fix the issues above before deploying to Microsoft 365 Copilot');
    process.exit(1);
  }
}

main().catch(error => {
  console.error('💥 Verification script error:', error);
  process.exit(1);
}); 