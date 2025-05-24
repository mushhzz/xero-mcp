#!/usr/bin/env node

/**
 * Environment Variable Checker for Azure Deployment
 * This script helps verify that all required environment variables are set correctly
 */

// Load .env file
require('dotenv').config();

const requiredVars = [
  'XERO_CLIENT_ID',
  'XERO_CLIENT_SECRET',
  'TRANSPORT_MODE'
];

const optionalVars = [
  'XERO_CLIENT_BEARER_TOKEN',
  'XERO_REDIRECT_URI',
  'PORT',
  'NODE_ENV',
  'RATE_LIMIT_MAX',
  'LOG_LEVEL'
];

console.log('🔍 Environment Variable Check');
console.log('='.repeat(50));

console.log('\n✅ Required Variables:');
let missingRequired = [];
requiredVars.forEach(varName => {
  const value = process.env[varName];
  if (value) {
    console.log(`   ✅ ${varName}: ${value.substring(0, 10)}...`);
  } else {
    console.log(`   ❌ ${varName}: NOT SET`);
    missingRequired.push(varName);
  }
});

console.log('\n📋 Optional Variables:');
optionalVars.forEach(varName => {
  const value = process.env[varName];
  if (value) {
    console.log(`   ✅ ${varName}: ${value.substring(0, 10)}...`);
  } else {
    console.log(`   ⚪ ${varName}: Not set`);
  }
});

console.log('\n🔧 Authentication Method:');
if (process.env.XERO_CLIENT_BEARER_TOKEN) {
  console.log('   🎯 Using Bearer Token (Recommended for M365)');
} else if (process.env.XERO_CLIENT_ID && process.env.XERO_CLIENT_SECRET) {
  console.log('   🔑 Using Client Credentials (May require tenant connection)');
} else {
  console.log('   ❌ No valid authentication method configured');
}

console.log('\n📊 Summary:');
if (missingRequired.length === 0) {
  console.log('   ✅ All required environment variables are set');
} else {
  console.log(`   ❌ Missing required variables: ${missingRequired.join(', ')}`);
}

console.log('\n💡 For Azure App Service:');
console.log('   1. Go to your App Service in Azure Portal');
console.log('   2. Navigate to Settings > Environment variables');
console.log('   3. Add the missing variables from your .env file');
console.log('   4. Restart the App Service');
