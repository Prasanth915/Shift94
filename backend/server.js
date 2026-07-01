import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import config from './config/index.js';

const app = express();

// Set security HTTP headers
app.use(helmet());

// Development logging
if (config.nodeEnv === 'development') {
  app.use(morgan('dev'));
}

// Enable CORS for frontend origin
app.use(
  cors({
    origin: config.appUrl,
    credentials: true,
  })
);

// Body parsers
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());

// Static file serving for uploads
app.use('/uploads', express.static(config.uploadPath));

// Import routes
import authRoutes from './src/modules/auth/auth.routes.js';
import projectRoutes from './src/modules/projects/project.routes.js';
import oauthRoutes from './src/modules/oauth/oauth.routes.js';
import dashboardRoutes from './src/modules/history/dashboard.routes.js';
import historyRoutes from './src/modules/history/history.routes.js';
import settingsRoutes from './src/modules/settings/settings.routes.js';

// Register routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/projects', projectRoutes);
app.use('/api/v1/oauth', oauthRoutes);
app.use('/api/v1/dashboard', dashboardRoutes);
app.use('/api/v1/history', historyRoutes);
app.use('/api/v1/settings', settingsRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Shift 9 API server is running and healthy',
    data: {
      uptime: process.uptime(),
      timestamp: new Date(),
    },
    errors: null,
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Resource not found: ${req.originalUrl}`,
    data: null,
    errors: [
      {
        message: 'The requested endpoint does not exist on this server',
      },
    ],
  });
});

// Global error handling middleware
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  res.status(statusCode).json({
    success: false,
    message,
    data: null,
    errors: [
      {
        message: config.nodeEnv === 'development' ? err.stack : 'An unexpected error occurred',
      },
    ],
  });
});

// Start the server
app.listen(config.port, () => {
  console.info(`[Shift 9 Server] Running in ${config.nodeEnv} mode on port ${config.port}`);
});

export default app;
