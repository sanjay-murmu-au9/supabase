import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { env, validateEnvironment } from './config/environment';
import { initializeDatabase } from './config/database';
import routes from './routes';
import { errorHandler, requestLogger } from './middlewares';

// Validate environment variables
validateEnvironment();

const app = express();

// Security middleware
app.use(helmet());
app.disable('x-powered-by');

// CORS configuration
const corsOptions = {
  origin: env.allowedOrigins,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  maxAge: 86400
};
app.use(cors(corsOptions));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging
app.use(requestLogger);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date(),
    env: env.nodeEnv
  });
});

const startServer = async () => {
  try {
    // Initialize database before setting up routes
    await initializeDatabase();

    // API routes - only mount after database is initialized
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
      console.log(`Server running in ${env.nodeEnv} mode on port ${PORT}`);
    });
  } catch (error: any) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Start the server
startServer().catch((error) => {
  console.error('Fatal error during startup:', error);
  process.exit(1);
});

export default app;