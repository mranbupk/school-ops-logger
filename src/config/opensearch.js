const { Client } = require('@opensearch-project/opensearch');
require('dotenv').config();

class OpenSearchConfig {
  constructor() {
    this.client = null;
    this.isConnected = false;
  }

  async connect() {
    try {
      this.client = new Client({
        node: `${process.env.OPENSEARCH_PROTOCOL}://${process.env.OPENSEARCH_HOST}:${process.env.OPENSEARCH_PORT}`,
        ssl: {
          rejectUnauthorized: false
        }
      });

      // Test the connection
      const response = await this.client.info();
      console.log('✅ OpenSearch connected successfully');
      console.log(`📊 Cluster: ${response.body.cluster_name}, Version: ${response.body.version.number}`);
      
      this.isConnected = true;
      return this.client;
    } catch (error) {
      console.error('❌ Failed to connect to OpenSearch:', error.message);
      throw error;
    }
  }

  async createIndex(indexName, mapping = null) {
    try {
      const exists = await this.client.indices.exists({ index: indexName });
      
      if (!exists.body) {
        const indexConfig = {
          index: indexName,
          body: mapping || this.getDefaultMapping()
        };
        
        await this.client.indices.create(indexConfig);
        console.log(`✅ Index '${indexName}' created successfully`);
      } else {
        console.log(`ℹ️ Index '${indexName}' already exists`);
      }
    } catch (error) {
      console.error(`❌ Failed to create index '${indexName}':`, error.message);
      throw error;
    }
  }

  getDefaultMapping() {
    return {
      mappings: {
        properties: {
          timestamp: { type: 'date' },
          level: { type: 'keyword' },
          message: { type: 'text' },
          service: { type: 'keyword' },
          userId: { type: 'keyword' },
          action: { type: 'keyword' },
          resource: { type: 'keyword' },
          metadata: { type: 'object', dynamic: true },
          ip: { type: 'ip' },
          userAgent: { type: 'text' }
        }
      },
      settings: {
        number_of_shards: 1,
        number_of_replicas: 0
      }
    };
  }

  async healthCheck() {
    try {
      const response = await this.client.cluster.health();
      return {
        status: response.body.status,
        numberOfNodes: response.body.number_of_nodes,
        activeShards: response.body.active_shards
      };
    } catch (error) {
      console.error('❌ Health check failed:', error.message);
      throw error;
    }
  }

  getClient() {
    if (!this.client || !this.isConnected) {
      throw new Error('OpenSearch client not connected. Call connect() first.');
    }
    return this.client;
  }
}

module.exports = new OpenSearchConfig(); 