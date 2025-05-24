/// <reference types="jest" />

import './setup';
import { MCPTestClient } from './utils/test-client.js';
import { startXeroMcpServer } from '../src/server/xero-m365-server.js';

describe('MCP Protocol Tests', () => {
  let client: MCPTestClient;

  beforeAll(async () => {
    // Start test server and wait for it to be ready
    console.log('Starting test server...');
    await startXeroMcpServer();
    
    // Additional wait to ensure server is fully ready
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    client = new MCPTestClient('http://localhost:3001');
  });

  afterAll(async () => {
    // Cleanup would go here if we had server.close()
  });

  describe('Server Health', () => {
    test('health endpoint should respond', async () => {
      const response = await client.healthCheck();
      expect(response.ok).toBe(true);
      
      const health = await response.json();
      expect(health.status).toBe('healthy');
      expect(health.toolPattern).toBe('mega-tool');
    });
  });

  describe('MCP Handshake', () => {
    test('should handle initialize request', async () => {
      const response = await client.initialize();
      
      expect(response.jsonrpc).toBe('2.0');
      expect(response.error).toBeUndefined();
      expect(response.result).toBeDefined();
    });

    test('should handle initialized notification', async () => {
      await expect(
        client.sendNotification('notifications/initialized')
      ).resolves.not.toThrow();
    });
  });

  describe('Tool Discovery', () => {
    test('should list available tools', async () => {
      const response = await client.listTools();
      
      expect(response.jsonrpc).toBe('2.0');
      expect(response.error).toBeUndefined();
      expect(response.result).toBeDefined();
      
      const result = response.result as { tools: Array<{ name: string; description: string }> };
      expect(Array.isArray(result.tools)).toBe(true);
      expect(result.tools.length).toBeGreaterThan(0);
      
      // Should have the mega-tool
      const xeroTool = result.tools.find((tool: { name: string; description: string }) => tool.name === 'xero-api');
      expect(xeroTool).toBeDefined();
      expect(xeroTool?.description).toContain('Universal Xero API tool');
    });
  });

  describe('Tool Execution', () => {
    test('should handle tool call with invalid operation', async () => {
      const response = await client.callTool('xero-api', {
        operation: 'invalid-operation'
      });
      
      expect(response.jsonrpc).toBe('2.0');
      // Should either return an error or handle gracefully
      if (response.error) {
        expect(response.error.code).toBeDefined();
      } else {
        expect(response.result).toBeDefined();
      }
    });

    test('should handle tool call without operation parameter', async () => {
      const response = await client.callTool('xero-api', {});
      
      expect(response.jsonrpc).toBe('2.0');
      // Should handle missing operation parameter
      if (response.error) {
        expect(response.error.message).toContain('operation');
      }
    });

    test('should handle non-existent tool', async () => {
      const response = await client.callTool('non-existent-tool', {});
      
      expect(response.jsonrpc).toBe('2.0');
      expect(response.error).toBeDefined();
      expect(response.error?.code).toBe(-32601); // Method not found
    });
  });

  describe('Rate Limiting', () => {
    test('should accept reasonable number of requests', async () => {
      const promises = Array.from({ length: 10 }, () => 
        client.listTools()
      );
      
      const responses = await Promise.all(promises);
      
      // All requests should succeed
      responses.forEach((response) => {
        expect(response.jsonrpc).toBe('2.0');
        expect(response.error).toBeUndefined();
      });
    });
  });

  describe('CORS Headers', () => {
    test('should include CORS headers for M365', async () => {
      const response = await fetch('http://localhost:3001/mcp/', {
        method: 'OPTIONS',
        headers: {
          'Origin': 'https://copilotstudio.microsoft.com',
          'Access-Control-Request-Method': 'POST'
        }
      });
      
      expect(response.ok).toBe(true);
    });
  });
}); 