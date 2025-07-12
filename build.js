#!/usr/bin/env node

// Custom build script untuk Vercel deployment
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

console.log('🔨 Starting Vercel-compatible build...');

try {
  // Build frontend dengan Vite
  console.log('📦 Building frontend...');
  execSync('npx vite build', { stdio: 'inherit' });

  // Ensure dist directory exists
  if (!fs.existsSync('dist')) {
    fs.mkdirSync('dist', { recursive: true });
  }

  // Create simple API handler untuk Vercel
  console.log('🛠️ Preparing API for Vercel...');
  
  // Pastikan output structure benar untuk Vercel
  if (fs.existsSync('dist/public')) {
    console.log('✅ Frontend build successful - dist/public created');
  } else {
    throw new Error('Frontend build failed - dist/public not found');
  }

  console.log('✅ Build completed successfully!');
  console.log('📁 Frontend: dist/public');
  console.log('🚀 API: api/index.ts (serverless function)');

} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}