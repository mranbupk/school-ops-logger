// Log levels
export type LogLevel = 'error' | 'warn' | 'info' | 'debug';

// School resources
export type SchoolResource = 'student' | 'teacher' | 'class' | 'grade' | 'attendance';

// Common actions
export type StudentAction = 'create' | 'read' | 'update' | 'delete' | 'enroll' | 'transfer' | 'list';
export type TeacherAction = 'create' | 'read' | 'update' | 'delete' | 'assign_grade' | 'create_assignment';
export type ClassAction = 'create' | 'read' | 'update' | 'delete' | 'schedule';
export type GradeAction = 'create' | 'read' | 'update' | 'delete';
export type AttendanceAction = 'mark_present' | 'mark_absent' | 'create' | 'read' | 'update' | 'delete';

// Security events
export type SecurityEvent = 'failed_login' | 'unauthorized_access' | 'suspicious_activity' | 'password_change';

// System events
export type SystemEvent = 'application_startup' | 'application_shutdown' | 'backup_completed' | 'maintenance_scheduled';

// Base log entry interface
export interface BaseLogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  service: string;
  requestId?: string;
  userId?: string;
  action?: string;
  resource?: SchoolResource;
  resourceId?: string;
  metadata?: Record<string, any>;
}

// Student interface
export interface Student {
  id: string;
  name: string;
  email: string;
  grade: number;
  age: number;
  parentPhone: string;
  createdAt: string;
  updatedAt: string;
}

// Teacher interface
export interface Teacher {
  id: string;
  name: string;
  email: string;
  subject: string;
  department: string;
  createdAt: string;
  updatedAt: string;
}

// Class interface
export interface Class {
  id: string;
  name: string;
  subject: string;
  teacherId: string;
  room: string;
  schedule: string;
  createdAt: string;
  updatedAt: string;
}

// Grade interface
export interface Grade {
  id: string;
  studentId: string;
  subject: string;
  grade: string;
  semester: string;
  year: number;
  createdAt: string;
  updatedAt: string;
}

// Attendance interface
export interface Attendance {
  id: string;
  studentId: string;
  classId: string;
  date: string;
  status: 'present' | 'absent' | 'late';
  period: number;
  createdAt: string;
  updatedAt: string;
}

// API Response interfaces
export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: any[];
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

// Health check response
export interface HealthResponse {
  status: 'healthy' | 'unhealthy';
  timestamp: string;
  services: {
    application: string;
    opensearch: string;
  };
  error?: string;
}

// Log search response
export interface LogSearchResponse {
  success: boolean;
  data: {
    hits: Array<{
      _index: string;
      _type: string;
      _id: string;
      _score: number;
      _source: BaseLogEntry;
    }>;
    total: {
      value: number;
      relation: string;
    };
  };
  total: number;
}

// OpenSearch query types
export interface OpenSearchQuery {
  match?: Record<string, any>;
  range?: Record<string, any>;
  bool?: {
    must?: any[];
    should?: any[];
    must_not?: any[];
    filter?: any[];
  };
  [key: string]: any;
}

// Configuration interfaces
export interface OpenSearchConfig {
  host: string;
  port: number;
  protocol: string;
  indexPrefix: string;
}

export interface LoggerConfig {
  level: LogLevel;
  indexName: string;
  service: string;
  environment: string;
}

// Request context
export interface RequestContext {
  requestId: string;
  userId?: string;
  ip: string;
  userAgent: string;
  method: string;
  path: string;
}

// Performance metrics
export interface PerformanceMetrics {
  operation: string;
  duration: number;
  metadata?: Record<string, any>;
}

// Security event details
export interface SecurityEventDetails {
  event: SecurityEvent;
  username?: string;
  ip: string;
  userAgent: string;
  resource?: string;
  reason?: string;
}

// System event details
export interface SystemEventDetails {
  event: SystemEvent;
  metadata?: Record<string, any>;
}

// Database operation details
export interface DatabaseOperationDetails {
  operation: 'insert' | 'update' | 'delete' | 'select';
  table: string;
  duration: number;
  metadata?: Record<string, any>;
}

// API request details
export interface ApiRequestDetails {
  method: string;
  path: string;
  statusCode: number;
  duration: number;
  metadata?: Record<string, any>;
} 