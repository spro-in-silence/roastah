import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

neonConfig.webSocketConstructor = ws;

let pool: Pool | null = null;
let dbInstance: ReturnType<typeof drizzle> | null = null;

export function getDb() {
  if (!dbInstance) {
    if (!process.env.DATABASE_URL) {
      throw new Error(
        "DATABASE_URL must be set. Did you forget to provision a database?",
      );
    }
    
    pool = new Pool({ connectionString: process.env.DATABASE_URL });
    dbInstance = drizzle({ client: pool, schema });
  }
  
  return dbInstance;
}

export function getPool() {
  if (!pool) {
    getDb(); // This will create the pool
  }
  return pool!;
}