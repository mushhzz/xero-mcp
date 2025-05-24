# Xero MCP Server for Microsoft 365 Copilot

This MCP (Model Context Protocol) server is **specifically optimized for Microsoft 365 Copilot** integration, providing seamless access to Xero accounting functions through Copilot Studio.

## 🎯 Microsoft 365 Copilot Optimizations

### Key Features
- ✅ **51 Xero Tools** - Complete coverage of Xero API functions
- 🔗 **SSE Transport** - Optimized for Microsoft Copilot Studio
- 🛡️ **Production Ready** - Built for enterprise deployment
- 📊 **Real-time Sync** - Live data from Xero to M365 Copilot
- 🔒 **Secure** - OAuth 2.0 integration with Xero

### Architecture Alignment
- **SSE (Server-Sent Events)** transport layer
- **JSON Schema** validation compatible with Microsoft's requirements
- **Azure Web Apps** deployment ready
- **Microsoft Copilot Studio** endpoint patterns

## 🚀 Quick Deployment for Microsoft 365 Copilot

### 1. Environment Setup
```bash
# Clone and install
git clone <repository-url>
cd xero-mcp-server
npm install

# Build for production
npm run build
```

### 2. Environment Variables (for Azure Web Apps)
```env
# Xero OAuth Configuration
XERO_CLIENT_ID=your-xero-client-id
XERO_CLIENT_SECRET=your-xero-client-secret
XERO_REDIRECT_URI=your-redirect-uri

# Server Configuration
PORT=3000
NODE_ENV=production
TRANSPORT_MODE=sse
```

### 3. Start Server
```bash
# For Microsoft 365 Copilot
./start-server.sh
```

### 4. Microsoft Copilot Studio Configuration

**Server Endpoint:**
```
https://your-app.azurewebsites.net/sse
```

**Message Endpoint:**
```
https://your-app.azurewebsites.net/mcp/xero
```

## 📡 Endpoints for Microsoft 365 Copilot

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/sse` | GET | SSE connection for Copilot Studio |
| `/mcp/xero` | POST | MCP message handling |
| `/` | GET | Server status and health check |

## 🔧 Available Xero Tools (51 Total)

### 📊 **List Tools** (25 tools)
- `list-accounts` - Get all Xero accounts
- `list-contacts` - Get customers/suppliers
- `list-invoices` - Get invoices with filtering
- `list-payments` - Get payment records
- `list-bank-transactions` - Get bank transactions
- ... and 20 more list tools

### ✅ **Create Tools** (12 tools)  
- `create-invoice` - Create sales/purchase invoices
- `create-contact` - Create customers/suppliers
- `create-payment` - Record payments
- `create-bank-transaction` - Record bank transactions
- ... and 8 more create tools

### ✏️ **Update Tools** (12 tools)
- `update-invoice` - Modify draft invoices
- `update-contact` - Update customer/supplier details
- `update-bank-transaction` - Modify bank records
- ... and 9 more update tools

### 🗑️ **Delete Tools** (2 tools)
- `delete-timesheet` - Remove timesheets
- `get-timesheet` - Retrieve timesheet details

## 🛠️ Microsoft 365 Copilot Integration Examples

### Example 1: Invoice Management
```
User: "Create an invoice for Acme Corp for $1,500 for consulting services"
Copilot: Uses create-invoice tool with proper line items and account codes
```

### Example 2: Financial Reporting  
```
User: "Show me the profit and loss for last month"
Copilot: Uses list-profit-and-loss tool with date filtering
```

### Example 3: Contact Management
```
User: "Update the email address for customer ABC123"
Copilot: Uses update-contact tool with new email information
```

## 🔍 Troubleshooting Microsoft 365 Copilot Issues

### Common Issues

1. **"SystemError" in Copilot Studio**
   - ✅ **Fixed**: Tool schemas properly converted to JSON Schema format
   - ✅ **Verified**: All 51 tools register successfully

2. **Connection Timeouts**
   - Ensure Azure Web App is properly configured
   - Check SSE endpoint is accessible: `https://your-app.azurewebsites.net/sse`

3. **Tool Discovery Issues**
   - Verify server responds with tool list: `GET /sse` should return tool schemas
   - Check logs for tool registration errors

### Monitoring
```bash
# Check server status
curl https://your-app.azurewebsites.net/

# Expected response:
{
  "message": "Xero MCP Server for Microsoft 365 Copilot",
  "platform": "Microsoft Copilot Studio", 
  "status": "ready",
  "optimizedFor": "Microsoft 365 Copilot"
}
```

## 📈 Production Deployment on Azure

### Azure Web Apps Configuration
1. **Runtime**: Node.js 18+
2. **Startup Command**: `npm run start`
3. **Environment Variables**: Set Xero OAuth credentials
4. **HTTPS**: Required for Microsoft 365 Copilot
5. **CORS**: Configured for `*.microsoft.com`

### Scaling for Enterprise
- **App Service Plan**: Standard or Premium
- **Auto-scaling**: Based on CPU/memory usage
- **Application Insights**: For monitoring and diagnostics

## 🔒 Security Considerations

- **OAuth 2.0**: Secure Xero API authentication
- **HTTPS Only**: Required for Microsoft 365 integration
- **Environment Variables**: Store secrets securely in Azure Key Vault
- **Access Control**: Limit access to authorized Microsoft 365 users

## 📞 Support

For Microsoft 365 Copilot specific issues:
1. Check Azure Web App logs
2. Verify Xero OAuth configuration
3. Test SSE endpoint connectivity
4. Review Microsoft Copilot Studio connector configuration

---

**Ready for Microsoft 365 Copilot deployment!** 🚀 