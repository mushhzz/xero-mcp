#!/bin/bash

echo "🚀 Starting Azure build process..."

# Clean previous builds
echo "🧹 Cleaning previous builds..."
rm -rf dist

# Install production dependencies only
echo "📦 Installing production dependencies..."
npm ci --production

# Build TypeScript
echo "🔨 Building TypeScript..."
npx tsc --project tsconfig.json

# Verify build output
if [ -d "dist" ]; then
    echo "✅ Build completed successfully!"
    echo "📁 Contents of dist folder:"
    ls -la dist/
else
    echo "❌ Build failed - dist folder not created"
    exit 1
fi

echo "🎉 Azure build process completed!" 