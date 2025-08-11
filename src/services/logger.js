const winston = require('winston');
require('dotenv').config();

const packageJson = require('../../package.json');

class LoggerService {
  constructor() {
    this.logger = null;
    this.requestId = null;
    this.userId = null;
    this.service = 'school-application';
    this.version = packageJson.version;
  }

  initialize() {
    // Create Winston logger with multiple transports
    this.logger = winston.createLogger({
      level: process.env.LOG_LEVEL || 'info',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        winston.format.json()
      ),
      defaultMeta: {
        service: this.service,
        environment: process.env.NODE_ENV || 'development'
      },
      transports: [
        // Console transport for development
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.colorize(),
            winston.format.simple()
          )
        }),
        // File transport for local logs
        new winston.transports.File({
          filename: 'logs/error.log',
          level: 'error'
        }),
        new winston.transports.File({
          filename: 'logs/combined.log'
        })
      ]
    });
  }

  setRequestContext(requestId, userId = null) {
    this.requestId = requestId;
    this.userId = userId;
  }

  createLogEntry(level, scope, methodName, message, args = {}, options = {}) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      level,
      scope,
      methodName,
      message,
      service: this.service,
      requestId: this.requestId,
      userId: this.userId,
      args,
      ...options
    };

    return logEntry;
  }

  // Error logging
  error(scope, methodName, error, args = {}) {
    const logEntry = this.createLogEntry('error', scope, methodName, error.message || error, args, {
      error: error ? {
        message: error.message,
        stack: error.stack,
        name: error.name
      } : null
    });
    this.logger.error(error.message || error, logEntry);
    return logEntry;
  }

  // Info logging
  info(scope, methodName, message, args = {}, options = {}) {
    const logEntry = this.createLogEntry('info', scope, methodName, message, args, options);
    this.logger.info(message, logEntry);
    return logEntry;
  }

  // Warn logging
  warn(scope, methodName, message, args = {}, options = {}) {
    const logEntry = this.createLogEntry('warn', scope, methodName, message, args, options);
    this.logger.warn(message, logEntry);
    return logEntry;
  }

  // Log (alias for info)
  log(scope, methodName, message, args = {}, options = {}) {
    return this.info(scope, methodName, message, args, options);
  }

  // Debug logging
  debug(scope, methodName, message, args = {}, options = {}) {
    const logEntry = this.createLogEntry('debug', scope, methodName, message, args, options);
    this.logger.debug(message, logEntry);
    return logEntry;
  }

  // Event logging
  event(eventType, values = {}, options = {}) {
    const logEntry = this.createLogEntry('info', 'Event', eventType, `Event: ${eventType}`, values, {
      eventType,
      ...options
    });
    this.logger.info(`Event: ${eventType}`, logEntry);
    return logEntry;
  }

  // Action helper to normalize resource/action logs
  logAction(action, resource, resourceId = null, metadata = {}) {
    const scope = `Action#${action}`;
    const methodName = `${resource}_action`;
    const message = `Action: ${action} on resource: ${resource}`;
    return this.info(scope, methodName, message, {}, {
      action,
      resource,
      resourceId,
      ...metadata
    });
  }

  // Helper method to create scope
  createScope(className) {
    return `${className}#${this.version}`;
  }
}

module.exports = new LoggerService(); 