// Vercel serverless function entry point
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

    // Handle preflight requests
    if (req.method === 'OPTIONS') {
      res.status(200).end();
      return;
    }

    // Dynamic import to avoid build issues
    const { registerRoutes } = await import('../server/routes.js');
    const express = await import('express');
    
    // Create Express app for serverless
    const app = express.default();
    app.use(express.default.json());
    app.use(express.default.urlencoded({ extended: false }));

    // Register all routes
    registerRoutes(app);

    // Handle the request
    return app(req as any, res as any);
  } catch (error) {
    console.error('Vercel API Error:', error);
    res.status(500).json({ 
      error: 'Internal Server Error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}