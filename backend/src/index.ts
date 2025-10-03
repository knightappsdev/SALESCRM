import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import { testConnections, closeConnections } from './database/connection';
import authRoutes from './routes/auth';
import contactRoutes from './routes/contacts';
import dealRoutes from './routes/deals';
import appointmentRoutes from './routes/appointments';
import documentRoutes from './routes/documents';
import propertyRoutes from './routes/properties';
import patientRoutes from './routes/patients';
import analyticsRoutes from './routes/analytics';

const app = express();
const PORT = process.env.PORT || 3001;

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://your-domain.com'] 
    : ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002'],
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Compression middleware
app.use(compression());

// Logging middleware
app.use(morgan('combined'));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/contacts', contactRoutes);
app.use('/api/deals', dealRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/properties', propertyRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/analytics', analyticsRoutes);

// Static file serving for uploads
app.use('/uploads', express.static('uploads'));

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handling middleware
app.use((error: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', error);
  
  if (error.type === 'entity.too.large') {
    return res.status(413).json({ error: 'File too large' });
  }
  
  return res.status(500).json({ 
    error: 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { details: error.message })
  });
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('Received SIGINT, shutting down gracefully...');
  await closeConnections();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('Received SIGTERM, shutting down gracefully...');
  await closeConnections();
  process.exit(0);
});

// Start server
const startServer = async () => {
  try {
    // Test database connections
    const connectionSuccess = await testConnections();
    if (!connectionSuccess) {
      console.error('Failed to connect to databases. Exiting...');
      process.exit(1);
    }

    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📊 Health check: http://localhost:${PORT}/health`);
      console.log(`🔗 API base URL: http://localhost:${PORT}/api`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();