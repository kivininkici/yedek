import express, { type Request, Response, NextFunction } from "express";
import { config } from "dotenv";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import session from "express-session";
import ConnectPgSimple from "connect-pg-simple";
import { pool } from "./db";
import { setupAuth } from "./replitAuth";
import { setupAdminAuth } from "./adminAuth";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { body, validationResult } from "express-validator";
import hpp from "hpp";
import { 
  securityHeadersMiddleware, 
  ipBlockingMiddleware, 
  userAgentValidationMiddleware, 
  contentInspectionMiddleware, 
  advancedRateLimitMiddleware 
} from "./security/protections";
import { inputValidationMiddleware } from "./validation";

// Load environment variables
config();

const app = express();

// Apply security middleware FIRST
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "blob:"],
      styleSrc: ["'self'", "'unsafe-inline'", "blob:"],
      imgSrc: ["'self'", "data:", "https:", "blob:"],
      fontSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "ws:", "wss:"],
      frameSrc: ["'none'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      workerSrc: ["'self'", "blob:"],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
}));

// Rate limiting - strict for production, relaxed for development
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'development' ? 5000 : 100, // High limit for dev, normal for prod
  message: {
    error: 'Çok fazla istek gönderildi. Lütfen daha sonra tekrar deneyin.',
    code: 'RATE_LIMIT_EXCEEDED'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(limiter);

// HTTP Parameter Pollution protection
app.use(hpp());

// Custom security middleware
app.use(securityHeadersMiddleware);
app.use(ipBlockingMiddleware);
app.use(userAgentValidationMiddleware);
app.use(advancedRateLimitMiddleware);

app.use(express.json({ 
  limit: '50mb',
  verify: (req: any, res, buf) => {
    req.rawBody = buf.toString();
  }
}));
app.use(express.urlencoded({ extended: false, limit: '50mb' }));

// Add content inspection middleware after body parsing - temporarily disabled for debugging
// app.use(contentInspectionMiddleware);

// Add input validation middleware - temporarily disabled for debugging
// app.use(inputValidationMiddleware);

// PostgreSQL session store
const PgSession = ConnectPgSimple(session);

// Session middleware with PostgreSQL store
app.use(
  session({
    store: new PgSession({
      pool: pool,
      tableName: 'sessions',
      createTableIfMissing: false, // Use existing table from schema
    }),
    secret: process.env.SESSION_SECRET || "admin-secret-key-change-in-production",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false, // Set to true in production with HTTPS
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    },
  })
);

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