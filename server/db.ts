import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

<<<<<<< HEAD
// Configure WebSocket for Neon
neonConfig.webSocketConstructor = ws;
neonConfig.useSecureWebSocket = true;
neonConfig.pipelineConnect = false;
=======
neonConfig.webSocketConstructor = ws;
>>>>>>> 9cd9589 (Set up core functionalities and improve user interface components)

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

<<<<<<< HEAD
export const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL,
  max: 3,  // Optimized for performance
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000
});

=======
export const pool = new Pool({ connectionString: process.env.DATABASE_URL });
>>>>>>> 9cd9589 (Set up core functionalities and improve user interface components)
export const db = drizzle({ client: pool, schema });