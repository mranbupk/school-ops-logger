const logger = require('../src/services/logger');
const opensearchLogger = require('../src/services/opensearch-logger');

// Example: Different types of logging scenarios
async function loggingExamples() {
  console.log('📝 Running logging examples...\n');

  // 1. Basic logging
  console.log('1. Basic logging examples:');
  logger.info('Application started successfully');
  logger.warn('High memory usage detected');
  logger.error('Database connection failed', new Error('Connection timeout'));
  logger.debug('Processing request with ID: 12345');

  // 2. School-specific logging
  console.log('\n2. School-specific logging examples:');
  
  // Student actions
  logger.logStudentAction('enroll', 'STU_001', {
    grade: 10,
    parentName: 'John Doe',
    enrollmentDate: new Date().toISOString()
  });

  logger.logStudentAction('transfer', 'STU_002', {
    fromGrade: 9,
    toGrade: 10,
    reason: 'Academic advancement'
  });

  // Teacher actions
  logger.logTeacherAction('assign_grade', 'TCH_001', {
    subject: 'Mathematics',
    studentId: 'STU_003',
    grade: 'A+'
  });

  logger.logTeacherAction('create_assignment', 'TCH_002', {
    subject: 'Science',
    dueDate: '2024-01-15',
    totalStudents: 25
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

  // 3. Security events
  console.log('\n3. Security event logging:');
  logger.logSecurityEvent('failed_login', {
    username: 'teacher123',
    ip: '192.168.1.100',
    userAgent: 'Mozilla/5.0...',
    reason: 'Invalid password'
  });

  logger.logSecurityEvent('unauthorized_access', {
    resource: '/api/admin/users',
    ip: '192.168.1.101',
    userAgent: 'Mozilla/5.0...',
    userId: 'STU_006'
  });

  // 4. System events
  console.log('\n4. System event logging:');
  logger.logSystemEvent('backup_completed', {
    backupSize: '2.5GB',
    duration: '15 minutes',
    filesCount: 15000
  });

  logger.logSystemEvent('maintenance_scheduled', {
    startTime: '2024-01-15T02:00:00Z',
    duration: '2 hours',
    affectedServices: ['database', 'file_storage']
  });

  // 5. Performance logging
  console.log('\n5. Performance logging:');
  logger.logPerformance('database_query', 150, {
    query: 'SELECT * FROM students WHERE grade = 10',
    rowsReturned: 45,
    table: 'students'
  });

  logger.logPerformance('api_request', 250, {
    endpoint: '/api/students',
    method: 'GET',
    responseSize: '15KB'
  });

  // 6. API request logging
  console.log('\n6. API request logging:');
  logger.logApiRequest('POST', '/api/students', 201, 300, {
    requestSize: '2KB',
    responseSize: '1KB',
    userId: 'TCH_001'
  });

  logger.logApiRequest('GET', '/api/students', 200, 150, {
    query: 'grade=10&page=1',
    totalResults: 25
  });

  // 7. Database operation logging
  console.log('\n7. Database operation logging:');
  logger.logDatabaseOperation('insert', 'students', 200, {
    studentId: 'STU_007',
    table: 'students',
    rowsAffected: 1
  });

  logger.logDatabaseOperation('update', 'grades', 180, {
    studentId: 'STU_008',
    subject: 'Mathematics',
    table: 'grades'
  });

  // 8. OpenSearch specific logging
  console.log('\n8. OpenSearch logging examples:');
  await opensearchLogger.info('Bulk student import started', {
    totalStudents: 500,
    source: 'csv_upload',
    initiatedBy: 'ADMIN_001'
  });

  await opensearchLogger.warn('Grade calculation taking longer than expected', {
    operation: 'final_grade_calculation',
    duration: '45 seconds',
    threshold: '30 seconds'
  });

  await opensearchLogger.error('Failed to sync with external system', new Error('Network timeout'), {
    externalSystem: 'state_education_portal',
    retryCount: 3,
    lastAttempt: new Date().toISOString()
  });

  // 9. Complex scenarios
  console.log('\n9. Complex logging scenarios:');
  
  // Multi-step operation
  logger.info('Starting end-of-semester grade processing', {
    semester: 'Fall 2024',
    totalStudents: 1200,
    totalClasses: 45
  });

  // Simulate processing steps
  for (let i = 1; i <= 5; i++) {
    logger.info(`Processing step ${i}/5`, {
      step: i,
      studentsProcessed: i * 240,
      remainingStudents: 1200 - (i * 240)
    });
  }

  logger.info('End-of-semester grade processing completed', {
    semester: 'Fall 2024',
    totalStudents: 1200,
    duration: '15 minutes',
    errors: 0
  });

  console.log('\n✅ All logging examples completed!');
}

// Example: Search and query logs
async function searchLogExamples() {
  console.log('\n🔍 Search and query examples:');
  
  try {
    // Search logs by level
    const errorLogs = await opensearchLogger.getLogsByLevel('error', 10);
    console.log(`Found ${errorLogs.total.value} error logs`);

    // Search logs by action
    const studentActions = await opensearchLogger.getLogsByAction('create', 10);
    console.log(`Found ${studentActions.total.value} create actions`);

    // Search logs by resource
    const studentLogs = await opensearchLogger.getLogsByResource('student', 10);
    console.log(`Found ${studentLogs.total.value} student-related logs`);

    // Search logs by time range
    const recentLogs = await opensearchLogger.getLogsByTimeRange(
      new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 24 hours ago
      new Date().toISOString(), // Now
      10
    );
    console.log(`Found ${recentLogs.total.value} logs in the last 24 hours`);

  } catch (error) {
    console.error('❌ Search examples failed:', error.message);
  }
}

// Run examples
async function runExamples() {
  try {
    await loggingExamples();
    await searchLogExamples();
  } catch (error) {
    console.error('❌ Examples failed:', error.message);
  }
}

// Export for use in other files
module.exports = {
  loggingExamples,
  searchLogExamples,
  runExamples
};

// Run if this file is executed directly
if (require.main === module) {
  runExamples();
} 