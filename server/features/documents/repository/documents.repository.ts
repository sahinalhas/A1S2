import getDatabase from '../../../lib/database.js';
import type { Document } from '../types/documents.types.js';

let statements: any = null;
let isInitialized = false;

function ensureInitialized(): void {
  if (isInitialized && statements) return;
  
  const db = getDatabase();
  
  statements = {
    getDocumentsByStudent: db.prepare('SELECT * FROM student_documents WHERE studentId = ? ORDER BY created_at DESC'),
    getDocument: db.prepare('SELECT * FROM student_documents WHERE id = ?'),
    insertDocument: db.prepare(`
      INSERT INTO student_documents (id, studentId, name, type, dataUrl)
      VALUES (?, ?, ?, ?, ?)
    `),
    deleteDocument: db.prepare('DELETE FROM student_documents WHERE id = ?'),
  };
  
  isInitialized = true;
}

export function getDocumentsByStudent(studentId: string): Document[] {
  try {
    ensureInitialized();
    return statements.getDocumentsByStudent.all(studentId) as Document[];
  } catch (error) {
    console.error('Database error in getDocumentsByStudent:', error);
    return [];
  }
}

export function saveDocument(document: Document): void {
  try {
    ensureInitialized();
    statements.insertDocument.run(
      document.id,
      document.studentId,
      document.name,
      document.type,
      document.dataUrl
    );
  } catch (error) {
    console.error('Database error in saveDocument:', error);
    throw error;
  }
}

export function deleteDocument(id: string, schoolId?: string): void {
  try {
    ensureInitialized();
    if (schoolId) {
      const db = getDatabase();
      db.prepare(`
        DELETE FROM student_documents 
        WHERE id = ? AND studentId IN (
          SELECT id FROM students WHERE school_id = ?
        )
      `).run(id, schoolId);
    } else {
      statements.deleteDocument.run(id);
    }
  } catch (error) {
    console.error('Database error in deleteDocument:', error);
    throw error;
  }
}
