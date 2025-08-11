const express = require('express');
const logger = require('./services/logger');
const opensearchLogger = require('./services/opensearch-logger');
const studentRoutes = require('./routes/student-routes');
const packageJson = require('../package.json');
require('dotenv').config();

// Scope definition at the top like a library
const SCOPE = `SchoolApplication#${packageJson.version}`;

class SchoolApplication {
  
  constructor() {
    this.app = express();
    this.port = process.env.APP_PORT || 3000;
  }

  async initialize() {
    try {
      console.log('🔍 DEBUG: Starting application initialization...');
      
      // Initialize logging services
      console.log('🔍 DEBUG: Initializing logger...');
      logger.initialize();
      console.log('🔍 DEBUG: Logger initialized successfully');
      
      console.log('🔍 DEBUG: Initializing OpenSearch logger...');
      await opensearchLogger.initialize();
      console.log('🔍 DEBUG: OpenSearch logger initialized successfully');
      
      // Log application startup
      console.log('🔍 DEBUG: Logging application startup...');
      logger.info(SCOPE, 'initialize', 'Application started', {
        port: this.port,
        environment: process.env.NODE_ENV,
        timestamp: new Date().toISOString()
      });
      
      await opensearchLogger.info(SCOPE, 'initialize', 'Application started', {
        port: this.port,
        environment: process.env.NODE_ENV,
        timestamp: new Date().toISOString()
      });
      console.log('🔍 DEBUG: Startup logs sent successfully');

      // Middleware
      console.log('🔍 DEBUG: Setting up middleware...');
      this.setupMiddleware();
      console.log('🔍 DEBUG: Middleware setup completed');
      
      // Routes
      console.log('🔍 DEBUG: Setting up routes...');
      this.setupRoutes();
      console.log('🔍 DEBUG: Routes setup completed');
      
      // Error handling
      console.log('🔍 DEBUG: Setting up error handling...');
      this.setupErrorHandling();
      console.log('🔍 DEBUG: Error handling setup completed');
      
      console.log('✅ School application initialized successfully');
      
    } catch (error) {
      console.error('❌ Failed to initialize application:', error.message);
      console.error('🔍 DEBUG: Error stack:', error.stack);
      process.exit(1);
    }
  }

  setupMiddleware() {
    // Body parser
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true }));
    
    // CORS
    this.app.use((req, res, next) => {
      res.header('Access-Control-Allow-Origin', '*');
      res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
      
      if (req.method === 'OPTIONS') {
        res.sendStatus(200);
      } else {
        next();
      }
    });

    // Health check endpoint
    this.app.get('/health', async (req, res) => {
      try {
        const opensearchHealth = await opensearchLogger.client.cluster.health();
        
        res.json({
          status: 'healthy',
          timestamp: new Date().toISOString(),
          services: {
            application: 'healthy',
            opensearch: opensearchHealth.body.status
          }
        });
      } catch (error) {
        logger.error(SCOPE, 'health', error);
        res.status(500).json({
          status: 'unhealthy',
          error: error.message
        });
      }
    });

    // Logs endpoint for viewing recent logs
    this.app.get('/logs', async (req, res) => {
      try {
        const { level, action, resource, q, size = 50 } = req.query;
        
        const must = [];
        if (level) must.push({ match: { level } });
        if (action) must.push({ match: { action } });
        if (resource) must.push({ match: { resource } });
        if (q) must.push({ query_string: { query: q } });
        
        const query = must.length > 0 ? { bool: { must } } : { match_all: {} };
        const logs = await opensearchLogger.searchLogs(query, parseInt(size));
        
        res.json({
          success: true,
          data: logs.hits,
          total: logs.total.value
        });
      } catch (error) {
        logger.error(SCOPE, 'getLogs', error);
        res.status(500).json({
          success: false,
          message: 'Failed to fetch logs'
        });
      }
    });
  }

  setupRoutes() {
    // API routes
    this.app.use('/api', studentRoutes);
    
    // Root endpoint
    this.app.get('/', (req, res) => {
      res.json({
        message: 'School Management System API',
        version: '1.0.0',
        endpoints: {
          health: '/health',
          logs: '/logs',
          students: '/api/students'
        }
      });
    });
  }

  setupErrorHandling() {
    // 404 handler
    this.app.use((req, res) => {
      logger.warn(SCOPE, 'notFound', 'Route not found', {
        method: req.method,
        path: req.path,
        ip: req.ip
      });
      
      res.status(404).json({
        success: false,
        message: 'Route not found'
      });
    });

    // Global error handler
    this.app.use(async (error, req, res, next) => {
      logger.error(SCOPE, 'globalError', error, {
        method: req.method,
        path: req.path,
        ip: req.ip
      });
      
      await opensearchLogger.error(SCOPE, 'globalError', error, {
        method: req.method,
        path: req.path,
        ip: req.ip
      });

      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    });
  }

  async start() {
    try {
      await this.initialize();
      
      this.server = this.app.listen(this.port, () => {
        console.log(`🚀 School application running on port ${this.port}`);
        console.log(`📊 OpenSearch Dashboard: http://localhost:5601`);
        console.log(`🔍 Health Check: http://localhost:${this.port}/health`);
        console.log(`📝 Logs: http://localhost:${this.port}/logs`);
      });

      // Graceful shutdown
      process.on('SIGTERM', () => this.shutdown());
      process.on('SIGINT', () => this.shutdown());
      
    } catch (error) {
      console.error('❌ Failed to start application:', error.message);
      process.exit(1);
    }
  }

  async shutdown() {
    console.log('\n🛑 Shutting down application...');
    
    try {
      // Cleanup logging services
      await opensearchLogger.cleanup();
      
      // Close server
      if (this.server) {
        this.server.close(() => {
          console.log('✅ Server closed');
          console.log('👋 Goodbye!');
          process.exit(0);
        });
      } else {
        process.exit(0);
      }
    } catch (error) {
      console.error('❌ Error during shutdown:', error.message);
      process.exit(1);
    }
  }
}

// Start the application
const app = new SchoolApplication();
app.start(); 