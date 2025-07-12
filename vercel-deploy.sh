#!/bin/bash

# Script untuk deploy manual ke Vercel
echo "🚀 Vercel Deployment Script"
echo "=========================="

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "📦 Installing Vercel CLI..."
    npm install -g vercel
fi

# Login to Vercel (skip if already logged in)
echo "🔐 Checking Vercel authentication..."
vercel whoami || vercel login

# Build the application first
echo "🔨 Building application..."
node build.js

if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
    
    # Deploy to Vercel
    echo "🚀 Deploying to Vercel..."
    vercel --prod --yes
    
    echo ""
    echo "✅ Deployment completed!"
    echo "🌐 Your app should be available at the Vercel URL shown above"
    echo ""
    echo "Next steps:"
    echo "1. Configure custom domain in Vercel dashboard if needed"
    echo "2. Update OAuth redirect URIs to match new domain"
    echo "3. Test all functionality on production"
    
else
    echo "❌ Build failed. Please check the error messages above."
    echo "Common issues:"
    echo "- Missing dependencies (run: npm install)"
    echo "- TypeScript errors (run: npm run check)"
    echo "- Database connection issues"
    exit 1
fi