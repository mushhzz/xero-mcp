# Microsoft 365 Copilot Studio Deployment Guide

This guide provides step-by-step instructions for deploying the Xero MCP Server to be fully compliant with Microsoft 365 Copilot Studio requirements.

## 🎯 M365 Copilot Studio Compliance Features

✅ **Complete Tool Registry** - All 51+ Xero tools registered via ToolFactory  
✅ **StreamableHTTP Transport** - Optimized for M365 Copilot Studio connections  
✅ **JSON-RPC 2.0** - Full compliance with MCP protocol standards  
✅ **CORS Configuration** - Pre-configured for Microsoft domains  
✅ **Rate Limiting** - Production-ready request throttling (100 req/min)  
✅ **Health Monitoring** - `/health` endpoint for Azure monitoring  
✅ **Simplified Architecture** - Streamlined for M365 Copilot Studio only  
✅ **Error Handling** - Comprehensive error responses with proper codes  

## 🚀 Quick Deployment

### Step 1: Clone and Setup
```bash
git clone <your-repo-url>
cd xero-mcp-server
npm install
npm run build
```

### Step 2: Configure Environment
```bash
# Copy template and configure
cp .env.template .env
# Edit .env with your Xero app credentials
```

### Step 3: Test Locally
```bash
# Start M365 compliant server
npm run dev:m365

# Test endpoints
curl http://localhost:3000/health
curl http://localhost:3000/
```

### Step 4: Deploy to Azure App Service

#### Option A: Azure Portal Deployment
1. Create Azure App Service (Node.js 18+ runtime)
2. Configure environment variables in App Service settings
3. Deploy code via GitHub Actions, ZIP, or Git

#### Option B: Azure CLI Deployment
```bash
# Create resource group
az group create --name xero-mcp-rg --location eastus

# Create App Service plan
az appservice plan create --name xero-mcp-plan --resource-group xero-mcp-rg --sku B1 --is-linux

# Create web app
az webapp create --resource-group xero-mcp-rg --plan xero-mcp-plan --name your-app-name --runtime "NODE:18-lts"

# Configure environment variables
az webapp config appsettings set --resource-group xero-mcp-rg --name your-app-name --settings \
  TRANSPORT_MODE=m365 \
  NODE_ENV=production \
  XERO_CLIENT_ID="your-client-id" \
  XERO_CLIENT_SECRET="your-client-secret" \
  XERO_REDIRECT_URI="https://your-app-name.azurewebsites.net/auth/callback"

# Deploy code
az webapp deployment source config-zip --resource-group xero-mcp-rg --name your-app-name --src ./deploy.zip
```

## 🔧 Microsoft 365 Copilot Studio Configuration

### Step 1: Update OpenAPI Specification
Edit `openapi/xero-mcp.yaml`:
```yaml
host: your-app-name.azurewebsites.net
schemes:
  - https
```

### Step 2: Create Custom Connector in Power Apps
1. Go to Power Apps → Custom connectors
2. Select "New custom connector" → "Import an OpenAPI file"
3. Upload your updated `openapi/xero-mcp.yaml`
4. Configure security (API Key or OAuth as needed)
5. Configure the `/mcp` endpoint for M365 Copilot Studio JSON-RPC requests

### Step 3: Add to Copilot Studio Agent
1. In Copilot Studio, open your agent
2. Go to **Tools** → **Add a tool**
3. Select **Connector** and choose your custom connector
4. Test the connection and authorize if needed

## 📡 Endpoint Reference

| Endpoint | Method | Purpose | M365 Usage |
|----------|--------|---------|------------|
| `/mcp` | POST | StreamableHTTP JSON-RPC MCP endpoint | Primary M365 Copilot endpoint |
| `/health` | GET | Health check and monitoring | Azure health probes |
| `/` | GET | Server info and capabilities | Status verification |

## 🛠️ Available Xero Tools

The server registers all tools via ToolFactory, including:

### List Tools (25+)
- `list-accounts` - Chart of accounts
- `list-contacts` - Customers and suppliers
- `list-invoices` - All invoices with filtering
- `list-payments` - Payment records
- `list-bank-transactions` - Bank transactions
- And many more...

### Create Tools (12+)
- `create-invoice` - New invoices
- `create-contact` - New customers/suppliers
- `create-payment` - Payment records
- `create-bank-transaction` - Bank entries
- And more...

### Update Tools (12+)
- `update-invoice` - Modify existing invoices
- `update-contact` - Update customer details
- And more...

### Delete/Get Tools (2+)
- `delete-timesheet` - Remove timesheets
- `get-timesheet` - Retrieve timesheet details

## 🔒 Security Best Practices

### Environment Variables
- Never commit `.env` files to version control
- Use Azure Key Vault for sensitive credentials in production
- Rotate Xero client secrets regularly

### CORS Configuration
The server is pre-configured for Microsoft domains:
- `*.copilot.microsoft.com`
- `*.powerautomate.com`
- `*.powerapps.com`
- `*.office.com`
- `*.office365.com`

### Rate Limiting
- Default: 100 requests per minute per IP
- Configurable via environment variables
- Automatic cleanup of expired rate limit entries

## 🏥 Monitoring and Health Checks

### Health Endpoint
```bash
GET /health
```
Returns:
```json
{
  "status": "healthy",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "server": "xero-mcp-server",
  "version": "1.0.0"
}
```

### Azure Application Insights
Configure in Azure portal for detailed monitoring:
- Request/response tracking
- Error logging and alerts
- Performance metrics
- Custom telemetry

## 🧪 Testing M365 Integration

### Test Health Endpoint
```bash
curl https://your-app.azurewebsites.net/health
```

### Test Server Info
```bash
curl https://your-app.azurewebsites.net/
```

### Test Tool Execution
```bash
curl -X POST https://your-app.azurewebsites.net/mcp \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "method": "tools/call",
    "params": {
      "name": "list-accounts",
      "arguments": {}
    },
    "id": "test-1"
  }'
```

## 🔧 Troubleshooting

### Common Issues

1. **CORS Errors**
   - Verify your domain is in the CORS allowlist
   - Check browser console for specific CORS errors

2. **Tool Registration Errors**
   - Ensure all tool modules are properly imported
   - Check TypeScript compilation errors

3. **Authentication Issues**
   - Verify Xero client credentials
   - Check redirect URI configuration

4. **MCP Connection Issues**
   - Verify proper JSON-RPC 2.0 request format
   - Check Content-Type headers
   - Verify network connectivity to the /mcp endpoint

### Debug Mode
```bash
# Run with debug logging
LOG_LEVEL=debug npm run dev:m365
```

## 📚 Additional Resources

- [Microsoft 365 Copilot Studio Documentation](https://docs.microsoft.com/en-us/microsoft-copilot-studio/)
- [Model Context Protocol Specification](https://spec.modelcontextprotocol.io/)
- [Xero API Documentation](https://developer.xero.com/)
- [Azure App Service Node.js Guide](https://docs.microsoft.com/en-us/azure/app-service/quickstart-nodejs)
