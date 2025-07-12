// Vercel serverless function entry point
import type { VercelRequest, VercelResponse } from '@vercel/node';
import express from 'express';
import { registerRoutes } from '../server/routes.js';

// Create Express app for serverless
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Register all routes
registerRoutes(app);

// Export as Vercel serverless function
export default function handler(req: VercelRequest, res: VercelResponse) {
  return app(req as any, res as any);
}