import express, { type Request, Response, NextFunction } from "express";
<<<<<<< HEAD
import { config } from "dotenv";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import session from "express-session";
import ConnectPgSimple from "connect-pg-simple";
import { pool } from "./db";
import { setupAuth } from "./replitAuth";
import { setupAdminAuth } from "./adminAuth";
import { setupComprehensiveSecurity } from "./security/comprehensive";

// Load environment variables
config();

const app = express();

// Basic request parsing middleware
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

// Setup comprehensive security protection
setupComprehensiveSecurity(app);

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
  
=======
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
>>>>>>> 9cd9589 (Set up core functionalities and improve user interface components)
  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

<<<<<<< HEAD
    // Only send response if headers haven't been sent yet
    if (!res.headersSent) {
      res.status(status).json({ message });
    }
    
    console.error('Server error:', err);
=======
    res.status(status).json({ message });
    throw err;
>>>>>>> 9cd9589 (Set up core functionalities and improve user interface components)
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
<<<<<<< HEAD
})();
=======
})();
>>>>>>> 9cd9589 (Set up core functionalities and improve user interface components)
