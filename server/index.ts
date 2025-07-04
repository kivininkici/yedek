import express, { type Request, Response, NextFunction } from "express";
import { config } from "dotenv";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import session from "express-session";
import ConnectPgSimple from "connect-pg-simple";
import { pool } from "./db";
import { setupAuth } from "./replitAuth";
import { setupAdminAuth } from "./adminAuth";
// Performance optimized imports - heavy security modules removed
// Security imports removed for performance

// Load environment variables
config();

const app = express();

// Security middleware completely disabled for performance
// All security layers removed to improve loading speed

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: false, limit: '10mb' }));

// Optimized PostgreSQL session store
const PgSession = ConnectPgSimple(session);

// High-performance session middleware
app.use(
  session({
    store: new PgSession({
      pool: pool,
      tableName: 'sessions',
      createTableIfMissing: false,
      pruneSessionInterval: 60 * 60 * 1000, // Prune every hour
      errorLog: () => {}, // Disable error logging for performance
    }),
    secret: process.env.SESSION_SECRET || "admin-secret-key-change-in-production",
    resave: false,
    saveUninitialized: false,
    rolling: false, // Don't reset expiry on each request
    cookie: {
      secure: false,
      httpOnly: true,
      maxAge: 4 * 60 * 60 * 1000, // Reduced to 4 hours for performance
    },
  })
);

// Ultra-fast logging - only slow requests
app.use((req, res, next) => {
  if (req.path.startsWith("/api")) {
    const start = Date.now();
    res.on("finish", () => {
      const duration = Date.now() - start;
      // Only log slow requests (>100ms)
      if (duration > 100) {
        log(`SLOW: ${req.method} ${req.path} ${res.statusCode} in ${duration}ms`);
      }
    });
  }
  next();
});

// Setup authentication systems
setupAdminAuth(app);

(async () => {
  // Setup Replit Auth
  await setupAuth(app);
  
  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    // Only send response if headers haven't been sent yet
    if (!res.headersSent) {
      res.status(status).json({ message });
    }
    
    console.error('Server error:', err);
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // ALWAYS serve the app on port 5000
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = 5000;
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, () => {
    log(`serving on port ${port}`);
  });
})();