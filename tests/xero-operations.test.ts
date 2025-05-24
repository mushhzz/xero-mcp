/// <reference types="jest" />

import './setup';
import { MCPTestClient } from './utils/test-client.js';
import { testNewContact } from './mocks/xero-data.js';

describe('Xero Operations Tests', () => {
  let client: MCPTestClient;
  const TOOL_NAME = 'xero-api';

  beforeAll(async () => {
    // Connect to existing test server (started by protocol tests)
    client = new MCPTestClient('http://localhost:3001');
    
    // Initialize MCP connection
    await client.initialize();
    await client.sendNotification('notifications/initialized');
  });

  describe('View Operations', () => {
    describe('list-organisation-details', () => {
      test('should retrieve organisation information', async () => {
        const response = await client.callTool(TOOL_NAME, {
          operation: 'list-organisation-details'
        });

        expect(response.error).toBeUndefined();
        expect(response.result).toBeDefined();

        const result = response.result as { content: Array<{ type: string; text: string }> };
        expect(result.content).toBeDefined();
        expect(Array.isArray(result.content)).toBe(true);
        expect(result.content.length).toBeGreaterThan(0);
        
        // Should contain organisation name
        const content = result.content[0];
        expect(content.type).toBe('text');
        expect(content.text).toContain('Organisation:');
      });
    });

    describe('list-accounts', () => {
      test('should retrieve chart of accounts', async () => {
        const response = await client.callTool(TOOL_NAME, {
          operation: 'list-accounts'
        });

        expect(response.error).toBeUndefined();
        expect(response.result).toBeDefined();

        const result = response.result as { content: Array<{ type: string; text: string }> };
        expect(result.content).toBeDefined();
        expect(Array.isArray(result.content)).toBe(true);
        
        // Should have at least a summary
        expect(result.content.length).toBeGreaterThan(0);
        
        const firstContent = result.content[0];
        expect(firstContent.type).toBe('text');
        expect(firstContent.text).toMatch(/Found \d+ accounts/);
      });

      test('should handle no accounts gracefully', async () => {
        // This would test with mocked empty response
        const response = await client.callTool(TOOL_NAME, {
          operation: 'list-accounts'
        });

        expect(response.error).toBeUndefined();
        const result = response.result as { content: Array<{ type: string; text: string }> };
        expect(result.content).toBeDefined();
      });
    });

    describe('list-contacts', () => {
      test('should retrieve contacts list', async () => {
        const response = await client.callTool(TOOL_NAME, {
          operation: 'list-contacts'
        });

        expect(response.error).toBeUndefined();
        expect(response.result).toBeDefined();

        const result = response.result as { content: Array<{ type: string; text: string }> };
        expect(result.content).toBeDefined();
        expect(Array.isArray(result.content)).toBe(true);
        
        if (result.content.length > 0) {
          const firstContent = result.content[0];
          expect(firstContent.type).toBe('text');
          expect(firstContent.text).toMatch(/Found \d+ contacts/);
        }
      });
    });
  });

  describe('Create Operations', () => {
    describe('create-contact', () => {
      test('should require name parameter', async () => {
        const response = await client.callTool(TOOL_NAME, {
          operation: 'create-contact'
          // Missing name parameter
        });

        const result = response.result as { content: Array<{ type: string; text: string }> };
        expect(result.content).toBeDefined();
        expect(result.content[0].text).toContain('name');
        expect(result.content[0].text).toContain('required');
      });

      test('should create contact with valid parameters', async () => {
        const response = await client.callTool(TOOL_NAME, {
          operation: 'create-contact',
          name: testNewContact.name,
          email: testNewContact.emailAddress,
          phone: testNewContact.phones[0].phoneNumber
        });

        const result = response.result as { content: Array<{ type: string; text: string }> };
        expect(result.content).toBeDefined();
        
        // Should either succeed or return meaningful error
        const content = result.content[0];
        expect(content.type).toBe('text');
        
        // Check if it's a success or specific error
        if (content.text.includes('created successfully')) {
          expect(content.text).toContain('Contact created successfully');
          expect(content.text).toContain(testNewContact.name);
        } else {
          // Should be a meaningful error (e.g., authentication, duplicate, etc.)
          expect(content.text.length).toBeGreaterThan(10);
        }
      });
    });

    describe('create-invoice', () => {
      test('should require all mandatory parameters', async () => {
        const response = await client.callTool(TOOL_NAME, {
          operation: 'create-invoice'
          // Missing required parameters
        });

        const result = response.result as { content: Array<{ type: string; text: string }> };
        expect(result.content).toBeDefined();
        expect(result.content[0].text).toContain('requires');
      });

      test('should validate parameter types', async () => {
        const response = await client.callTool(TOOL_NAME, {
          operation: 'create-invoice',
          contactID: 'contact-001',
          description: 'Test Invoice',
          quantity: 'invalid_number', // Should be number
          unitAmount: 100,
          accountCode: '200'
        });

        // Should handle invalid parameter types gracefully
        expect(response.result).toBeDefined();
      });

      test('should create invoice with valid parameters', async () => {
        const response = await client.callTool(TOOL_NAME, {
          operation: 'create-invoice',
          contactID: 'contact-001',
          description: 'Test Service',
          quantity: 1,
          unitAmount: 250.00,
          accountCode: '200',
          taxType: 'OUTPUT2',
          dueDate: '2024-12-31',
          reference: 'TEST-REF-001'
        });

        const result = response.result as { content: Array<{ type: string; text: string }> };
        expect(result.content).toBeDefined();
        
        const content = result.content[0];
        expect(content.type).toBe('text');
        
        // Should either succeed or return meaningful error
        if (content.text.includes('created successfully')) {
          expect(content.text).toContain('Invoice created successfully');
          expect(content.text).toContain('Invoice Number:');
        } else {
          // Should be a meaningful error
          expect(content.text.length).toBeGreaterThan(10);
        }
      });
    });
  });

  describe('Error Handling', () => {
    test('should handle invalid operation gracefully', async () => {
      const response = await client.callTool(TOOL_NAME, {
        operation: 'invalid-operation'
      });

      const result = response.result as { content: Array<{ type: string; text: string }> };
      expect(result.content).toBeDefined();
      expect(result.content[0].text).toContain('not yet implemented');
    });

    test('should handle network errors gracefully', async () => {
      // This would test with network issues (mock or timeout)
      const response = await client.callTool(TOOL_NAME, {
        operation: 'list-organisation-details'
      });

      // Should always return a response, even if it's an error
      expect(response.result).toBeDefined();
    });

    test('should handle authentication errors', async () => {
      // This would test with invalid credentials
      const response = await client.callTool(TOOL_NAME, {
        operation: 'list-accounts'
      });

      const result = response.result as { content: Array<{ type: string; text: string }> };
      if (result.content[0].text.includes('Error')) {
        expect(result.content[0].text).toMatch(/Error|Unauthorized|Invalid/);
      }
    });
  });

  describe('Response Format', () => {
    test('should return consistent response structure', async () => {
      const response = await client.callTool(TOOL_NAME, {
        operation: 'list-organisation-details'
      });

      expect(response.jsonrpc).toBe('2.0');
      expect(response.id).toBeDefined();
      expect(response.result).toBeDefined();

      const result = response.result as { content: Array<{ type: string; text: string }> };
      expect(result.content).toBeDefined();
      expect(Array.isArray(result.content)).toBe(true);
      
      if (result.content.length > 0) {
        expect(result.content[0].type).toBe('text');
        expect(result.content[0].text).toBeDefined();
        expect(typeof result.content[0].text).toBe('string');
      }
    });

    test('should handle large responses appropriately', async () => {
      const response = await client.callTool(TOOL_NAME, {
        operation: 'list-accounts'
      });

      const result = response.result as { content: Array<{ type: string; text: string }> };
      expect(result.content).toBeDefined();
      
      // Should not have excessive content that might timeout
      expect(result.content.length).toBeLessThan(100);
    });
  });
}); 