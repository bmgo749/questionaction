#!/bin/bash

# GitHub to Vercel Deployment Script
echo "🚀 Preparing deployment to GitHub → Vercel..."

# Check if git is initialized
if [ ! -d ".git" ]; then
    echo "📁 Initializing git repository..."
    git init
    git branch -M main
fi

# Add all files
echo "📋 Adding all files to git..."
git add .

# Commit changes
echo "💾 Committing changes..."
git commit -m "Deploy to Vercel: Fix routing, OAuth, and database configuration

- Fixed vercel.json routing for /v2/ paths
- Updated OAuth redirect URIs for queit.site
- Configured MongoDB Atlas database
- Added comprehensive deployment documentation
- Ready for Vercel deployment with custom domain"

# Check if remote exists
if ! git remote get-url origin > /dev/null 2>&1; then
    echo "🔗 Add your GitHub repository URL:"
    echo "git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git"
    echo ""
    echo "Then run: git push -u origin main"
else
    echo "🚀 Pushing to GitHub..."
    git push -u origin main
    echo ""
    echo "✅ Code pushed to GitHub successfully!"
fi

echo ""
echo "🎯 Next Steps:"
echo "1. Go to https://vercel.com"
echo "2. Import your GitHub repository"
echo "3. Configure build settings (see VERCEL-HOSTINGER-SETUP.md)"
echo "4. Add environment variables in Vercel dashboard"
echo "5. Configure DNS in Hostinger control panel"
echo ""
echo "📄 Full guide: VERCEL-HOSTINGER-SETUP.md"
echo "🌐 Your app will be live at: https://queit.site"