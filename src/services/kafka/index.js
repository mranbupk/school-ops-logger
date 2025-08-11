const { KafkaClient, KafkaEventPublisher } = require('node-kafka-pubsub');
const opensearchLogger = require('../opensearch-logger');
const logger = require('../logger');
require('dotenv').config();

// Simple adapter bridging to existing logger services
const KafkaLoggerAdapter = {
  info(scope, method, message, meta = {}) {
    logger.info(scope, method, message, meta);
    opensearchLogger.info(scope, method, message, meta, { indexOverride: process.env.LOG_INDEX_NAME_KAFKA });
  },
  warn(scope, method, message, meta = {}) {
    logger.warn(scope, method, message, meta);
    opensearchLogger.warn(scope, method, message, meta, { indexOverride: process.env.LOG_INDEX_NAME_KAFKA });
  },
  error(scope, method, error, meta = {}) {
    logger.error(scope, method, error, meta);
    opensearchLogger.error(scope, method, error, meta, { indexOverride: process.env.LOG_INDEX_NAME_KAFKA });
  }
};

const kafkaClient = new KafkaClient({
  brokers: (process.env.KAFKA_BROKERS || 'localhost:9092').split(','),
  clientId: process.env.KAFKA_CLIENT_ID || 'school-app',
  ssl: process.env.KAFKA_SSL === 'true',
  logger: KafkaLoggerAdapter
});

const kafkaPublisher = new KafkaEventPublisher(kafkaClient);

module.exports = { kafkaClient, kafkaPublisher }; 