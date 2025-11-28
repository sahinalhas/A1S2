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
