// QueitDB - PostgreSQL dengan JSON NoSQL Interface
import { drizzle } from 'drizzle-orm/node-postgres';
import pkg from 'pg';
const { Pool } = pkg;
import * as schema from "@shared/schema";
import { CONFIG } from './config.js';

// PostgreSQL connection untuk QueitDB
const DATABASE_URL = CONFIG.DATABASE_URL;

if (!DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Database configuration is missing.",
  );
}

console.log('✅ QueitDB configured with PostgreSQL backend at:', DATABASE_URL.replace(/\/\/[^:]+:[^@]+@/, '//***:***@'));

// PostgreSQL connection pool untuk QueitDB
export const pool = new Pool({ connectionString: DATABASE_URL });
export const db = drizzle({ client: pool, schema });

// QueitDB JSON-SQL Bridge untuk konversi data
export class QueitDBBridge {
  // Convert SQL row to JSON NoSQL format
  static toNoSQL(tableName: string, data: any): any {
    return {
      _id: data.id,
      collection: tableName,
      document: data,
      created_at: data.createdAt || new Date().toISOString(),
      updated_at: data.updatedAt || new Date().toISOString()
    };
  }

  // Convert JSON NoSQL to SQL format
  static toSQL(jsonData: any): any {
    if (jsonData.document) {
      return jsonData.document;
    }
    return jsonData;
  }

  // Execute JSON-style query on PostgreSQL
  static async executeJSONQuery(query: string, params: any[] = []): Promise<any> {
    const client = await pool.connect();
    try {
      const result = await client.query(query, params);
      return result.rows.map(row => this.toNoSQL(query.includes('FROM') ? 
        query.split('FROM')[1].split(' ')[1] : 'unknown', row));
    } finally {
      client.release();
    }
  }
}