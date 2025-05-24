import { z } from "zod";
import { CreateXeroTool } from "../helpers/create-xero-tool.js";

// Import existing tool factories
import { ListTools } from "./list/index.js";
import { CreateTools } from "./create/index.js";
import { UpdateTools } from "./update/index.js";
import { DeleteTools } from "./delete/index.js";
import { GetTools } from "./get/index.js";

// Create instances of all existing tools for reuse
const existingTools = new Map();

// Initialize all tools
function initializeExistingTools() {
  const allToolFactories = [
    ...ListTools,
    ...CreateTools, 
    ...UpdateTools,
    ...DeleteTools,
    ...GetTools,
  ];

  allToolFactories.forEach(toolFactory => {
    const tool = toolFactory();
    existingTools.set(tool.name, tool);
  });
}

// Initialize tools on module load
initializeExistingTools();

// Helper function to call existing tools
async function callExistingTool(toolName: string, args: Record<string, unknown> = {}) {
  const tool = existingTools.get(toolName);
  if (!tool) {
    throw new Error(`Tool '${toolName}' not found. Available: ${Array.from(existingTools.keys()).join(', ')}`);
  }

  return await tool.handler(args);
}

// Generate tool descriptions for documentation
function getToolDescriptions(): string {
  return Array.from(existingTools.values())
    .map(tool => `• ${tool.name}: ${tool.description}`)
    .join('\n');
}

const XeroOperation = z.enum([
  // List operations
  "list-accounts",
  "list-contacts", 
  "list-invoices",
  "list-organisation-details",
  "list-items",
  "list-payments",
  "list-credit-notes",
  "list-quotes",
  "list-bank-transactions",
  "list-manual-journals",
  "list-tax-rates",
  "list-tracking-categories",
  "list-trial-balance",
  "list-profit-and-loss",
  "list-balance-sheet",
  "list-aged-receivables",
  "list-aged-payables",
  "list-contact-groups",
  
  // Payroll operations
  "list-payroll-employees",
  "list-payroll-timesheets",
  "list-payroll-leave",
  "list-payroll-leave-types",
  "list-payroll-leave-balances",
  "list-payroll-leave-periods",
  
  // Create operations
  "create-contact",
  "create-invoice", 
  "create-credit-note",
  "create-quote",
  "create-payment",
  "create-item",
  "create-bank-transaction",
  "create-manual-journal",
  "create-payroll-timesheet",
  "create-tracking-category",
  "create-tracking-options",
  
  // Get operations
  "get-payroll-timesheet",
  
  // Update operations
  "update-contact",
  "update-invoice",
  "update-credit-note",
  "update-quote",
  "update-item",
  "update-bank-transaction",
  "update-manual-journal",
  "update-tracking-category",
  "update-tracking-options",
  "approve-payroll-timesheet",
  "revert-payroll-timesheet",
  "add-timesheet-line",
  "update-timesheet-line",
  
  // Delete operations
  "delete-payroll-timesheet"
]);

const CopilotMegaTool = CreateXeroTool(
  "xero-copilot-api",
  `Universal Xero API tool for ALL Xero operations. Always specify the 'operation' parameter first.

This tool provides access to ALL Xero functionality:

${getToolDescriptions()}

IMPORTANT: Check parameter descriptions - they indicate which parameters are REQUIRED vs OPTIONAL for each operation.

Common Operations:
- List contacts: { "operation": "list-contacts" }
- Create contact: { "operation": "create-contact", "name": "Company Name" }
- Create invoice: { "operation": "create-invoice", "contactID": "id", "description": "Service", "unitAmount": 100, "accountCode": "200" }
- List accounts: { "operation": "list-accounts" } (to find valid account codes)

For invoices, always include: contactID, description, unitAmount, and accountCode (use '200' for sales).`,
  {
    operation: XeroOperation.describe("The Xero operation to perform"),
    
    // Common parameters - all optional since they depend on the operation
    name: z.string().optional().describe("Name of contact/item/etc. REQUIRED for: create-contact (company or person name), create-item (product/service name)"),
    email: z.string().email().optional().describe("Email address. OPTIONAL for create-contact"),
    phone: z.string().optional().describe("Phone number. OPTIONAL for create-contact"),
    contactID: z.string().optional().describe("Contact ID. REQUIRED for: create-invoice, create-credit-note, create-quote, create-payment"),
    description: z.string().optional().describe("Description text. REQUIRED for: create-invoice (line item description), create-item (item description). For invoices, describe what you're billing for"),
    quantity: z.number().optional().describe("Quantity for line items. OPTIONAL for create-invoice (defaults to 1 if not specified)"),
    unitAmount: z.number().optional().describe("Price per unit. REQUIRED for: create-invoice (price of item/service), create-item (selling price)"),
    accountCode: z.string().optional().describe("Account code from chart of accounts. REQUIRED for: create-invoice (typically '200' for sales). Use '200' if unsure"),
    taxType: z.string().optional().describe("Tax type. OPTIONAL - defaults to 'OUTPUT2' (standard tax) if not specified. Options: 'OUTPUT2', 'NONE', 'INPUT2'"),
    dueDate: z.string().optional().describe("Due date in YYYY-MM-DD format. OPTIONAL for create-invoice (defaults to 30 days from today)"),
    reference: z.string().optional().describe("Reference number or text. OPTIONAL for invoices, quotes, etc."),
    page: z.number().optional().describe("Page number for list operations. OPTIONAL - defaults to 1"),
    
    // Additional common parameters
    includeArchived: z.boolean().optional().describe("Include archived records"),
    status: z.string().optional().describe("Filter by status"),
    timesheetID: z.string().optional().describe("Timesheet ID for payroll operations"),
    invoiceID: z.string().optional().describe("Invoice ID for updates"),
    quoteID: z.string().optional().describe("Quote ID for operations"),
    itemID: z.string().optional().describe("Item ID for updates"),
    paymentID: z.string().optional().describe("Payment ID for operations"),
  },
  async (args) => {
    try {
      // Debug logging
      console.log('[COPILOT-MEGA-TOOL] Received args:', JSON.stringify(args, null, 2));
      
      const { operation, ...operationArgs } = args;
      
      // Check if operation is provided
      if (!operation) {
        console.log('[COPILOT-MEGA-TOOL] ERROR: No operation specified');
        return {
          content: [
            {
              type: "text" as const,
              text: "Error: No operation specified. Please provide an 'operation' parameter with one of the available operations."
            }
          ]
        };
      }
      
      console.log(`[COPILOT-MEGA-TOOL] Operation: ${operation}`);
      console.log('[COPILOT-MEGA-TOOL] Operation args:', JSON.stringify(operationArgs, null, 2));
      
      // Remove undefined values to clean up the arguments
      const cleanArgs = Object.fromEntries(
        Object.entries(operationArgs).filter(([, value]) => value !== undefined)
      );
      
      // Add intelligent defaults for common operations
      if (operation === 'create-invoice') {
        // Provide helpful defaults for invoice creation
        if (!cleanArgs.accountCode) {
          cleanArgs.accountCode = '200'; // Default sales account
          console.log('[COPILOT-MEGA-TOOL] Adding default accountCode: 200');
        }
        if (!cleanArgs.quantity) {
          cleanArgs.quantity = 1;
          console.log('[COPILOT-MEGA-TOOL] Adding default quantity: 1');
        }
        if (!cleanArgs.description && cleanArgs.unitAmount) {
          return {
            content: [
              {
                type: "text" as const,
                text: "Error: Invoice creation requires a 'description' parameter. Please specify what you're billing for (e.g., 'Consulting Services', 'Product Sale', etc.)"
              }
            ]
          };
        }
      }
      
      // Call the existing tool implementation
      const result = await callExistingTool(operation, cleanArgs);
      
      console.log('[COPILOT-MEGA-TOOL] Result:', JSON.stringify(result, null, 2).substring(0, 200) + '...');
      
      return result;
      
    } catch (error) {
      console.error('[COPILOT-MEGA-TOOL] Error:', error);
      return {
        content: [
          {
            type: "text" as const,
            text: `Error executing operation: ${error instanceof Error ? error.message : String(error)}`
          }
        ]
      };
    }
  },
);

export default CopilotMegaTool; 