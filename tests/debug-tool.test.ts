/// <reference types="jest" />

import './setup';
import { MCPTestClient } from './utils/test-client.js';

describe('Debug Tool Tests', () => {
  let client: MCPTestClient;
  const DEBUG_TOOL_NAME = 'xero-debug';

  beforeAll(async () => {
    // Connect to existing test server
    client = new MCPTestClient('http://localhost:3001');
    
    // Initialize MCP connection
    await client.initialize();
    await client.sendNotification('notifications/initialized');
  });

  describe('Echo Operation', () => {
    test('should respond to test-echo operation', async () => {
      const response = await client.callTool(DEBUG_TOOL_NAME, {
        operation: 'test-echo'
      });

      expect(response.error).toBeUndefined();
      expect(response.result).toBeDefined();

      // Check response structure
      const result = response.result as { content: Array<{ type: string; text: string }> };
      expect(result.content).toBeDefined();
      expect(Array.isArray(result.content)).toBe(true);
      expect(result.content.length).toBeGreaterThan(0);
      
      // Should contain echo success message
      const content = result.content[0];
      expect(content.type).toBe('text');
      expect(content.text).toContain('DEBUG ECHO SUCCESS');
      expect(content.text).toContain('Tool is working correctly');
    });

    test('should accept custom test message', async () => {
      const customMessage = 'Custom test message 123';
      const response = await client.callTool(DEBUG_TOOL_NAME, {
        operation: 'test-echo',
        testMessage: customMessage
      });

      expect(response.error).toBeUndefined();
      const result = response.result as { content: Array<{ type: string; text: string }> };
      expect(result.content[0].text).toContain(customMessage);
    });
  });

  describe('Basic Xero Operations', () => {
    test('should handle list-organisation-details', async () => {
      const response = await client.callTool(DEBUG_TOOL_NAME, {
        operation: 'list-organisation-details'
      });

      expect(response.error).toBeUndefined();
      const result = response.result as { content: Array<{ type: string; text: string }> };
      expect(result.content).toBeDefined();
      expect(result.content[0].type).toBe('text');
      
      // Should either succeed or return meaningful error
      const text = result.content[0].text;
      expect(text.length).toBeGreaterThan(10);
      
      if (text.includes('Organisation:')) {
        // Success case
        expect(text).toContain('Country:');
        expect(text).toContain('ID:');
      } else {
        // Error case - should be meaningful
        expect(text).toMatch(/Error|Unauthorized|Invalid|Failed/);
      }
    });

    test('should handle list-accounts', async () => {
      const response = await client.callTool(DEBUG_TOOL_NAME, {
        operation: 'list-accounts'
      });

      expect(response.error).toBeUndefined();
      const result = response.result as { content: Array<{ type: string; text: string }> };
      expect(result.content).toBeDefined();
      
      const text = result.content[0].text;
      if (text.includes('Found')) {
        expect(text).toMatch(/Found \d+ accounts/);
      } else if (text.includes('No accounts')) {
        expect(text).toBe('No accounts found');
      } else {
        // Error case
        expect(text).toMatch(/Error|Unauthorized|Invalid|Failed/);
      }
    });

    test('should handle list-contacts', async () => {
      const response = await client.callTool(DEBUG_TOOL_NAME, {
        operation: 'list-contacts'
      });

      expect(response.error).toBeUndefined();
      const result = response.result as { content: Array<{ type: string; text: string }> };
      expect(result.content).toBeDefined();
      
      const text = result.content[0].text;
      if (text.includes('Found')) {
        expect(text).toMatch(/Found \d+ contacts/);
      } else if (text.includes('No contacts')) {
        expect(text).toBe('No contacts found');
      } else {
        // Error case
        expect(text).toMatch(/Error|Unauthorized|Invalid|Failed/);
      }
    });
  });

  describe('Error Handling', () => {
    test('should handle unknown operation', async () => {
      const response = await client.callTool(DEBUG_TOOL_NAME, {
        operation: 'unknown-operation'
      });

      expect(response.error).toBeUndefined();
      const result = response.result as { content: Array<{ type: string; text: string }> };
      expect(result.content[0].text).toContain('Unknown operation');
    });

    test('should handle missing operation parameter', async () => {
      const response = await client.callTool(DEBUG_TOOL_NAME, {});

      // Should handle missing operation gracefully
      expect(response.result).toBeDefined();
    });
  });

  describe('Response Consistency', () => {
    test('should always return proper MCP response format', async () => {
      const response = await client.callTool(DEBUG_TOOL_NAME, {
        operation: 'test-echo'
      });

      expect(response.jsonrpc).toBe('2.0');
      expect(response.id).toBeDefined();
      expect(response.result).toBeDefined();
      expect(response.error).toBeUndefined();
    });

    test('should always return content array', async () => {
      const operations = ['test-echo', 'list-organisation-details', 'list-accounts', 'list-contacts'];
      
      for (const operation of operations) {
        const response = await client.callTool(DEBUG_TOOL_NAME, { operation });
        const result = response.result as { content: Array<{ type: string; text: string }> };
        
        expect(result.content).toBeDefined();
        expect(Array.isArray(result.content)).toBe(true);
        expect(result.content.length).toBeGreaterThan(0);
        expect(result.content[0].type).toBe('text');
        expect(typeof result.content[0].text).toBe('string');
      }
    });
  });
}); 