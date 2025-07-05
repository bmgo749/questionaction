import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";
import { CONFIG } from './config';

neonConfig.webSocketConstructor = ws;

// Use hardcoded configuration - NO SECRETS NEEDED
const DATABASE_URL = CONFIG.DATABASE_URL;

if (!DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Database configuration is missing.",
  );
}

export const pool = new Pool({ connectionString: DATABASE_URL });
export const db = drizzle({ client: pool, schema });