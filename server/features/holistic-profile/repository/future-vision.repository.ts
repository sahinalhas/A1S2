import getDatabase from '../../../lib/database.js';
import type { StudentFutureVision } from '../../../../shared/types.js';

let statements: any = null;
let isInitialized = false;

function ensureInitialized(): void {
  if (isInitialized && statements) return;
  
  const db = getDatabase();
  
  statements = {
    getByStudent: db.prepare('SELECT * FROM student_future_vision WHERE studentId = ? ORDER BY assessmentDate DESC'),
    getLatestByStudent: db.prepare('SELECT * FROM student_future_vision WHERE studentId = ? ORDER BY assessmentDate DESC LIMIT 1'),
    getById: db.prepare('SELECT * FROM student_future_vision WHERE id = ?'),
    insert: db.prepare(`
      INSERT INTO student_future_vision (
        id, studentId, assessmentDate, shortTermGoals, longTermGoals, careerAspirations, dreamJob,
        educationalGoals, universityPreferences, majorPreferences, lifeGoals, personalDreams,
        fearsAndConcerns, perceivedBarriers, motivationSources, motivationLevel, selfEfficacyLevel,
        growthMindset, futureOrientation, roleModels, inspirationSources, valuesAndPriorities,
        planningAbility, timeManagementSkills, decisionMakingStyle, riskTakingTendency,
        actionSteps, progressTracking, notes, assessedBy
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `),
    delete: db.prepare('DELETE FROM student_future_vision WHERE id = ?'),
    deleteBySchool: db.prepare('DELETE FROM student_future_vision WHERE id = ? AND studentId IN (SELECT id FROM students WHERE school_id = ?)')
  };
  
  isInitialized = true;
}

export function getFutureVisionByStudent(studentId: string): StudentFutureVision[] {
  try {
    ensureInitialized();
    return statements.getByStudent.all(studentId) as StudentFutureVision[];
  } catch (error) {
    console.error('Database error in getFutureVisionByStudent:', error);
    throw error;
  }
}

export function getLatestFutureVisionByStudent(studentId: string): StudentFutureVision | null {
  try {
    ensureInitialized();
    const result = statements.getLatestByStudent.get(studentId);
    return result || null;
  } catch (error) {
    console.error('Database error in getLatestFutureVisionByStudent:', error);
    throw error;
  }
}

export function getFutureVisionById(id: string): StudentFutureVision | null {
  try {
    ensureInitialized();
    const result = statements.getById.get(id);
    return result || null;
  } catch (error) {
    console.error('Database error in getFutureVisionById:', error);
    throw error;
  }
}

export function insertFutureVision(vision: StudentFutureVision): void {
  try {
    ensureInitialized();
    statements.insert.run(
      vision.id,
      vision.studentId,
      vision.assessmentDate,
      vision.shortTermGoals || null,
      vision.longTermGoals || null,
      vision.careerAspirations || null,
      vision.dreamJob || null,
      vision.educationalGoals || null,
      vision.universityPreferences || null,
      vision.majorPreferences || null,
      vision.lifeGoals || null,
      vision.personalDreams || null,
      vision.fearsAndConcerns || null,
      vision.perceivedBarriers || null,
      vision.motivationSources || null,
      vision.motivationLevel || null,
      vision.selfEfficacyLevel || null,
      vision.growthMindset || null,
      vision.futureOrientation || null,
      vision.roleModels || null,
      vision.inspirationSources || null,
      vision.valuesAndPriorities || null,
      vision.planningAbility || null,
      vision.timeManagementSkills || null,
      vision.decisionMakingStyle || null,
      vision.riskTakingTendency || null,
      vision.actionSteps || null,
      vision.progressTracking || null,
      vision.notes || null,
      vision.assessedBy || null
    );
  } catch (error) {
    console.error('Database error in insertFutureVision:', error);
    throw error;
  }
}

export function updateFutureVision(id: string, updates: Partial<StudentFutureVision>): void {
  try {
    ensureInitialized();
    const db = getDatabase();
    
    const allowedFields = [
      'assessmentDate', 'shortTermGoals', 'longTermGoals', 'careerAspirations', 'dreamJob',
      'educationalGoals', 'universityPreferences', 'majorPreferences', 'lifeGoals', 'personalDreams',
      'fearsAndConcerns', 'perceivedBarriers', 'motivationSources', 'motivationLevel',
      'selfEfficacyLevel', 'growthMindset', 'futureOrientation', 'roleModels', 'inspirationSources',
      'valuesAndPriorities', 'planningAbility', 'timeManagementSkills', 'decisionMakingStyle',
      'riskTakingTendency', 'actionSteps', 'progressTracking', 'notes', 'assessedBy'
    ];
    
    const fields = Object.keys(updates).filter(key => allowedFields.includes(key));
    
    if (fields.length > 0) {
      const setClause = fields.map(field => `${field} = ?`).join(', ');
      const values = fields.map(field => updates[field as keyof StudentFutureVision]);
      values.push(id);
      
      db.prepare(`UPDATE student_future_vision SET ${setClause}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`).run(...values);
    }
  } catch (error) {
    console.error('Database error in updateFutureVision:', error);
    throw error;
  }
}

export function deleteFutureVision(id: string, schoolId?: string): void {
  try {
    ensureInitialized();
    if (schoolId) {
      statements.deleteBySchool.run(id, schoolId);
    } else {
      statements.delete.run(id);
    }
  } catch (error) {
    console.error('Database error in deleteFutureVision:', error);
    throw error;
  }
}
