# School Application with OpenSearch Logging

A school management demo API with structured logging to both Winston and OpenSearch. Includes request/response metrics, CRUD for students (in-memory), a health endpoint, and a /logs query endpoint.

## 🚀 Features

- **Structured logging** with Winston and OpenSearch (bulk buffered)
- **Consistent logger API** using `(scope, methodName, messageOrError, args)`
- **Action logging helper** via `logAction(action, resource, resourceId, metadata)`
- **Request logging middleware** with requestId, latency, status code, response size
- **/logs endpoint** to query OpenSearch with filters
- **OpenSearch Dashboards** integration for visualizations

## 📋 Prerequisites

- Node.js (v14 or higher)
- Docker Desktop (Windows/macOS) or Docker Engine (Linux)
- Docker Compose

On Windows/macOS, ensure Docker Desktop is running before starting services.

## 🛠️ Installation

1. Clone the repository
   ```bash
   git clone <repository-url>
   cd school-ops-logger
   ```

2. Install dependencies
   ```bash
   npm install
   ```

3. Set up environment variables
   ```bash
   cp env.example .env
   # Edit .env as needed
   ```

4. Start OpenSearch and OpenSearch Dashboards
   ```bash
   docker-compose up -d
   ```

5. Start the application
   ```bash
   npm start
   ```

## 🏃‍♂️ Quick Start

- OpenSearch: `docker-compose up -d`
- App: `npm start`
- Access:
  - API: `http://localhost:3000`
  - Health: `http://localhost:3000/health`
  - Logs: `http://localhost:3000/logs`
  - OpenSearch Dashboards: `http://localhost:5601`

## 📊 Logging Examples

### Basic logging (Winston)
```javascript
const logger = require('./src/services/logger');
const pkg = require('./package.json');
const SCOPE = `Example#${pkg.version}`;

logger.info(SCOPE, 'startup', 'Application started successfully');
logger.warn(SCOPE, 'memory', 'High memory usage detected', { usagePercent: 85 });
logger.debug(SCOPE, 'worker', 'Processing job', { jobId: 'job_123' });
logger.error(SCOPE, 'db', new Error('Connection timeout'), { host: 'localhost' });
```

### Action logging helper
```javascript
// action, resource, resourceId, metadata
logger.logAction('create', 'student', 'STU_001', { grade: 10, name: 'John Doe' });
```

### OpenSearch logging (direct)
```javascript
const opensearchLogger = require('./src/services/opensearch-logger');
const pkg = require('./package.json');
const SCOPE = `BulkOps#${pkg.version}`;

await opensearchLogger.initialize();
await opensearchLogger.info(SCOPE, 'bulkImport', 'Bulk student import started', {
  totalStudents: 500,
  source: 'csv_upload'
});
await opensearchLogger.warn(SCOPE, 'performance', 'Import is slow', { durationMs: 45000 });
await opensearchLogger.error(SCOPE, 'external', new Error('State API timeout'), { retries: 2 });
await opensearchLogger.cleanup();
```

### Searching logs programmatically
```javascript
// Helper methods
await opensearchLogger.getLogsByLevel('error', 10);
await opensearchLogger.getLogsByAction('create', 10);
await opensearchLogger.getLogsByResource('student', 10);

// Custom DSL query
await opensearchLogger.searchLogs({
  bool: {
    must: [
      { match: { resource: 'student' } },
      { match: { action: 'create' } }
    ],
    filter: [
      { range: { timestamp: { gte: '2024-01-01T00:00:00Z' } } }
    ]
  }
}, 50);
```

## 🔍 OpenSearch Integration

- Connection configured via `src/config/opensearch.js` using env vars
- Index mapping includes: `timestamp`, `level`, `message`, `service`, `userId`, `action`, `resource`, `metadata`, `ip`, `userAgent`
- Writes are buffered and flushed in bulk periodically

## 🗄️ API Endpoints

### Students

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/students` | Create a new student |
| `GET` | `/api/students` | Get all students (with pagination) |
| `GET` | `/api/students/:id` | Get student by ID |
| `PUT` | `/api/students/:id` | Update student |
| `DELETE` | `/api/students/:id` | Delete student |

### System

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/health` | Health check |
| `GET` | `/logs` | Query recent logs |

#### /logs query parameters
- `level`: match a log level (e.g., `info`, `error`)
- `action`: match an action (e.g., `create`, `update`)
- `resource`: match a resource (e.g., `student`)
- `q`: query string for free-text search (OpenSearch `query_string`)
- `size`: number of results to return (default 50)

Example:
```bash
curl "http://localhost:3000/logs?level=error&resource=student&q=grade:A&size=20"
```

### Example API usage
```bash
# Create a student
curl -X POST http://localhost:3000/api/students \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john.doe@school.com",
    "grade": 10,
    "age": 16,
    "parentPhone": "+1-555-123-4567"
  }'

# Get all students
curl "http://localhost:3000/api/students?page=1&limit=10"

# Get student by ID
curl "http://localhost:3000/api/students/STU_1234567890"

# Update student
curl -X PUT http://localhost:3000/api/students/STU_1234567890 \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Smith",
    "email": "john.smith@school.com",
    "grade": 11,
    "age": 17,
    "parentPhone": "+1-555-123-4567"
  }'

# Delete student
curl -X DELETE http://localhost:3000/api/students/STU_1234567890

# View logs
curl "http://localhost:3000/logs?level=info&size=20"
```

## 📈 Monitoring and Dashboards

1. Open OpenSearch Dashboards: `http://localhost:5601`
2. Create Index Pattern: `school-application-logs*`
3. Build visualizations for: log levels, top actions/resources, error trends, performance metrics

### Sample queries (Dashboards)
```json
// Logs by level
{
  "query": { "match": { "level": "error" } },
  "aggs": {
    "logs_over_time": { "date_histogram": { "field": "timestamp", "interval": "1h" } }
  }
}

// Top actions
{
  "query": { "match_all": {} },
  "aggs": { "top_actions": { "terms": { "field": "action", "size": 10 } } }
}

// Performance metrics
{
  "query": { "match": { "action": "performance" } },
  "aggs": { "avg_duration": { "avg": { "field": "duration" } } }
}
```

## 🔧 Configuration

Environment variables (`.env`):
```bash
# OpenSearch Configuration
OPENSEARCH_HOST=localhost
OPENSEARCH_PORT=9200
OPENSEARCH_PROTOCOL=http
OPENSEARCH_INDEX_PREFIX=school-logs

# Application Configuration
APP_PORT=3000
NODE_ENV=development

# Logging Configuration
LOG_LEVEL=info
LOG_INDEX_NAME=school-application-logs
```

## 🧪 Testing

- Run example scripts:
  ```bash
  node examples/new-logger-structure.js
  node examples/simple-logging.js
  ```
- Run the API and smoke test endpoints:
  ```bash
  npm start
  node test-api.js
  ```

## 📝 Log Structure

Each log entry includes fields such as:
```json
{
  "timestamp": "2024-01-10T10:30:00.000Z",
  "level": "info",
  "message": "Student created successfully",
  "service": "school-application",
  "scope": "StudentController#1.0.0",
  "methodName": "createStudent",
  "action": "create",
  "resource": "student",
  "resourceId": "STU_001",
  "args": { "studentName": "John Doe", "grade": 10, "duration": 150 }
}
```

## 🚨 Error Handling & Security

- Validation errors → warn level with details
- System/DB errors → error level with stack
- Security events are recorded with IP and user agent
- Sensitive data is not logged

## 📚 References

- OpenSearch: `https://opensearch.org/docs/`
- Winston: `https://github.com/winstonjs/winston`
- Express: `https://expressjs.com/`

## 📄 License

MIT License 