import getDatabase from '../../../lib/database.js';
import type { StudentStrength } from '../../../../shared/types.js';

let statements: any = null;
let isInitialized = false;

function ensureInitialized(): void {
  if (isInitialized && statements) return;
  
  const db = getDatabase();
  
  statements = {
    getByStudent: db.prepare('SELECT * FROM student_strengths WHERE studentId = ? ORDER BY assessmentDate DESC'),
    getLatestByStudent: db.prepare('SELECT * FROM student_strengths WHERE studentId = ? ORDER BY assessmentDate DESC LIMIT 1'),
    getById: db.prepare('SELECT * FROM student_strengths WHERE id = ?'),
    insert: db.prepare(`
      INSERT INTO student_strengths (
        id, studentId, assessmentDate, personalStrengths, academicStrengths, socialStrengths,
        creativeStrengths, physicalStrengths, successStories, resilienceFactors, supportSystems,
        copingStrategies, achievements, skills, talents, positiveFeedback, growthMindsetIndicators,
        notes, assessedBy
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `),
    delete: db.prepare('DELETE FROM student_strengths WHERE id = ?'),
    deleteBySchool: db.prepare('DELETE FROM student_strengths WHERE id = ? AND studentId IN (SELECT id FROM students WHERE school_id = ?)')
  };
  
  isInitialized = true;
}

export function getStrengthsByStudent(studentId: string): StudentStrength[] {
  try {
    ensureInitialized();
    return statements.getByStudent.all(studentId) as StudentStrength[];
  } catch (error) {
    console.error('Database error in getStrengthsByStudent:', error);
    throw error;
  }
}

export function getLatestStrengthByStudent(studentId: string): StudentStrength | null {
  try {
    ensureInitialized();
    const result = statements.getLatestByStudent.get(studentId);
    return result || null;
  } catch (error) {
    console.error('Database error in getLatestStrengthByStudent:', error);
    throw error;
  }
}

export function getStrengthById(id: string): StudentStrength | null {
  try {
    ensureInitialized();
    const result = statements.getById.get(id);
    return result || null;
  } catch (error) {
    console.error('Database error in getStrengthById:', error);
    throw error;
  }
}

export function insertStrength(strength: StudentStrength): void {
  try {
    ensureInitialized();
    statements.insert.run(
      strength.id,
      strength.studentId,
      strength.assessmentDate,
      strength.personalStrengths || null,
      strength.academicStrengths || null,
      strength.socialStrengths || null,
      strength.creativeStrengths || null,
      strength.physicalStrengths || null,
      strength.successStories || null,
      strength.resilienceFactors || null,
      strength.supportSystems || null,
      strength.copingStrategies || null,
      strength.achievements || null,
      strength.skills || null,
      strength.talents || null,
      strength.positiveFeedback || null,
      strength.growthMindsetIndicators || null,
      strength.notes || null,
      strength.assessedBy || null
    );
  } catch (error) {
    console.error('Database error in insertStrength:', error);
    throw error;
  }
}

export function updateStrength(id: string, updates: Partial<StudentStrength>): void {
  try {
    ensureInitialized();
    const db = getDatabase();
    
    const allowedFields = [
      'assessmentDate', 'personalStrengths', 'academicStrengths', 'socialStrengths',
      'creativeStrengths', 'physicalStrengths', 'successStories', 'resilienceFactors',
      'supportSystems', 'copingStrategies', 'achievements', 'skills', 'talents',
      'positiveFeedback', 'growthMindsetIndicators', 'notes', 'assessedBy'
    ];
    
    const fields = Object.keys(updates).filter(key => allowedFields.includes(key));
    
    if (fields.length > 0) {
      const setClause = fields.map(field => `${field} = ?`).join(', ');
      const values = fields.map(field => updates[field as keyof StudentStrength]);
      values.push(id);
      
      db.prepare(`UPDATE student_strengths SET ${setClause}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`).run(...values);
    }
  } catch (error) {
    console.error('Database error in updateStrength:', error);
    throw error;
  }
}

export function deleteStrength(id: string, schoolId?: string): void {
  try {
    ensureInitialized();
    if (schoolId) {
      statements.deleteBySchool.run(id, schoolId);
    } else {
      statements.delete.run(id);
    }
  } catch (error) {
    console.error('Database error in deleteStrength:', error);
    throw error;
  }
}
