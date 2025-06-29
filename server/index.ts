import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupSecurity } from "./security";
import { loadSecrets } from "./secrets";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// ES module equivalent of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Setup security middleware first
setupSecurity(app);

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Simple health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    port: process.env.PORT || 5000
  });
});

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

      console.log(logLine);
    }
  });

  next();
});

(async () => {
  try {
    console.log('Starting Roastah server...');
    console.log('Environment:', process.env.NODE_ENV);
    console.log('Port:', process.env.PORT || 5000);
    
    // Load secrets from Secret Manager (in production)
    await loadSecrets();
    
    const server = await registerRoutes(app);

    app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
      const status = err.status || err.statusCode || 500;
      const message = err.message || "Internal Server Error";

      console.error('Express error:', err);
      res.status(status).json({ message });
      throw err;
    });

    // Production static file serving
    const distPath = path.resolve(__dirname, "../dist/public");
    
    if (fs.existsSync(distPath)) {
      app.use(express.static(distPath));
      
      // Serve index.html for all non-API routes (SPA routing)
      app.use("*", (req, res, next) => {
        if (req.path.startsWith('/api')) {
          return next();
        }
        res.sendFile(path.resolve(distPath, "index.html"));
      });
    } else {
      console.warn('No dist/public directory found, skipping static file serving');
    }

    // Use the PORT environment variable (Cloud Run provides PORT=8080)
    // Fallback to 5000 for local development
    const port = process.env.PORT || 5000;
    server.listen({
      port,
      host: "0.0.0.0",
      reusePort: true,
    }, () => {
      console.log(`✅ Roastah server started successfully on port ${port}`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
})();
