import type Database from 'better-sqlite3';
import getDatabase from '../../../lib/database.js';
import type { AttendanceRecord } from '../types/attendance.types.js';

interface AttendanceStatements {
  getAttendanceByStudent: Database.Statement;
  insertAttendance: Database.Statement;
}

let statements: AttendanceStatements | null = null;
let isInitialized = false;

function ensureInitialized(): void {
  if (isInitialized && statements) return;
  
  const db = getDatabase();
  
  statements = {
    getAttendanceByStudent: db.prepare('SELECT * FROM attendance WHERE studentId = ? ORDER BY date DESC'),
    insertAttendance: db.prepare('INSERT INTO attendance (id, studentId, date, status, notes) VALUES (?, ?, ?, ?, ?)'),
  };
  
  isInitialized = true;
}

export function getAttendanceByStudent(studentId: string): AttendanceRecord[] {
  try {
    ensureInitialized();
    if (!statements) throw new Error('Statements not initialized');
    return statements.getAttendanceByStudent.all(studentId) as AttendanceRecord[];
  } catch (error) {
    console.error('Database error in getAttendanceByStudent:', error);
    return [];
  }
}

export function insertAttendance(id: string, studentId: string, date: string, status: string, notes: string | null): void {
  try {
    ensureInitialized();
    if (!statements) throw new Error('Statements not initialized');
    statements.insertAttendance.run(id, studentId, date, status, notes);
  } catch (error) {
    console.error('Error inserting attendance:', error);
    throw error;
  }
}

// ================= SCHOOL-SCOPED FUNCTIONS =================

export function studentBelongsToSchool(studentId: string, schoolId: string): boolean {
  const db = getDatabase();
  const stmt = db.prepare('SELECT 1 FROM students WHERE id = ? AND school_id = ?');
  return !!stmt.get(studentId, schoolId);
}

export function getAttendanceByStudentAndSchool(studentId: string, schoolId: string): AttendanceRecord[] {
  try {
    const db = getDatabase();
    const stmt = db.prepare(`
      SELECT a.* FROM attendance a
      JOIN students s ON a.studentId = s.id
      WHERE a.studentId = ? AND s.school_id = ?
      ORDER BY a.date DESC
    `);
    return stmt.all(studentId, schoolId) as AttendanceRecord[];
  } catch (error) {
    console.error('Database error in getAttendanceByStudentAndSchool:', error);
    return [];
  }
}

export function insertAttendanceWithSchoolCheck(id: string, studentId: string, date: string, status: string, notes: string | null, schoolId: string): boolean {
  try {
    if (!studentBelongsToSchool(studentId, schoolId)) {
      return false;
    }
    insertAttendance(id, studentId, date, status, notes);
    return true;
  } catch (error) {
    console.error('Error inserting attendance with school check:', error);
    return false;
  }
}
