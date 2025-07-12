#!/bin/bash

# Hostinger Deployment Script for Queit Platform
echo "🚀 Starting Hostinger deployment preparation..."

# Build the application
echo "📦 Building application..."
npm run build

# Create deployment directory
echo "📁 Creating deployment directory..."
mkdir -p deployment/hostinger

# Copy built files
echo "📋 Copying built files..."
cp -r dist/public/* deployment/hostinger/

# Copy .htaccess file
echo "⚙️ Copying .htaccess configuration..."
cp public/.htaccess deployment/hostinger/

# Create deployment info
echo "📄 Creating deployment info..."
cat > deployment/hostinger/deployment-info.txt << EOL
Queit Platform - Hostinger Deployment
=====================================

Deploy Date: $(date)
Environment: Production (Hostinger)
Type: Frontend Only (Static Files)

Files included:
- index.html (main application)
- assets/ (CSS, JS, images)
- .htaccess (Apache configuration)

Instructions:
1. Upload all files to public_html/ folder in Hostinger
2. Make sure .htaccess is uploaded and readable
3. Set proper permissions if needed
4. Configure separate backend API endpoint

Backend API: Deploy separately to Vercel/Railway
Database: MongoDB Atlas (already configured)

For support: check HOSTINGER-DEPLOYMENT-GUIDE.md
EOL

# Create upload checklist
echo "📋 Creating upload checklist..."
cat > deployment/hostinger/UPLOAD-CHECKLIST.md << EOL
# Hostinger Upload Checklist

## Before Upload
- [ ] Build completed successfully
- [ ] .htaccess file present
- [ ] All assets copied correctly

## Upload Process
1. [ ] Connect to Hostinger File Manager or FTP
2. [ ] Navigate to public_html/ folder
3. [ ] Upload all files from deployment/hostinger/
4. [ ] Verify .htaccess is uploaded
5. [ ] Set permissions: 644 for files, 755 for directories

## After Upload
- [ ] Test homepage: https://queit.site
- [ ] Test navigation: click different menu items
- [ ] Test refresh: refresh page on different routes
- [ ] Test secure paths: /v2/ URLs should work

## Troubleshooting
- If 404 errors: Check .htaccess permissions
- If API errors: Configure separate backend
- If routing issues: Verify RewriteEngine is enabled

## Backend Configuration
- [ ] Deploy backend to Vercel/Railway
- [ ] Update API URLs in frontend
- [ ] Test all API endpoints
- [ ] Verify database connections
EOL

# Show deployment summary
echo ""
echo "✅ Deployment preparation complete!"
echo ""
echo "📁 Files prepared in: deployment/hostinger/"
echo "📄 Upload checklist: deployment/hostinger/UPLOAD-CHECKLIST.md"
echo "📘 Full guide: HOSTINGER-DEPLOYMENT-GUIDE.md"
echo ""
echo "🔧 Next steps:"
echo "1. Upload all files from deployment/hostinger/ to public_html/"
echo "2. Verify .htaccess is uploaded and readable"
echo "3. Test the website routing"
echo "4. Configure separate backend API if needed"
echo ""
echo "🌐 Your site will be available at: https://queit.site"