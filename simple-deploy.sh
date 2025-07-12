#!/bin/bash

echo "🚀 Simple Vercel Deploy - Frontend Only"
echo "======================================"

# Build frontend dengan timeout
echo "📦 Building frontend (timeout 2 min)..."
timeout 120 npx vite build

if [ $? -eq 0 ]; then
    echo "✅ Frontend build successful!"
    
    # Check if dist exists
    if [ -d "dist" ]; then
        echo "📁 Dist directory found"
        ls -la dist/
        
        # Deploy with Vercel CLI
        echo "🚀 Deploying to Vercel..."
        vercel --prod --force
    else
        echo "❌ Dist directory not found"
        exit 1
    fi
else
    echo "❌ Frontend build failed or timed out"
    echo "Trying alternative approach..."
    
    # Try building without server components
    echo "📦 Building with basic Vite..."
    npx vite build --base=./
    
    if [ $? -eq 0 ]; then
        echo "✅ Basic build successful!"
        vercel --prod --force
    else
        echo "❌ All build attempts failed"
        exit 1
    fi
fi