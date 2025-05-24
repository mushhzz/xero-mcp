import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { ToolFactory } from "../tools/tool-factory.js";

interface ToolInfo {
  name: string;
  description: string;
  inputSchema: {
    type: string;
    properties: Record<string, unknown>;
    required?: string[];
  };
}

export class XeroMcpServer {
  private static instance: McpServer | null = null;
  private static toolsRegistered = false;
  private static toolRegistry: Map<string, ToolInfo> = new Map();

  private constructor() {}

  public static GetServer(): McpServer {
    if (XeroMcpServer.instance === null) {
      XeroMcpServer.instance = new McpServer({
        name: "Xero MCP Server",
        version: "1.0.0",
        capabilities: {
          tools: {},
        },
      });
    }

    // Ensure tools are registered only once
    if (!XeroMcpServer.toolsRegistered) {
      ToolFactory(XeroMcpServer.instance);
      XeroMcpServer.buildToolRegistry();
      XeroMcpServer.toolsRegistered = true;
    }

    return XeroMcpServer.instance;
  }

  private static buildToolRegistry() {
    // Manually build tool registry for M365 Copilot
    // This is a static list of our Xero tools with their descriptions and schemas
    const tools = [
      {
        name: "list-contacts",
        description: "List all contacts in Xero. This includes Suppliers and Customers.",
        inputSchema: {
          type: "object",
          properties: {
            page: { type: "number", description: "Optional page number to retrieve for pagination" }
          }
        }
      },
      {
        name: "create-contact",
        description: "Create a new contact in Xero",
        inputSchema: {
          type: "object",
          properties: {
            name: { type: "string", description: "Contact name" },
            email: { type: "string", description: "Contact email address" },
            phone: { type: "string", description: "Contact phone number" }
          },
          required: ["name"]
        }
      },
      {
        name: "list-invoices",
        description: "Retrieve a list of invoices from Xero",
        inputSchema: {
          type: "object",
          properties: {
            page: { type: "number", description: "Optional page number for pagination" },
            status: { type: "string", description: "Filter by invoice status" }
          }
        }
      },
      {
        name: "create-invoice",
        description: "Create a new invoice in Xero",
        inputSchema: {
          type: "object",
          properties: {
            contactId: { type: "string", description: "Contact ID for the invoice" },
            lineItems: { type: "array", description: "Invoice line items" }
          },
          required: ["contactId", "lineItems"]
        }
      },
      {
        name: "list-accounts",
        description: "Retrieve a list of accounts from Xero chart of accounts",
        inputSchema: {
          type: "object",
          properties: {}
        }
      },
      {
        name: "list-organisation-details",
        description: "Retrieve details about the Xero organisation",
        inputSchema: {
          type: "object",
          properties: {}
        }
      }
      // Add more key tools as needed
    ];

    tools.forEach(tool => {
      XeroMcpServer.toolRegistry.set(tool.name, tool);
    });
  }

  public static getRegisteredTools(): Map<string, ToolInfo> {
    return XeroMcpServer.toolRegistry;
  }
}
