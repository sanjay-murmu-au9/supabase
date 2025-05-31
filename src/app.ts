import express from 'express';
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
import { AppServer } from './server';

// Function to start the Express application
const startExpressApp = async () => {
  // Validate environment variables
  validateEnvironment();

  const app = express();

  // Security middleware
  app.use(helmet());
  app.disable('x-powered-by');

  // Compression
  app.use(compression());

  // CORS configuration
  const corsOptions = {
    origin: env.allowedOrigins,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
    maxAge: 86400
  };
  app.use(cors(corsOptions));

  // Body parsing middleware with limits
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true, limit: '1mb' }));

  // Rate limiting
  app.use(createRateLimiter({
    windowMs: 60000, // 1 minute
    max: 100 // limit each IP to 100 requests per windowMs
  }));

  // Logging
  app.use(requestLogger);

  try {
    // Initialize database before setting up routes
    await initializeDatabase();

    // Health check endpoint
    app.get('/health', (req, res) => {
      res.json({ 
        status: 'ok', 
        timestamp: new Date(),
        env: env.nodeEnv,
        workerId: cluster.worker?.id || 'primary'
      });
    });

    // API routes
    app.use('/api', routes);

    // 404 handler
    app.use((req, res) => {
      res.status(404).json({ 
        error: 'Not Found',
        path: req.path
      });
    });

    // Error handling
    app.use(errorHandler);

    const PORT = env.port;
    app.listen(PORT, () => {
      console.log(`Worker ${cluster.worker?.id || 'primary'} running on port ${PORT}`);
    });
  } catch (error: any) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Start the application
const bootstrap = async () => {
  try {
    const server = AppServer.getInstance();
    await server.initialize();
  } catch (error) {
    console.error('Application failed to start:', error);
    process.exit(1);
  }
};

// Start the application
if (cluster.isPrimary && env.nodeEnv === 'production') {
  const numCPUs = os.cpus().length;
  
  // Keep track of worker status
  const workers = new Set();

  console.log(`Primary ${process.pid} is running`);
  console.log(`Starting ${numCPUs} workers...`);

  // Fork workers
  for (let i = 0; i < numCPUs; i++) {
    const worker = cluster.fork();
    workers.add(worker.id);
  }

  // Handle worker exit and restart
  cluster.on('exit', (worker, code, signal) => {
    console.log(`Worker ${worker.id} died. Signal: ${signal}. Code: ${code}`);
    workers.delete(worker.id);

    // Fork a new worker
    const newWorker = cluster.fork();
    workers.add(newWorker.id);
    console.log(`Started new worker ${newWorker.id}`);
  });

  // Log active workers periodically
  setInterval(() => {
    console.log(`Active workers: ${Array.from(workers).join(', ')}`);
  }, 30000);
} else {
  bootstrap();
}