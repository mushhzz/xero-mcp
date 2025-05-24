interface MCPRequest {
  jsonrpc: '2.0';
  id: string | number;
  method: string;
  params?: unknown;
}

interface MCPResponse {
  jsonrpc: '2.0';
  id: string | number;
  result?: unknown;
  error?: {
    code: number;
    message: string;
    data?: unknown;
  };
}

export class MCPTestClient {
  private baseUrl: string;
  private requestId = 1;

  constructor(baseUrl = 'http://localhost:3001') {
    this.baseUrl = baseUrl;
  }

  private async makeRequest(method: string, params?: unknown): Promise<MCPResponse> {
    const request: MCPRequest = {
      jsonrpc: '2.0',
      id: this.requestId++,
      method,
      params
    };

    const response = await fetch(`${this.baseUrl}/mcp/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(request)
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const text = await response.text();
    
    // Handle Server-Sent Events response
    if (text.startsWith('event:') || text.includes('data:')) {
      const lines = text.split('\n');
      for (const line of lines) {
        if (line.startsWith('data: ')) {
          try {
            return JSON.parse(line.substring(6));
          } catch {
            // Continue looking for valid JSON
          }
        }
      }
      throw new Error('No valid JSON found in SSE response');
    }
    
    // Handle regular JSON response
    return JSON.parse(text);
  }

  async initialize(): Promise<MCPResponse> {
    return this.makeRequest('initialize', {
      protocolVersion: '2024-11-05',
      capabilities: {
        tools: {}
      },
      clientInfo: {
        name: 'test-client',
        version: '1.0.0'
      }
    });
  }

  async sendNotification(method: string, params?: unknown): Promise<void> {
    const notification = {
      jsonrpc: '2.0' as const,
      method,
      params
    };

    await fetch(`${this.baseUrl}/mcp/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(notification)
    });
  }

  async listTools(): Promise<MCPResponse> {
    return this.makeRequest('tools/list');
  }

  async callTool(name: string, arguments_?: Record<string, unknown>): Promise<MCPResponse> {
    return this.makeRequest('tools/call', {
      name,
      arguments: arguments_ || {}
    });
  }

  async healthCheck(): Promise<Response> {
    return fetch(`${this.baseUrl}/health`);
  }
} 