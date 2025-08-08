# School Application with OpenSearch Logging

A comprehensive school management system with integrated OpenSearch logging for structured log management, monitoring, and analytics.

## 🚀 Features

- **Structured Logging**: Comprehensive logging with Winston and OpenSearch
- **School-Specific Logging**: Specialized logging for students, teachers, classes, grades, and attendance
- **Performance Monitoring**: Track API requests, database operations, and system performance
- **Security Logging**: Monitor security events and unauthorized access attempts
- **Real-time Analytics**: View logs through OpenSearch Dashboards
- **RESTful API**: Complete CRUD operations for school entities
- **Health Monitoring**: Built-in health checks and monitoring endpoints

## 📋 Prerequisites

- Node.js (v14 or higher)
- Docker and Docker Compose
- Git

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd school-opensearch-logging
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp env.example .env
   # Edit .env file with your configuration
   ```

4. **Start OpenSearch and OpenSearch Dashboards**
   ```bash
   docker-compose up -d
   ```

5. **Start the application**
   ```bash
   npm start
   ```

## 🏃‍♂️ Quick Start

1. **Start OpenSearch services**:
   ```bash
   docker-compose up -d
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Run the application**:
   ```bash
   npm start
   ```

4. **Access the services**:
   - Application: http://localhost:3000
   - OpenSearch Dashboard: http://localhost:5601
   - Health Check: http://localhost:3000/health
   - Logs API: http://localhost:3000/logs

## 📊 Logging Examples

### Basic Logging

```javascript
const logger = require('./src/services/logger');

// Standard logging
logger.info('Application started successfully');
logger.warn('High memory usage detected');
logger.error('Database connection failed', error);
logger.debug('Processing request with ID: 12345');
```

### School-Specific Logging

```javascript
// Student actions
logger.logStudentAction('enroll', 'STU_001', {
  grade: 10,
  parentName: 'John Doe',
  enrollmentDate: new Date().toISOString()
});

// Teacher actions
logger.logTeacherAction('assign_grade', 'TCH_001', {
  subject: 'Mathematics',
  studentId: 'STU_003',
  grade: 'A+'
});

// Class actions
logger.logClassAction('schedule', 'CLS_001', {
  subject: 'Physics',
  teacherId: 'TCH_003',
  room: 'Lab 101',
  time: '09:00-10:30'
});

// Grade actions
logger.logGradeAction('update', 'STU_004', 'English', {
  oldGrade: 'B',
  newGrade: 'A-',
  reason: 'Extra credit assignment'
});

// Attendance actions
logger.logAttendanceAction('mark_present', 'STU_005', 'CLS_002', {
  date: '2024-01-10',
  period: 1
});
```

### Security and System Events

```javascript
// Security events
logger.logSecurityEvent('failed_login', {
  username: 'teacher123',
  ip: '192.168.1.100',
  reason: 'Invalid password'
});

// System events
logger.logSystemEvent('backup_completed', {
  backupSize: '2.5GB',
  duration: '15 minutes',
  filesCount: 15000
});
```

### Performance and API Logging

```javascript
// Performance logging
logger.logPerformance('database_query', 150, {
  query: 'SELECT * FROM students WHERE grade = 10',
  rowsReturned: 45
});

// API request logging
logger.logApiRequest('POST', '/api/students', 201, 300, {
  requestSize: '2KB',
  responseSize: '1KB'
});
```

## 🔍 OpenSearch Integration

### Direct OpenSearch Logging

```javascript
const opensearchLogger = require('./src/services/opensearch-logger');

// Log directly to OpenSearch
await opensearchLogger.info('Bulk student import started', {
  totalStudents: 500,
  source: 'csv_upload'
});

// Search logs
const errorLogs = await opensearchLogger.getLogsByLevel('error', 10);
const studentActions = await opensearchLogger.getLogsByAction('create', 10);
const recentLogs = await opensearchLogger.getLogsByTimeRange(
  '2024-01-01T00:00:00Z',
  '2024-01-02T00:00:00Z',
  50
);
```

### Search and Query Examples

```javascript
// Search by level
const logs = await opensearchLogger.searchLogs({
  match: { level: 'error' }
}, 50);

// Search by time range
const logs = await opensearchLogger.searchLogs({
  range: {
    timestamp: {
      gte: '2024-01-01T00:00:00Z',
      lte: '2024-01-02T00:00:00Z'
    }
  }
}, 50);

// Complex search
const logs = await opensearchLogger.searchLogs({
  bool: {
    must: [
      { match: { resource: 'student' } },
      { match: { action: 'create' } }
    ],
    filter: [
      {
        range: {
          timestamp: {
            gte: '2024-01-01T00:00:00Z'
          }
        }
      }
    ]
  }
}, 50);
```

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
| `GET` | `/logs` | View recent logs |

### Example API Usage

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
curl http://localhost:3000/api/students?page=1&limit=10

# Get student by ID
curl http://localhost:3000/api/students/STU_1234567890

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
curl "http://localhost:3000/logs?level=error&size=20"
```

## 📈 Monitoring and Analytics

### OpenSearch Dashboards

1. **Access OpenSearch Dashboards**: http://localhost:5601
2. **Create Index Patterns**: 
   - Go to Stack Management > Index Patterns
   - Create pattern for `school-application-logs*`
3. **Create Visualizations**:
   - Log levels over time
   - Top actions by resource
   - Error trends
   - Performance metrics

### Sample Dashboard Queries

```json
// Logs by level
{
  "query": {
    "match": {
      "level": "error"
    }
  },
  "aggs": {
    "logs_over_time": {
      "date_histogram": {
        "field": "timestamp",
        "interval": "1h"
      }
    }
  }
}

// Top actions
{
  "query": {
    "match_all": {}
  },
  "aggs": {
    "top_actions": {
      "terms": {
        "field": "action",
        "size": 10
      }
    }
  }
}

// Performance metrics
{
  "query": {
    "match": {
      "action": "performance"
    }
  },
  "aggs": {
    "avg_duration": {
      "avg": {
        "field": "duration"
      }
    }
  }
}
```

## 🔧 Configuration

### Environment Variables

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

### Docker Compose Configuration

The `docker-compose.yml` file includes:
- OpenSearch node with security disabled
- OpenSearch Dashboards
- Proper networking and volume configuration

## 🧪 Testing

### Run Examples

```bash
# Run logging examples
node examples/logging-examples.js

# Run the application
npm start

# Test API endpoints
curl http://localhost:3000/health
```

### Manual Testing

1. **Start the application**
2. **Create some students** using the API
3. **View logs** in OpenSearch Dashboards
4. **Monitor performance** through the `/logs` endpoint

## 📝 Log Structure

Each log entry includes:

```json
{
  "timestamp": "2024-01-10T10:30:00.000Z",
  "level": "info",
  "message": "Student action: create",
  "service": "school-application",
  "requestId": "uuid-here",
  "userId": "user-id",
  "action": "create",
  "resource": "student",
  "resourceId": "STU_001",
  "metadata": {
    "studentName": "John Doe",
    "grade": 10,
    "duration": 150
  }
}
```

## 🚨 Error Handling

The application includes comprehensive error handling:

- **Validation errors**: Logged as warnings
- **Database errors**: Logged as errors with stack traces
- **Security events**: Logged as warnings
- **System errors**: Logged as errors with full context

## 🔒 Security Considerations

- All security events are logged
- Failed login attempts are tracked
- Unauthorized access attempts are monitored
- IP addresses and user agents are logged
- Sensitive data is not logged (passwords, etc.)

## 📚 Additional Resources

- [OpenSearch Documentation](https://opensearch.org/docs/)
- [Winston Documentation](https://github.com/winstonjs/winston)
- [Express.js Documentation](https://expressjs.com/)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License. 