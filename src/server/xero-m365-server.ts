import express, { Request, Response } from 'express';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';

import cors from 'cors';

// Import handlers directly for better logging
import { listXeroAccounts } from '../handlers/list-xero-accounts.handler.js';
import { listXeroContacts } from '../handlers/list-xero-contacts.handler.js';
import { listXeroOrganisationDetails } from '../handlers/list-xero-organisation-details.handler.js';

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
const logWarn = (message: string, data?: unknown) => logWithTimestamp('WARN', message, data);

// Authentication monitoring
let authenticationAttempts = 0;
let successfulAuthentications = 0;
let failedAuthentications = 0;

// Session tracking for lifecycle monitoring
const sessionTracker = new Map<string, {
  created: number;
  lastUsed: number;
  toolsCalled: string[];
  authStatus: 'unknown' | 'success' | 'failed';
}>();

// Rate limiting for debugging
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX = 100;

function rateLimitMiddleware(req: Request, res: Response, next: () => void) {
  const clientId = req.ip || 'unknown';
  const now = Date.now();
  
  // Clean expired entries
  for (const [key, data] of rateLimitMap.entries()) {
    if (now > data.resetTime) {
      rateLimitMap.delete(key);
    }
  }
  
  const current = rateLimitMap.get(clientId) || { count: 0, resetTime: now + RATE_LIMIT_WINDOW };
  
  if (current.count >= RATE_LIMIT_MAX) {
    logWarn(`Rate limit exceeded for ${clientId}`, { count: current.count, limit: RATE_LIMIT_MAX });
    res.status(429).json({
      jsonrpc: "2.0",
      error: { code: -32000, message: "Rate limit exceeded" },
      id: null,
    });
    return;
  }
  
  current.count++;
  rateLimitMap.set(clientId, current);
  logDebug(`Rate limit check passed for ${clientId}`, { count: current.count, limit: RATE_LIMIT_MAX });
  
  next();
}

export async function startXeroMcpServer() {
  const port = parseInt(process.env.PORT || '3000', 10);

  try {
    logInfo('🚀 Starting Xero MCP Server with comprehensive logging enabled');

    // Create MCP server matching working sample pattern
    const server = new McpServer({
      name: "xero-mcp-server",
      version: "1.0.0",
    });

    logInfo('✅ MCP Server created with stateless configuration');

    // Test Xero authentication immediately
    logInfo('🔐 Testing Xero authentication...');
    try {
      authenticationAttempts++;
      const testAuth = await listXeroOrganisationDetails();
      successfulAuthentications++;
      logInfo('✅ Xero authentication successful', { 
        organization: testAuth?.result?.name || 'Unknown',
        attempts: authenticationAttempts,
        successRate: `${((successfulAuthentications / authenticationAttempts) * 100).toFixed(1)}%`
      });
    } catch (authError) {
      failedAuthentications++;
      logError('❌ Xero authentication failed', { 
        error: (authError as Error).message,
        attempts: authenticationAttempts,
        successRate: `${((successfulAuthentications / authenticationAttempts) * 100).toFixed(1)}%`
      });
    }

    // Register tools directly (matching working sample pattern)
    logInfo('📊 Registering Xero tools with comprehensive logging...');

    // Tool 1: List Accounts with full logging
    server.tool(
      "list-accounts",
      "Get the chart of accounts from Xero",
      {},
      async () => {
        const startTime = Date.now();
        const sessionId = `tool-${Date.now()}`;
        
        logInfo(`🔧 Tool Execution Started: list-accounts`, { sessionId, startTime });
        
        try {
          // Track session
          sessionTracker.set(sessionId, {
            created: startTime,
            lastUsed: startTime,
            toolsCalled: ['list-accounts'],
            authStatus: 'unknown'
          });

          // Execute with detailed logging
          logDebug('Calling listXeroAccounts...');
          const response = await listXeroAccounts();
          
          // Update session tracking
          const session = sessionTracker.get(sessionId);
          if (session) {
            session.lastUsed = Date.now();
            session.authStatus = 'success';
          }

          const executionTime = Date.now() - startTime;
          logInfo(`✅ Tool Execution Completed: list-accounts`, {
            sessionId,
            executionTime: `${executionTime}ms`,
            responseSize: JSON.stringify(response).length,
            accountCount: response?.result?.length || 0
          });

          // Log response structure for debugging
          logDebug('Response structure analysis', {
            hasResult: !!response?.result,
            isError: response?.isError,
            resultType: Array.isArray(response?.result) ? 'array' : typeof response?.result,
            totalSize: JSON.stringify(response).length
          });

          // Return in MCP format matching working sample
          return {
            content: [{ 
              type: "text", 
              text: JSON.stringify(response, null, 2) 
            }]
          };

        } catch (error) {
          const session = sessionTracker.get(sessionId);
          if (session) {
            session.authStatus = 'failed';
          }

          const executionTime = Date.now() - startTime;
          logError(`❌ Tool Execution Failed: list-accounts`, {
            sessionId,
            executionTime: `${executionTime}ms`,
            error: (error as Error).message || String(error),
            stack: (error as Error).stack,
            errorType: (error as Error).constructor.name
          });

          // Return error in proper format
          return {
            content: [{ 
              type: "text", 
              text: JSON.stringify({ 
                error: "Failed to retrieve accounts", 
                details: (error as Error).message || String(error)
              }, null, 2) 
            }]
          };
        }
      }
    );

    // Tool 2: List Contacts with logging
    server.tool(
      "list-contacts",
      "Get contacts from Xero",
      {},
      async () => {
        const startTime = Date.now();
        const sessionId = `tool-${Date.now()}`;
        
        logInfo(`🔧 Tool Execution Started: list-contacts`, { sessionId });
        
        try {
          const response = await listXeroContacts();
          
          const executionTime = Date.now() - startTime;
          logInfo(`✅ Tool Execution Completed: list-contacts`, {
            sessionId,
            executionTime: `${executionTime}ms`,
            contactCount: response?.result?.length || 0
          });

          return {
            content: [{ 
              type: "text", 
              text: JSON.stringify(response, null, 2) 
            }]
          };

        } catch (error) {
          const executionTime = Date.now() - startTime;
          logError(`❌ Tool Execution Failed: list-contacts`, {
            sessionId,
            executionTime: `${executionTime}ms`,
            error: (error as Error).message
          });

          return {
            content: [{ 
              type: "text", 
              text: JSON.stringify({ 
                error: "Failed to retrieve contacts", 
                details: (error as Error).message 
              }, null, 2) 
            }]
          };
        }
      }
    );

    logInfo('📊 All Xero tools registered with comprehensive logging');

    const app = express();
    app.use(express.json());
    app.use(cors({
      origin: [
        'https://copilotstudio.microsoft.com',
        'https://powerva.microsoft.com',
        'https://*.powerplatform.com',
        'https://*.dynamics.com'
      ],
      credentials: true
    }));

    // Rate limiting middleware
    app.use('/mcp', rateLimitMiddleware);

    // Create stateless transport (matching working sample)
    const transport: StreamableHTTPServerTransport = 
      new StreamableHTTPServerTransport({
        sessionIdGenerator: undefined, // stateless like working sample
      });

    const setupServer = async () => {
      await server.connect(transport);
      logInfo('🔗 MCP Server connected to StreamableHTTP transport (stateless)');
    };

    // Primary MCP endpoint (matching working sample exactly)
    app.post("/mcp", async (req: Request, res: Response) => {
      const requestId = req.body?.id || 'unknown';
      const method = req.body?.method || 'unknown';
      
      logInfo("📨 Received MCP request", { 
        method, 
        requestId, 
        ip: req.ip,
        userAgent: req.headers['user-agent'],
        contentLength: req.headers['content-length']
      });
      
      try {
        await transport.handleRequest(req, res, req.body);
        logInfo("✅ MCP request handled successfully", { method, requestId });
            } catch (error) {        logError("❌ Error handling MCP request", {           method,           requestId,           error: (error as Error).message,          stack: (error as Error).stack        });
        
        if (!res.headersSent) {
          res.status(500).json({
            jsonrpc: "2.0",
            error: {
              code: -32603,
              message: "Internal server error",
            },
            id: requestId,
          });
        }
      }
    });

    // Additional endpoints for direct testing
        app.get("/test/auth", async (req: Request, res: Response) => {      logInfo("🧪 Direct authentication test requested");      try {        const orgDetails = await listXeroOrganisationDetails();        const result = {          success: true,          organization: orgDetails?.result?.name || 'Unknown',          timestamp: new Date().toISOString()        };        logInfo("✅ Direct auth test successful", result);        res.json(result);      } catch (error) {        const result = {          success: false,          error: (error as Error).message,          timestamp: new Date().toISOString()        };        logError("❌ Direct auth test failed", result);        res.status(500).json(result);      }    });

    app.get("/test/accounts", async (req: Request, res: Response) => {
      logInfo("🧪 Direct accounts test requested");
      try {
        const response = await listXeroAccounts();
                  logInfo("✅ Direct accounts test successful", {             accountCount: response?.result?.length || 0,            responseSize: JSON.stringify(response).length          });          res.json(response);        } catch (error) {          logError("❌ Direct accounts test failed", { error: (error as Error).message });          res.status(500).json({ error: (error as Error).message });
      }
    });

    // Session monitoring endpoint
    app.get("/monitor/sessions", (req: Request, res: Response) => {
      const sessions = Array.from(sessionTracker.entries()).map(([id, data]) => ({
        id,
        ...data,
        duration: Date.now() - data.created
      }));
      
      res.json({
        totalSessions: sessions.length,
        activeSessions: sessions.filter(s => Date.now() - s.lastUsed < 300000).length, // 5 min
        authStats: {
          attempts: authenticationAttempts,
          successful: successfulAuthentications,
          failed: failedAuthentications,
          successRate: `${((successfulAuthentications / (authenticationAttempts || 1)) * 100).toFixed(1)}%`
        },
        sessions
      });
    });

    // Health check
    app.get("/health", (req: Request, res: Response) => {
      res.json({
        status: "healthy",
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        authStats: {
          attempts: authenticationAttempts,
          successful: successfulAuthentications,
          failed: failedAuthentications
        }
      });
    });

    // Start server
    await setupServer();
    
    app.listen(port, () => {
      logInfo(`🎉 Xero MCP Server with comprehensive logging listening on port ${port}`);
      logInfo(`📡 MCP endpoint: http://localhost:${port}/mcp`);
      logInfo(`🧪 Direct test endpoints:`);
      logInfo(`   - Auth test: http://localhost:${port}/test/auth`);
      logInfo(`   - Accounts test: http://localhost:${port}/test/accounts`);
      logInfo(`   - Session monitor: http://localhost:${port}/monitor/sessions`);
      logInfo(`   - Health check: http://localhost:${port}/health`);
      logInfo(`🔧 Logging: Comprehensive tool execution logging enabled`);
      logInfo(`📊 Pattern: Matching confirmed working M365 sample`);
    });

    } catch (error) {    logError('💥 Failed to start Xero MCP Server', { error: (error as Error).message, stack: (error as Error).stack });    process.exit(1);  }
}
