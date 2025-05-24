# Xero MCP Server for Microsoft 365 Copilot Studio

A streamlined **Model Context Protocol (MCP)** server that provides seamless integration between **Microsoft 365 Copilot Studio** and **Xero accounting APIs**. This server enables AI-powered financial workflows directly within your Microsoft 365 environment.

## 🎯 Overview

This MCP server is specifically optimized for **Microsoft 365 Copilot Studio** and provides:

- ✅ **Complete Xero API Coverage** - All CRUD operations for accounts, contacts, invoices, and more
- ✅ **M365 Copilot Studio Compliant** - StreamableHTTP transport with proper JSON-RPC 2.0 formatting
- ✅ **Production Ready** - OAuth 2.0 authentication, rate limiting, CORS configuration
- ✅ **Enhanced Logging** - Comprehensive request/response logging for debugging
- ✅ **Type Safety** - Full TypeScript implementation with Zod schema validation

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- Xero Developer App ([Create one here](https://developer.xero.com/app/manage))
- Microsoft 365 Copilot Studio access

### Installation

```bash
git clone https://github.com/XeroAPI/xero-mcp-server.git
cd xero-mcp-server
npm install
```

### Configuration

1. Copy the environment template:
```bash
cp .env.template .env
```

2. Configure your Xero OAuth credentials in `.env`:
```env
XERO_CLIENT_ID=your_xero_client_id
XERO_CLIENT_SECRET=your_xero_client_secret
XERO_REDIRECT_URI=http://localhost:3000/callback
PORT=3000
```

### Starting the Server

```bash
# Build and start
npm run build
npm start

# Development mode
npm run dev
```

The server will start on `http://localhost:3000` with the MCP endpoint at `/mcp/`.

## 🔗 Microsoft 365 Copilot Studio Integration

### MCP Endpoint Configuration

In Microsoft 365 Copilot Studio, configure your MCP connection:

- **Endpoint URL**: `http://localhost:3000/mcp/`
- **Method**: POST
- **Transport**: StreamableHTTP
- **Protocol**: JSON-RPC 2.0

### Available Tools

The server provides comprehensive Xero API coverage through these tool categories:

- **📋 List Tools**: `list-accounts`, `list-contacts`, `list-invoices`, etc.
- **🔍 Get Tools**: `get-account`, `get-contact`, `get-invoice`, etc.  
- **➕ Create Tools**: `create-contact`, `create-invoice`, `create-payment`, etc.
- **✏️ Update Tools**: `update-contact`, `update-invoice`, etc.
- **🗑️ Delete Tools**: `delete-contact`, `delete-invoice`, etc.

### Example Usage in Copilot Studio

```
User: "Show me all unpaid invoices from this month"
Copilot: Uses list-invoices tool with date and status filters

User: "Create a new contact for Acme Corp"  
Copilot: Uses create-contact tool with provided details

User: "What's the balance on account 200?"
Copilot: Uses get-account tool to retrieve account details
```

## 🛠️ Development

### Project Structure

```
xero-mcp-server/
├── src/
│   ├── index.ts              # Main entry point
│   ├── server/
│   │   └── xero-m365-server.ts   # M365 Copilot Studio server
│   ├── tools/                # Tool implementations
│   │   ├── create/           # Create operations
│   │   ├── delete/           # Delete operations  
│   │   ├── get/             # Get operations
│   │   ├── list/            # List operations
│   │   └── update/          # Update operations
│   └── types/               # TypeScript type definitions
├── M365-DEPLOYMENT-GUIDE.md    # Detailed M365 setup guide
└── README-M365-COPILOT.md     # M365 specific documentation
```

### Building

```bash
npm run build
```

### Linting

```bash
npm run lint
npm run lint:fix
```

## 📊 Monitoring & Debugging

### Health Check

```bash
curl http://localhost:3000/health
```

### Server Information

```bash
curl http://localhost:3000/
```

### Enhanced Logging

The server provides detailed logging for all MCP requests and responses, including:
- Request method and parameters
- Response data and status codes
- Error details with stack traces
- Performance metrics

## 🔐 Security Features

- **OAuth 2.0** - Secure Xero API authentication
- **Rate Limiting** - 100 requests per minute per client
- **CORS Protection** - Configured for Microsoft domains
- **Input Validation** - Zod schema validation for all inputs
- **Error Handling** - Comprehensive error responses

## 📚 Documentation

- [M365 Deployment Guide](./M365-DEPLOYMENT-GUIDE.md) - Step-by-step setup
- [M365 Copilot README](./README-M365-COPILOT.md) - Detailed M365 integration
- [TypeScript SDK Guide](./typescriptsdk.md) - Development reference

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

MIT License - see [LICENSE](./LICENSE) file for details.

## 🆘 Support

For issues and questions:
- Create an issue on GitHub
- Check the M365 Deployment Guide for common problems
- Review the enhanced logging output for debugging

---

**Optimized for Microsoft 365 Copilot Studio** 🚀