const logger = require('../services/logger');
const opensearchLogger = require('../services/opensearch-logger');
const Joi = require('joi');
const packageJson = require('../../package.json');

// Scope definition at the top like a library
const SCOPE = `StudentController#${packageJson.version}`;

// Mock database for demonstration
const students = new Map();

// Validation schemas
const studentSchema = Joi.object({
  name: Joi.string().required().min(2).max(50),
  email: Joi.string().email().required(),
  grade: Joi.number().integer().min(1).max(12).required(),
  age: Joi.number().integer().min(5).max(25).required(),
  parentPhone: Joi.string().pattern(/^\+?[\d\s-]+$/).required()
});

class StudentController {
  
  // Create a new student
  static async createStudent(req, res) {
    const startTime = Date.now();
    console.log('🔍 DEBUG: createStudent called with body:', req.body);
    
    try {
      // Validate input
      console.log('🔍 DEBUG: Validating input...');
      const { error, value } = studentSchema.validate(req.body);
      if (error) {
        console.log('🔍 DEBUG: Validation failed:', error.details);
        logger.error(SCOPE, 'createStudent', new Error('Validation failed'), {
          errors: error.details,
          input: req.body
        });
        
        await opensearchLogger.error(SCOPE, 'createStudent', new Error('Validation failed'), {
          errors: error.details,
          input: req.body
        });
        
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: error.details
        });
      }
      console.log('🔍 DEBUG: Validation passed');

      const studentId = `STU_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      console.log('🔍 DEBUG: Generated student ID:', studentId);
      
      const student = {
        id: studentId,
        ...value,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      console.log('🔍 DEBUG: Created student object:', student);

      // Simulate database operation
      console.log('🔍 DEBUG: Storing student in memory...');
      students.set(studentId, student);
      console.log('🔍 DEBUG: Student stored successfully');
      
      const duration = Date.now() - startTime;
      console.log('🔍 DEBUG: Operation duration:', duration, 'ms');
      
      // Log successful creation
      console.log('🔍 DEBUG: Logging to Winston...');
      logger.info(SCOPE, 'createStudent', 'Student created successfully', {
        studentId,
        studentName: student.name,
        grade: student.grade,
        duration
      });
      
      console.log('🔍 DEBUG: Logging to OpenSearch...');
      await opensearchLogger.info(SCOPE, 'createStudent', 'Student created successfully', {
        studentId,
        studentName: student.name,
        grade: student.grade,
        duration
      });
      console.log('🔍 DEBUG: Logging completed');

      res.status(201).json({
        success: true,
        message: 'Student created successfully',
        data: student
      });

    } catch (error) {
      const duration = Date.now() - startTime;
      
      logger.error(SCOPE, 'createStudent', error, {
        input: req.body,
        duration
      });
      
      await opensearchLogger.error(SCOPE, 'createStudent', error, {
        input: req.body,
        duration
      });

      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  // Get all students
  static async getAllStudents(req, res) {
    const startTime = Date.now();
    
    try {
      const { page = 1, limit = 10, grade, search } = req.query;
      
      // Simulate database query
      let filteredStudents = Array.from(students.values());
      
      if (grade) {
        filteredStudents = filteredStudents.filter(s => s.grade == grade);
      }
      
      if (search) {
        filteredStudents = filteredStudents.filter(s => 
          s.name.toLowerCase().includes(search.toLowerCase()) ||
          s.email.toLowerCase().includes(search.toLowerCase())
        );
      }
      
      const total = filteredStudents.length;
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + parseInt(limit);
      const paginatedStudents = filteredStudents.slice(startIndex, endIndex);
      
      const duration = Date.now() - startTime;
      
      logger.logAction('list', 'student', null, {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        duration,
        filters: { grade, search }
      });
      
      await opensearchLogger.logAction('list', 'student', null, {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        duration,
        filters: { grade, search }
      });

      res.json({
        success: true,
        data: paginatedStudents,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(total / limit)
        }
      });

    } catch (error) {
      const duration = Date.now() - startTime;
      
      logger.error(SCOPE, 'getAllStudents', error, {
        query: req.query,
        duration
      });
      
      await opensearchLogger.error(SCOPE, 'getAllStudents', error, {
        query: req.query,
        duration
      });

      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  // Get student by ID
  static async getStudentById(req, res) {
    const startTime = Date.now();
    const { id } = req.params;
    
    try {
      const student = students.get(id);
      
      if (!student) {
        logger.warn(SCOPE, 'getStudentById', 'Student not found', {
          studentId: id,
          requestedBy: req.user?.id
        });
        
        await opensearchLogger.warn(SCOPE, 'getStudentById', 'Student not found', {
          studentId: id,
          requestedBy: req.user?.id
        });
        
        return res.status(404).json({
          success: false,
          message: 'Student not found'
        });
      }
      
      const duration = Date.now() - startTime;
      
      logger.logAction('read', 'student', id, {
        studentName: student.name,
        duration
      });
      
      await opensearchLogger.logAction('read', 'student', id, {
        studentName: student.name,
        duration
      });

      res.json({
        success: true,
        data: student
      });

    } catch (error) {
      const duration = Date.now() - startTime;
      
      logger.error('Failed to get student', error, {
        studentId: id,
        duration
      });
      
      await opensearchLogger.error('Failed to get student', error, {
        studentId: id,
        duration
      });

      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  // Update student
  static async updateStudent(req, res) {
    const startTime = Date.now();
    const { id } = req.params;
    
    try {
      const student = students.get(id);
      
      if (!student) {
        logger.warn(SCOPE, 'updateStudent', 'Student not found for update', {
          studentId: id,
          requestedBy: req.user?.id
        });
        
        await opensearchLogger.warn(SCOPE, 'updateStudent', 'Student not found for update', {
          studentId: id,
          requestedBy: req.user?.id
        });
        
        return res.status(404).json({
          success: false,
          message: 'Student not found'
        });
      }

      // Validate input
      const { error, value } = studentSchema.validate(req.body);
      if (error) {
        logger.warn(SCOPE, 'updateStudent', 'Student update failed - validation error', {
          studentId: id,
          errors: error.details,
          input: req.body
        });
        
        await opensearchLogger.warn(SCOPE, 'updateStudent', 'Student update failed - validation error', {
          studentId: id,
          errors: error.details,
          input: req.body
        });
        
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: error.details
        });
      }

      // Update student
      const updatedStudent = {
        ...student,
        ...value,
        updatedAt: new Date().toISOString()
      };
      
      students.set(id, updatedStudent);
      
      const duration = Date.now() - startTime;
      
      logger.logAction('update', 'student', id, {
        studentName: updatedStudent.name,
        changes: Object.keys(value),
        duration
      });
      
      await opensearchLogger.logAction('update', 'student', id, {
        studentName: updatedStudent.name,
        changes: Object.keys(value),
        duration
      });

      res.json({
        success: true,
        message: 'Student updated successfully',
        data: updatedStudent
      });

    } catch (error) {
      const duration = Date.now() - startTime;
      
      logger.error(SCOPE, 'updateStudent', error, {
        studentId: id,
        input: req.body,
        duration
      });
      
      await opensearchLogger.error(SCOPE, 'updateStudent', error, {
        studentId: id,
        input: req.body,
        duration
      });

      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  // Delete student
  static async deleteStudent(req, res) {
    const startTime = Date.now();
    const { id } = req.params;
    
    try {
      const student = students.get(id);
      
      if (!student) {
        logger.warn(SCOPE, 'deleteStudent', 'Student not found for deletion', {
          studentId: id,
          requestedBy: req.user?.id
        });
        
        await opensearchLogger.warn(SCOPE, 'deleteStudent', 'Student not found for deletion', {
          studentId: id,
          requestedBy: req.user?.id
        });
        
        return res.status(404).json({
          success: false,
          message: 'Student not found'
        });
      }

      // Delete student
      students.delete(id);
      
      const duration = Date.now() - startTime;
      
      logger.logAction('delete', 'student', id, {
        studentName: student.name,
        duration
      });
      
      await opensearchLogger.logAction('delete', 'student', id, {
        studentName: student.name,
        duration
      });

      res.json({
        success: true,
        message: 'Student deleted successfully'
      });

    } catch (error) {
      const duration = Date.now() - startTime;
      
      logger.error(SCOPE, 'deleteStudent', error, {
        studentId: id,
        duration
      });
      
      await opensearchLogger.error(SCOPE, 'deleteStudent', error, {
        studentId: id,
        duration
      });

      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }
}

module.exports = StudentController; 