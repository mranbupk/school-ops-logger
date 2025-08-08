const express = require('express');
const StudentController = require('../controllers/student-controller');
const RequestLogger = require('../middleware/request-logger');

const router = express.Router();

// Apply request logging middleware to all routes
router.use(RequestLogger.logRequest);

// Student routes
router.post('/students', StudentController.createStudent);
router.get('/students', StudentController.getAllStudents);
router.get('/students/:id', StudentController.getStudentById);
router.put('/students/:id', StudentController.updateStudent);
router.delete('/students/:id', StudentController.deleteStudent);

// Error handling middleware
router.use(RequestLogger.logError);

module.exports = router; 