const opensearchConfig = require('../config/opensearch');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

class OpenSearchLogger {
  constructor() {
    this.client = null;
    this.indexName = process.env.LOG_INDEX_NAME || 'school-application-logs';
    this.bulkBuffer = [];
    this.bulkSize = 100;
    this.flushInterval = 5000; // 5 seconds
    this.flushTimer = null;
  }

  async initialize() {
    try {
      this.client = await opensearchConfig.connect();
      await opensearchConfig.createIndex(this.indexName);
      
      // Start periodic flush
      this.startPeriodicFlush();
      
      console.log('✅ OpenSearch Logger initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize OpenSearch Logger:', error.message);
      throw error;
    }
  }

  createLogDocument(level, scope, methodName, message, args = {}, options = {}) {
    return {
      index: this.indexName,
      body: {
        timestamp: new Date().toISOString(),
        level,
        scope,
        methodName,
        message,
        service: 'school-application',
        environment: process.env.NODE_ENV || 'development',
        args,
        ...options
      }
    };
  }

  async logToOpenSearch(level, scope, methodName, message, args = {}, options = {}) {
    try {
      const logDoc = this.createLogDocument(level, scope, methodName, message, args, options);
      
      // Add to bulk buffer
      this.bulkBuffer.push({ index: { _index: this.indexName } });
      this.bulkBuffer.push(logDoc.body);
      
      // Flush if buffer is full
      if (this.bulkBuffer.length >= this.bulkSize * 2) {
        await this.flush();
      }
      
      return logDoc;
    } catch (error) {
      console.error('❌ Failed to log to OpenSearch:', error.message);
      throw error;
    }
  }

  async flush() {
    if (this.bulkBuffer.length === 0) return;
    
    try {
      const response = await this.client.bulk({
        body: this.bulkBuffer
      });
      
      if (response.body.errors) {
        console.error('❌ Bulk indexing errors:', response.body.items);
      } else {
        console.log(`✅ Flushed ${this.bulkBuffer.length / 2} log entries to OpenSearch`);
      }
      
      this.bulkBuffer = [];
    } catch (error) {
      console.error('❌ Failed to flush logs to OpenSearch:', error.message);
      throw error;
    }
  }

  startPeriodicFlush() {
    this.flushTimer = setInterval(async () => {
      try {
        await this.flush();
      } catch (error) {
        console.error('❌ Periodic flush failed:', error.message);
      }
    }, this.flushInterval);
  }

  stopPeriodicFlush() {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
      this.flushTimer = null;
    }
  }

  // Standard logging methods
  async info(scope, methodName, message, args = {}, options = {}) {
    return this.logToOpenSearch('info', scope, methodName, message, args, options);
  }

  async error(scope, methodName, error, args = {}) {
    return this.logToOpenSearch('error', scope, methodName, error.message || error, args, {
      error: error ? {
        message: error.message,
        stack: error.stack,
        name: error.name
      } : null
    });
  }

  async warn(scope, methodName, message, args = {}, options = {}) {
    return this.logToOpenSearch('warn', scope, methodName, message, args, options);
  }

  async debug(scope, methodName, message, args = {}, options = {}) {
    return this.logToOpenSearch('debug', scope, methodName, message, args, options);
  }

  // Log (alias for info)
  async log(scope, methodName, message, args = {}, options = {}) {
    return this.info(scope, methodName, message, args, options);
  }

  // Event logging
  async event(eventType, values = {}, options = {}) {
    return this.logToOpenSearch('info', 'Event', eventType, `Event: ${eventType}`, values, {
      eventType,
      ...options
    });
  }

  // Search and query methods
  async searchLogs(query = {}, size = 50) {
    try {
      const response = await this.client.search({
        index: this.indexName,
        body: {
          query,
          sort: [{ timestamp: { order: 'desc' } }],
          size
        }
      });
      
      return response.body.hits;
    } catch (error) {
      console.error('❌ Failed to search logs:', error.message);
      throw error;
    }
  }

  async getLogsByLevel(level, size = 50) {
    return this.searchLogs({ match: { level } }, size);
  }

  async getLogsByAction(action, size = 50) {
    return this.searchLogs({ match: { action } }, size);
  }

  async getLogsByResource(resource, size = 50) {
    return this.searchLogs({ match: { resource } }, size);
  }

  async getLogsByTimeRange(startTime, endTime, size = 50) {
    return this.searchLogs({
      range: {
        timestamp: {
          gte: startTime,
          lte: endTime
        }
      }
    }, size);
  }

  async getLogsByUserId(userId, size = 50) {
    return this.searchLogs({ match: { userId } }, size);
  }

  // Cleanup method
  async cleanup() {
    try {
      await this.flush();
      this.stopPeriodicFlush();
      console.log('✅ OpenSearch Logger cleaned up successfully');
    } catch (error) {
      console.error('❌ Failed to cleanup OpenSearch Logger:', error.message);
      throw error;
    }
  }
}

module.exports = new OpenSearchLogger(); 