import express, { Request, Response } from 'express';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import cors from 'cors';

// Import the code-reusing mega-tool for maximum efficiency
import CopilotMegaTool from '../tools/copilot-mega-tool.js';
// import XeroDebugTool from '../tools/xero-debug-tool.js';

// Enhanced logging utilities
const logWithTimestamp = (level: string, message: string, data?: unknown) => {
  const timestamp = new Date().toISOString();
  console.log(`${timestamp} [${level}] ${message}`);
  if (data) {
    console.log(`${timestamp} [${level}] Data:`, JSON.stringify(data, null, 2));
  }
};

const logInfo = (message: string, data?: unknown) => logWithTimestamp('INFO', message, data);
const logError = (message: string, data?: unknown) => logWithTimestamp('ERROR', message, data);
const logDebug = (message: string, data?: unknown) => logWithTimestamp('DEBUG', message, data);

// Authentication and session tracking (static for this implementation)
// Note: These would be used in a production environment for monitoring

export async function startXeroMcpServer(): Promise<void> {
  const port = parseInt(process.env.PORT || "3000");

  try {
    console.log('✅ Starting Xero MCP Server with Code-Reusing Mega-Tool Pattern for M365 Compatibility');

    const app = express();
    app.use(express.json());

    // CORS configuration for Microsoft 365 Copilot Studio
    app.use(cors({
      origin: ['https://copilotstudio.microsoft.com', 'https://*.powerva.microsoft.com', 'https://*.dynamics.com'],
      credentials: true,
      methods: ['GET', 'POST', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Accept', 'Authorization', 'mcp-session-id'],
    }));

    // Simple rate limiting for M365 Copilot Studio
    const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
    const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
    const RATE_LIMIT_MAX = 100; // requests per window

    function rateLimitMiddleware(req: Request, res: Response, next: () => void) {
      const clientId = req.ip || 'unknown';
      const now = Date.now();
      
      // Clean expired entries
      for (const [key, value] of rateLimitMap.entries()) {
        if (now > value.resetTime) {
          rateLimitMap.delete(key);
        }
      }
      
      // Check current client
      const clientData = rateLimitMap.get(clientId) || { count: 0, resetTime: now + RATE_LIMIT_WINDOW };
      
      if (now > clientData.resetTime) {
        clientData.count = 1;
        clientData.resetTime = now + RATE_LIMIT_WINDOW;
      } else {
        clientData.count++;
      }
      
      rateLimitMap.set(clientId, clientData);
      
      logDebug(`Rate limit check passed for ${clientId}`, { count: clientData.count, limit: RATE_LIMIT_MAX });
      
      if (clientData.count > RATE_LIMIT_MAX) {
        logError(`Rate limit exceeded for ${clientId}`, { count: clientData.count, limit: RATE_LIMIT_MAX });
        res.status(429).json({ error: 'Rate limit exceeded' });
        return;
      }
      
      next();
    }

    // Apply rate limiting
    app.use(rateLimitMiddleware);

    // M365 Copilot Studio compatibility middleware
    app.use('/mcp/', (req, res, next) => {
      const acceptHeader = req.headers.accept;
      
      // If no Accept header or missing required content types, add them for M365 compatibility
      if (!acceptHeader || 
          (!acceptHeader.includes('application/json') || !acceptHeader.includes('text/event-stream'))) {
        logDebug('🔧 M365 Copilot Studio compatibility: Adding required Accept headers');
        req.headers.accept = 'application/json, text/event-stream';
      }
      
      logDebug('📋 Accept header:', req.headers.accept);
      next();
    });

    // Create MCP server with streamlined configuration for M365 Copilot Studio
    const server = new McpServer({
      name: "xero-mcp-server",
      description: "Xero MCP Server optimized for Microsoft 365 Copilot Studio with consolidated tool access",
      version: "1.0.0"
    }, {
      capabilities: {
        tools: {}
      }
    });

    logInfo('✅ MCP Server created successfully');

    // Register the SINGLE code-reusing mega-tool for M365 compatibility
    const tool = CopilotMegaTool();
    server.tool(tool.name, tool.description, tool.schema, tool.handler);
    logInfo('🎯 Xero Copilot Mega-Tool registered - Single tool with all operations, reusing existing code');

    // Create StreamableHTTP transport  
    const transport = new StreamableHTTPServerTransport({
      sessionIdGenerator: undefined, // stateless for M365 compatibility
    });

    const setupServer = async () => {
      await server.connect(transport);
      logInfo('🔗 MCP Server connected to StreamableHTTP transport');
    };

    // PRIMARY ENDPOINT: M365 Copilot Studio MCP JSON-RPC endpoint
    app.post("/mcp/", async (req: Request, res: Response) => {
      const method = req.body?.method || 'unknown';
      const requestId = req.body?.id || 'unknown';
      
      logInfo('📨 Received MCP request', { 
        method, 
        requestId, 
        ip: req.ip,
        contentLength: req.headers['content-length'],
        body: JSON.stringify(req.body)
      });

      try {
        await transport.handleRequest(req, res, req.body);
        logInfo('✅ MCP request handled successfully', { method, requestId });
      } catch (error) {
        logError("❌ Error handling MCP request", { 
          method, 
          requestId, 
          error: (error as Error).message,
          stack: (error as Error).stack
        });
        
        if (!res.headersSent) {
          res.status(500).json({
            jsonrpc: "2.0",
            error: {
              code: -32603,
              message: "Internal error",
            },
            id: requestId,
          });
        }
      }
    });

    // Health check endpoint
    app.get("/health", (req: Request, res: Response) => {
      res.json({
        status: "healthy",
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        toolPattern: "code-reusing-mega-tool"
      });
    });

    // Root endpoint with server info
    app.get("/", (req: Request, res: Response) => {
      res.json({
        name: "Xero MCP Server",
        description: "Microsoft 365 Copilot Studio compatible MCP server with consolidated Xero API access",
        version: "1.0.0",
        compatibility: "Microsoft 365 Copilot Studio optimized",
        toolPattern: "Code-Reusing Mega-Tool (Single tool with all operations)",
        codeReuse: "100% - reuses all existing modular tools",
        endpoints: {
          mcp: "/mcp/",
          health: "/health"
        }
      });
    });

    // Debug endpoint for testing
    app.post("/debug", async (req: Request, res: Response) => {
      logInfo('🐛 Debug request received', {
        body: req.body,
        headers: req.headers,
        method: req.method,
        url: req.url
      });
      
      res.json({
        message: "Debug data logged",
        receivedBody: req.body,
        receivedHeaders: req.headers
      });
    });

    // Setup server connection
    await setupServer();

    // Start the M365 compliant server
    app.listen(port, () => {
      logInfo(`🎉 M365 Compliant Xero MCP Server listening on port ${port}`);
      logInfo(`📡 M365 Copilot Studio MCP endpoint: http://localhost:${port}/mcp/`);
      logInfo(`🔧 Transport: StreamableHTTP (M365 optimized)`);
      logInfo(`🎯 Tool Pattern: Code-Reusing Mega-Tool (Single tool with all Xero operations)`);
      logInfo(`♻️  Code Reuse: 100% - reuses all existing modular tools`);
      logInfo(`💚 CORS: Configured for Microsoft domains`);
      logInfo(`🛡️ Rate Limiting: ${RATE_LIMIT_MAX} requests per minute`);
      logInfo(`🏥 Health Check: http://localhost:${port}/health`);
      logInfo(`📋 Server Info: http://localhost:${port}/`);
    });

  } catch (error) {
    logError('💥 Failed to start Xero MCP Server', { error: (error as Error).message, stack: (error as Error).stack });
    process.exit(1);
  }
}
