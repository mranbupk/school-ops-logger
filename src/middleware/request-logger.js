const { v4: uuidv4 } = require('uuid');
const logger = require('../services/logger');
const opensearchLogger = require('../services/opensearch-logger');
const packageJson = require('../../package.json');

// Scope definition at the top like a library
const SCOPE = `RequestLogger#${packageJson.version}`;

class RequestLogger {
  static async logRequest(req, res, next) {
    const startTime = Date.now();
    const requestId = uuidv4();
    
    // Set request context for logging
    logger.setRequestContext(requestId, req.user?.id);
    
    // Log request start
    logger.info(SCOPE, 'logRequest', `Request started: ${req.method} ${req.path}`, {
      method: req.method,
      path: req.path,
      query: req.query,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      requestId
    });

    // Log to OpenSearch as well
    await opensearchLogger.info(SCOPE, 'logRequest', `Request started: ${req.method} ${req.path}`, {
      method: req.method,
      path: req.path,
      query: req.query,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      requestId
    });

    // Override res.end to log response
    const originalEnd = res.end;
    res.end = function(chunk, encoding) {
      const duration = Date.now() - startTime;
      
      // Log response
      logger.info(SCOPE, 'logRequest', `API Request: ${req.method} ${req.path}`, {
        method: req.method,
        path: req.path,
        statusCode: res.statusCode,
        duration,
        requestId,
        responseSize: chunk ? chunk.length : 0
      });

      // Log to OpenSearch
      opensearchLogger.info(SCOPE, 'logRequest', `API Request: ${req.method} ${req.path}`, {
        method: req.method,
        path: req.path,
        statusCode: res.statusCode,
        duration,
        requestId,
        responseSize: chunk ? chunk.length : 0
      });

      // Call original end method
      originalEnd.call(this, chunk, encoding);
    };

    next();
  }

  static async logError(error, req, res, next) {
    const requestId = req.headers['x-request-id'] || uuidv4();
    
    logger.error(SCOPE, 'logError', error, {
      method: req.method,
      path: req.path,
      requestId,
      ip: req.ip,
      userAgent: req.get('User-Agent')
    });

    // Log to OpenSearch
    await opensearchLogger.error(SCOPE, 'logError', error, {
      method: req.method,
      path: req.path,
      requestId,
      ip: req.ip,
      userAgent: req.get('User-Agent')
    });

    next(error);
  }

  static async logSecurityEvent(event, req, details = {}) {
    const requestId = req.headers['x-request-id'] || uuidv4();
    
    logger.warn(SCOPE, 'logSecurityEvent', `Security event: ${event}`, {
      method: req.method,
      path: req.path,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      requestId,
      ...details
    });

    // Log to OpenSearch
    await opensearchLogger.warn(SCOPE, 'logSecurityEvent', `Security event: ${event}`, {
      method: req.method,
      path: req.path,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      requestId,
      ...details
    });
  }
}

module.exports = RequestLogger; 