# Azure Deployment Guide for Xero MCP Server

## 🚨 Common Deployment Issues and Solutions

### Issue: TypeScript Build Failure - Cannot find type definition file for '@types/jest'

**Cause**: The `tsconfig.json` was including test types that are only available in devDependencies, which aren't installed during Azure production builds.

**Solution Applied**:
1. Removed `@types/jest` from the main `tsconfig.json`
2. Created a separate `tsconfig.test.json` for test-specific configuration
3. Excluded test directories from production build

### Issue: Build failures with Oryx

**Solution**: The repository has been updated with:
- Clean `tsconfig.json` for production builds
- TypeScript is in production dependencies (not dev)
- Proper file exclusions

### Issue: "deploy.cmd: not found" error

**Cause**: The `.deployment` file was pointing to a non-existent `deploy.cmd` file.

**Solution**: Removed the `.deployment` file to let Azure/Oryx use its default Node.js build process.

### Issue: TypeScript error - Could not find declaration file for module 'cors'**Cause**: The `@types/cors` package was in devDependencies, but Azure only installs production dependencies.**Solution**: Moved `@types/cors` and `@types/node` from devDependencies to dependencies in package.json.

## 📋 Pre-Deployment Checklist

1. **Environment Variables** - Set these in Azure App Service Configuration:
   ```
   XERO_CLIENT_ID=your_xero_client_id
   XERO_CLIENT_SECRET=your_xero_client_secret
   XERO_REDIRECT_URI=https://your-app.azurewebsites.net/callback
   PORT=3000
   ```

2. **Node Version** - Ensure Azure is using Node.js 18+ (set in Configuration > General settings)

3. **Build Command** - Azure should automatically detect and use `npm run build`

## 🚀 Deployment Steps

### Option 1: Deploy via GitHub Actions
1. Push your changes to GitHub
2. Set up GitHub Actions deployment to Azure
3. The build will use the production `tsconfig.json`

### Option 2: Deploy via Azure CLI
```bash
# Build locally first
npm ci --production
npm run build

# Deploy
az webapp deployment source config-zip \
  --resource-group <your-resource-group> \
  --name <your-app-name> \
  --src <path-to-zip>
```

### Option 3: Deploy via VS Code
1. Install Azure App Service extension
2. Right-click on your project
3. Select "Deploy to Web App"
4. Follow the prompts

## 🔧 Post-Deployment Verification

1. **Check Health Endpoint**:
   ```bash
   curl https://your-app.azurewebsites.net/health
   ```

2. **Check MCP Endpoint**:
   ```bash
   curl https://your-app.azurewebsites.net/
   ```

3. **Review Logs**:
   - In Azure Portal: App Service > Monitoring > Log stream
   - Via CLI: `az webapp log tail --name <app-name> --resource-group <rg-name>`

## 🐛 Troubleshooting

### If build still fails:
1. Check the Oryx build log for specific errors
2. Ensure all production dependencies are listed in `dependencies` (not `devDependencies`)
3. Verify Node.js version compatibility

### If app doesn't start:
1. Check if `dist/index.js` exists
2. Verify environment variables are set
3. Check application logs for startup errors

## 📝 Important Files

- `tsconfig.json` - Production TypeScript configuration (no test types)
- `tsconfig.test.json` - Test-specific TypeScript configuration
- `package.json` - Ensure TypeScript is in dependencies, not devDependencies
- `.npmignore` - Excludes test files from npm package

## 🎯 Copilot Studio IntegrationOnce deployed, configure in Copilot Studio:- **Endpoint**: `https://your-app.azurewebsites.net/mcp/`- **Method**: POST- **Headers**: Content-Type: application/jsonThe mega-tool pattern ensures all Xero operations work within Copilot Studio's 2-tool limit.### Troubleshooting Copilot StudioIf tools are failing in Copilot Studio:1. **Check the logs** - Look for `[COPILOT-MEGA-TOOL]` entries to see what parameters are being received2. **Verify the tool name** - The tool is registered as `xero-copilot-api`3. **Check operation parameter** - Ensure you're passing the `operation` parameter (e.g., "list-contacts")4. **Enable debug logging** - The updated code includes detailed logging of received arguments5. **Test with simple operation** - Try `{ "operation": "list-organisation-details" }` first 