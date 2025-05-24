#!/usr/bin/env node

/**
 * Real Xero Tool Testing Suite
 * Tests actual Xero operations with comprehensive validation
 * Run with: npx tsx tests/real-tool-tests.ts
 */

import { startXeroMcpServer } from '../src/server/xero-m365-server.js';
import { MCPTestClient } from './utils/test-client.js';

// Real Xero operations to test
const XERO_OPERATIONS = [
  // View Operations
  'list-organisation-details',
  'list-accounts', 
  'list-contacts',
  'list-invoices',
  'list-items',
  'list-payments',
  'list-credit-notes',
  'list-quotes',
  'list-bank-transactions',
  'list-manual-journals',
  'list-tax-rates',
  'list-tracking-categories',
  
  // Financial Reports
  'list-trial-balance',
  'list-profit-and-loss',
  'list-balance-sheet',
  'list-aged-receivables',
  'list-aged-payables',
  
  // Payroll Operations (if available)
  'list-payroll-employees',
  'list-payroll-timesheets',
  'list-payroll-leave-types'
];

// Test configuration
const TEST_CONFIG = {
  maxTestsToRun: 10, // Limit for comprehensive testing
  timeoutPerTest: 5000, // 5 seconds per test
  serverPort: 3001
};

interface TestResult {
  operation: string;
  success: boolean;
  hasData: boolean;
  responseTime: number;
  error?: string;
  dataPreview?: string;
}

class RealToolTester {
  public client: MCPTestClient;
  private results: TestResult[] = [];

  constructor(baseUrl: string) {
    this.client = new MCPTestClient(baseUrl);
  }

  async testOperation(operation: string): Promise<TestResult> {
    const startTime = Date.now();
    
    try {
      console.log(`🔍 Testing: ${operation}`);
      
            const response = await Promise.race([        this.client.callTool('xero-api', { operation }),        new Promise((_, reject) =>           setTimeout(() => reject(new Error('Timeout')), TEST_CONFIG.timeoutPerTest)        )      ]) as { error?: { message?: string }; result?: { content?: Array<{ text?: string }> } };

      const responseTime = Date.now() - startTime;
      
      if (response.error) {
        return {
          operation,
          success: false,
          hasData: false,
          responseTime,
          error: response.error.message || 'Unknown error'
        };
      }

      if (response.result?.content?.[0]?.text) {
        const text = response.result.content[0].text;
        const hasData = !text.includes('No ') && !text.includes('Error') && text.length > 50;
        
        return {
          operation,
          success: true,
          hasData,
          responseTime,
          dataPreview: text.substring(0, 80) + '...'
        };
      }

      return {
        operation,
        success: false,
        hasData: false,
        responseTime,
        error: 'No valid response content'
      };

    } catch (error) {
      return {
        operation,
        success: false,
        hasData: false,
        responseTime: Date.now() - startTime,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  async runAllTests(): Promise<void> {
    console.log(`🧪 Starting Real Xero Tool Tests (${Math.min(XERO_OPERATIONS.length, TEST_CONFIG.maxTestsToRun)} operations)`);
    console.log('='.repeat(80));

    const operationsToTest = XERO_OPERATIONS.slice(0, TEST_CONFIG.maxTestsToRun);
    
    for (let i = 0; i < operationsToTest.length; i++) {
      const operation = operationsToTest[i];
      const result = await this.testOperation(operation);
      this.results.push(result);
      
      // Display immediate feedback
      if (result.success) {
        const dataStatus = result.hasData ? '📊 Has Data' : '📝 Empty/No Data';
        console.log(`✅ ${operation} (${result.responseTime}ms) - ${dataStatus}`);
        if (result.dataPreview) {
          console.log(`   Preview: ${result.dataPreview}`);
        }
      } else {
        console.log(`❌ ${operation} (${result.responseTime}ms) - ${result.error}`);
      }
      
      console.log(''); // Space between tests
    }
  }

  generateReport(): void {
    console.log('\n📊 REAL XERO TOOL TEST REPORT');
    console.log('='.repeat(50));

    const successful = this.results.filter(r => r.success);
    const withData = this.results.filter(r => r.hasData);
    const avgResponseTime = this.results.reduce((sum, r) => sum + r.responseTime, 0) / this.results.length;

    console.log(`Total Operations Tested: ${this.results.length}`);
    console.log(`Successful Operations: ${successful.length} (${Math.round(successful.length/this.results.length*100)}%)`);
    console.log(`Operations with Data: ${withData.length} (${Math.round(withData.length/this.results.length*100)}%)`);
    console.log(`Average Response Time: ${Math.round(avgResponseTime)}ms`);

    console.log('\n✅ SUCCESSFUL OPERATIONS:');
    successful.forEach(result => {
      const dataStatus = result.hasData ? '📊' : '📝';
      console.log(`   ${dataStatus} ${result.operation} (${result.responseTime}ms)`);
    });

    const failed = this.results.filter(r => !r.success);
    if (failed.length > 0) {
      console.log('\n❌ FAILED OPERATIONS:');
      failed.forEach(result => {
        console.log(`   ${result.operation}: ${result.error}`);
      });
    }

    console.log('\n📈 OPERATIONS WITH REAL DATA:');
    withData.forEach(result => {
      console.log(`   📊 ${result.operation}`);
      if (result.dataPreview) {
        console.log(`      "${result.dataPreview}"`);
      }
    });

    // Overall assessment
    const successRate = successful.length / this.results.length;
    const dataRate = withData.length / this.results.length;
    
    console.log('\n🎯 ASSESSMENT:');
    if (successRate >= 0.8 && dataRate >= 0.3) {
      console.log('🎉 EXCELLENT: Xero MCP Server is working well with real data access!');
    } else if (successRate >= 0.6) {
      console.log('✅ GOOD: Most operations work, some may need authentication or setup');
    } else {
      console.log('⚠️ NEEDS ATTENTION: Many operations failing, check authentication/configuration');
    }
  }
}

async function main(): Promise<void> {
  try {
    console.log('🔬 Real Xero Tool Testing Suite');
    console.log('===============================');
    
    // Set test environment
    process.env.NODE_ENV = 'test';
    process.env.PORT = TEST_CONFIG.serverPort.toString();
    process.env.XERO_CLIENT_ID = 'test-client-id';
    process.env.XERO_CLIENT_SECRET = 'test-client-secret';
    process.env.XERO_REDIRECT_URI = `http://localhost:${TEST_CONFIG.serverPort}/callback`;
    
    // Start server
    console.log('🚀 Starting Xero MCP Server...');
    await startXeroMcpServer();
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Initialize tester
    const tester = new RealToolTester(`http://localhost:${TEST_CONFIG.serverPort}`);
    
    // Initialize MCP connection
    await tester.client.initialize();
    await tester.client.sendNotification('notifications/initialized');
    
    // Run tests
    await tester.runAllTests();
    
    // Generate report
    tester.generateReport();
    
    console.log('\n✅ Real tool testing completed!');
    
  } catch (error) {
    console.error('❌ Test suite failed:', error);
    process.exit(1);
  }
}

// Run immediately
main().catch(console.error); 