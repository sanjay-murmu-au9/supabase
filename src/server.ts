import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import cluster from 'cluster';
import os from 'os';
import { env, validateEnvironment } from './config/environment';
import { initializeDatabase } from './config/database';
import routes from './routes';
import { errorHandler, requestLogger } from './middlewares';
import { createRateLimiter } from './middlewares/rate-limit.middleware';

export class AppServer {
  private static instance: AppServer;
  private app: Application;
  private workers: Set<number>;

  private constructor() {
    this.app = express();
    this.workers = new Set();
    this.configureMiddleware();
  }

  public static getInstance(): AppServer {
    if (!AppServer.instance) {
      AppServer.instance = new AppServer();
    }
    return AppServer.instance;
  }

  private configureMiddleware(): void {
    // Security middleware
    this.app.use(helmet());
    this.app.disable('x-powered-by');

    // Compression
    this.app.use(compression());

    // CORS configuration
    const corsOptions = {
      origin: env.allowedOrigins,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
      credentials: true,
      maxAge: 86400
    };
    this.app.use(cors(corsOptions));

    // Body parsing middleware with limits
    this.app.use(express.json({ limit: '1mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '1mb' }));

    // Rate limiting
    this.app.use(createRateLimiter({
      windowMs: env.rateLimit.windowMs,
      max: env.rateLimit.max
    }));

    // Logging
    this.app.use(requestLogger);
  }

  private configureRoutes(): void {
    // Health check endpoint
    this.app.get('/health', (req, res) => {
      res.json({ 
        status: 'ok', 
        timestamp: new Date(),
        env: env.nodeEnv,
        workerId: cluster.worker?.id || 'primary'
      });
    });

    // API routes
    this.app.use('/api', routes);

    // 404 handler
    this.app.use((req, res) => {
      res.status(404).json({ 
        error: 'Not Found',
        path: req.path
      });
    });

    // Error handling
    this.app.use(errorHandler);
  }

  private handleWorkerManagement(): void {
    if (cluster.isPrimary && env.nodeEnv === 'production' && env.cluster.enabled) {
      const numCPUs = env.cluster.workers || os.cpus().length;
      
      console.log(`Primary ${process.pid} is running`);
      console.log(`Starting ${numCPUs} workers...`);

      // Fork workers
      for (let i = 0; i < numCPUs; i++) {
        const worker = cluster.fork();
        this.workers.add(worker.id);
      }

      // Handle worker exit and restart
      cluster.on('exit', (worker, code, signal) => {
        console.log(`Worker ${worker.id} died. Signal: ${signal}. Code: ${code}`);
        this.workers.delete(worker.id);

        // Fork a new worker
        const newWorker = cluster.fork();
        this.workers.add(newWorker.id);
        console.log(`Started new worker ${newWorker.id}`);
      });

      // Log active workers periodically
      setInterval(() => {
        console.log(`Active workers: ${Array.from(this.workers).join(', ')}`);
      }, 30000);

      return;
    }

    this.startServer();
  }

  private async startServer(): Promise<void> {
    try {
      validateEnvironment();
      await initializeDatabase();
      this.configureRoutes();

      const PORT = env.port;
      this.app.listen(PORT, () => {
        console.log(`Worker ${cluster.worker?.id || 'primary'} running on port ${PORT} in ${env.nodeEnv} mode`);
      });
    } catch (error: any) {
      console.error('Failed to start server:', error);
      process.exit(1);
    }
  }

  public async initialize(): Promise<void> {
    this.handleWorkerManagement();
  }

  // For testing purposes
  public getApp(): Application {
    return this.app;
  }
}