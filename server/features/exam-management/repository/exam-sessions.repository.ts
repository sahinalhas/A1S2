import getDatabase from '../../../lib/database/index.js';
import type { 
  ExamSession, 
  CreateExamSessionInput, 
  UpdateExamSessionInput 
} from '../../../../shared/types/exam-management.types.js';

let statements: any = null;
let isInitialized = false;

function ensureInitialized(): void {
  if (isInitialized && statements) return;
  
  const db = getDatabase();
  
  statements = {
    getAll: db.prepare(`
      SELECT * FROM exam_sessions 
      ORDER BY exam_date DESC, created_at DESC
    `),
    getAllByType: db.prepare(`
      SELECT * FROM exam_sessions 
      WHERE exam_type_id = ?
      ORDER BY exam_date DESC, created_at DESC
    `),
    getById: db.prepare('SELECT * FROM exam_sessions WHERE id = ?'),
    insert: db.prepare(`
      INSERT INTO exam_sessions (id, exam_type_id, name, exam_date, description, created_by)
      VALUES (?, ?, ?, ?, ?, ?)
    `),
    update: db.prepare(`
      UPDATE exam_sessions 
      SET name = ?, exam_date = ?, description = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `),
    delete: db.prepare('DELETE FROM exam_sessions WHERE id = ?'),
    deleteBySchool: db.prepare(`
      DELETE FROM exam_sessions WHERE id = ? AND school_id = ?
    `),
  };
  
  isInitialized = true;
}

export function getAllExamSessions(): ExamSession[] {
  try {
    ensureInitialized();
    return statements.getAll.all() as ExamSession[];
  } catch (error) {
    console.error('Database error in getAllExamSessions:', error);
    return [];
  }
}

export function getExamSessionsByType(examTypeId: string): ExamSession[] {
  try {
    ensureInitialized();
    return statements.getAllByType.all(examTypeId) as ExamSession[];
  } catch (error) {
    console.error('Database error in getExamSessionsByType:', error);
    return [];
  }
}

export function getExamSessionById(id: string): ExamSession | null {
  try {
    ensureInitialized();
    const result = statements.getById.get(id);
    return result ? (result as ExamSession) : null;
  } catch (error) {
    console.error('Database error in getExamSessionById:', error);
    return null;
  }
}

export function createExamSession(input: CreateExamSessionInput): ExamSession {
  try {
    ensureInitialized();
    const id = `exam_session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    statements.insert.run(
      id,
      input.exam_type_id,
      input.name,
      input.exam_date,
      input.description || null,
      input.created_by || null
    );
    
    const created = statements.getById.get(id);
    if (!created) {
      throw new Error('Failed to create exam session');
    }
    
    return created as ExamSession;
  } catch (error) {
    console.error('Database error in createExamSession:', error);
    throw error;
  }
}

export function updateExamSession(id: string, input: UpdateExamSessionInput): ExamSession {
  try {
    ensureInitialized();
    
    const existing = statements.getById.get(id);
    if (!existing) {
      throw new Error('Exam session not found');
    }
    
    const name = input.name ?? existing.name;
    const exam_date = input.exam_date ?? existing.exam_date;
    const description = input.description ?? existing.description;
    
    statements.update.run(name, exam_date, description, id);
    
    const updated = statements.getById.get(id);
    if (!updated) {
      throw new Error('Failed to update exam session');
    }
    
    return updated as ExamSession;
  } catch (error) {
    console.error('Database error in updateExamSession:', error);
    throw error;
  }
}

export function deleteExamSession(id: string): void {
  try {
    ensureInitialized();
    statements.delete.run(id);
  } catch (error) {
    console.error('Database error in deleteExamSession:', error);
    throw error;
  }
}
