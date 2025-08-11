const logger = require('../src/services/logger');
const opensearchLogger = require('../src/services/opensearch-logger');

// Simple logging examples with the four basic methods
async function simpleLoggingExamples() {
  console.log('📝 Simple Logging Examples\n');

  const SCOPE = 'Examples#v1';

  // Initialize OpenSearch logger (requires OpenSearch running)
  try {
    await opensearchLogger.initialize();
  } catch (err) {
    console.warn('⚠️ Skipping OpenSearch logs: initialization failed:', err.message);
  }

  // 1. INFO - General information
  console.log('1. INFO logging:');
  logger.info(SCOPE, 'startup', 'Application started successfully');
  logger.info(SCOPE, 'login', 'User logged in', { userId: 'user123', ip: '192.168.1.100' });
  logger.info(SCOPE, 'db', 'Database query completed', { table: 'students', rowsReturned: 25 });

  // 2. DEBUG - Detailed debugging information
  console.log('\n2. DEBUG logging:');
  logger.debug(SCOPE, 'request', 'Processing request with ID: 12345');
  logger.debug(SCOPE, 'db', 'Database connection established', { host: 'localhost', port: 5432 });
  logger.debug(SCOPE, 'cache', 'Cache miss for key: user_profile_123');

  // 3. WARN - Warning messages
  console.log('\n3. WARN logging:');
  logger.warn(SCOPE, 'memory', 'High memory usage detected', { memoryUsage: '85%', threshold: '80%' });
  logger.warn(SCOPE, 'security', 'Failed login attempt', { username: 'admin', ip: '192.168.1.101' });
  logger.warn(SCOPE, 'performance', 'Database query taking longer than expected', { duration: '5s', threshold: '3s' });

  // 4. ERROR - Error messages
  console.log('\n4. ERROR logging:');
  logger.error(SCOPE, 'db', new Error('Connection timeout'), { note: 'Database connection failed' });
  logger.error(SCOPE, 'api', new Error('Network error'), { endpoint: '/api/users' });
  logger.error(SCOPE, 'upload', new Error('Disk full'), { fileSize: '50MB', availableSpace: '10MB' });

  // 5. Simple action logging
  console.log('\n5. Action logging:');
  logger.logAction('create', 'student', 'STU_001', { name: 'John Doe', grade: 10 });
  logger.logAction('update', 'teacher', 'TCH_001', { subject: 'Mathematics' });
  logger.logAction('delete', 'class', 'CLS_001', { reason: 'Low enrollment' });

  // 6. OpenSearch logging (only if initialized)
  console.log('\n6. OpenSearch logging:');
  try {
    await opensearchLogger.info(SCOPE, 'bulk', 'Bulk operation started', { totalItems: 100 });
    await opensearchLogger.warn(SCOPE, 'performance', 'Performance threshold exceeded', { operation: 'data_import', duration: '30s' });
    await opensearchLogger.error(SCOPE, 'external', new Error('Service timeout'), { service: 'payment_gateway' });
  } catch {}

  // Cleanup OpenSearch logger
  try {
    await opensearchLogger.cleanup();
  } catch {}

  console.log('\n✅ Simple logging examples completed!');
}

// Run examples
simpleLoggingExamples().catch(console.error); 