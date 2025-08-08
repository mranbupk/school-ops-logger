const logger = require('../src/services/logger');
const opensearchLogger = require('../src/services/opensearch-logger');
const packageJson = require('../package.json');

// Scope definition at the top like a library
const SCOPE = `ExampleService#${packageJson.version}`;

// Example class to demonstrate the new logger structure
class ExampleService {
  constructor() {
    // Scope is now defined at the top of the file
  }

  async processData(data) {
    try {
      // Info logging
      logger.info(SCOPE, 'processData', 'Starting data processing', { dataSize: data.length });
      
      // Debug logging
      logger.debug(SCOPE, 'processData', 'Processing step 1', { step: 1, data });
      
      // Simulate some processing
      await this.validateData(data);
      
      // Log success
      logger.info(SCOPE, 'processData', 'Data processing completed', { 
        processedItems: data.length,
        duration: 150 
      });
      
      // Event logging
      logger.event('data_processed', { 
        totalItems: data.length,
        timestamp: new Date().toISOString()
      }, { requestId: 'req_123' });
      
      return { success: true, processedItems: data.length };
      
    } catch (error) {
      // Error logging
      logger.error(SCOPE, 'processData', error, { 
        dataSize: data.length,
        failedAt: new Date().toISOString()
      });
      
      throw error;
    }
  }

  async validateData(data) {
    logger.debug(SCOPE, 'validateData', 'Validating data structure', { dataType: typeof data });
    
    if (!Array.isArray(data)) {
      throw new Error('Data must be an array');
    }
    
    logger.info(SCOPE, 'validateData', 'Data validation passed', { itemCount: data.length });
  }
}

// Example usage
async function demonstrateNewLogger() {
  console.log('📝 New Logger Structure Examples\n');

  const service = new ExampleService();
  
  try {
    // Test with valid data
    console.log('1. Testing with valid data:');
    await service.processData([1, 2, 3, 4, 5]);
    
    // Test with invalid data
    console.log('\n2. Testing with invalid data:');
    await service.processData('invalid data');
    
  } catch (error) {
    console.log('✅ Error caught and logged:', error.message);
  }

  // Direct logger usage examples
  console.log('\n3. Direct logger usage:');
  
  const TEST_SCOPE = `TestClass#${packageJson.version}`;
  
  // Info logging
  logger.info(TEST_SCOPE, 'testMethod', 'This is an info message', { 
    userId: 'user123',
    action: 'test'
  });
  
  // Debug logging
  logger.debug(TEST_SCOPE, 'testMethod', 'This is a debug message', { 
    debugInfo: 'some debug data'
  });
  
  // Error logging
  logger.error(TEST_SCOPE, 'testMethod', new Error('Something went wrong'), { 
    context: 'test context'
  });
  
  // Event logging
  logger.event('user_action', { 
    action: 'button_click',
    userId: 'user123'
  }, { requestId: 'req_456' });

  console.log('\n✅ New logger structure examples completed!');
}

// Run the example
demonstrateNewLogger().catch(console.error); 