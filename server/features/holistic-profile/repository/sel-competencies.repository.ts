import getDatabase from '../../../lib/database.js';
import type { StudentSELCompetency } from '../../../../shared/types.js';

let statements: any = null;
let isInitialized = false;

function ensureInitialized(): void {
  if (isInitialized && statements) return;
  
  const db = getDatabase();
  
  statements = {
    getByStudent: db.prepare('SELECT * FROM student_sel_competencies WHERE studentId = ? ORDER BY assessmentDate DESC'),
    getLatestByStudent: db.prepare('SELECT * FROM student_sel_competencies WHERE studentId = ? ORDER BY assessmentDate DESC LIMIT 1'),
    getById: db.prepare('SELECT * FROM student_sel_competencies WHERE id = ?'),
    insert: db.prepare(`
      INSERT INTO student_sel_competencies (
        id, studentId, assessmentDate, selfAwarenessLevel, emotionRecognition, emotionExpression,
        emotionRegulation, empathyLevel, socialAwareness, perspectiveTaking, relationshipSkills,
        cooperationSkills, communicationSkills, conflictManagement, problemSolvingApproach,
        problemSolvingSkills, decisionMakingSkills, responsibleDecisionMaking, selfManagement,
        impulseControl, stressCoping, stressManagementStrategies, resilienceLevel, adaptability,
        goalSetting, selfMotivation, optimismLevel, mindfulnessEngagement, notes, assessedBy
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `),
    delete: db.prepare('DELETE FROM student_sel_competencies WHERE id = ?'),
    deleteBySchool: db.prepare('DELETE FROM student_sel_competencies WHERE id = ? AND studentId IN (SELECT id FROM students WHERE school_id = ?)')
  };
  
  isInitialized = true;
}

export function getSELCompetenciesByStudent(studentId: string): StudentSELCompetency[] {
  try {
    ensureInitialized();
    return statements.getByStudent.all(studentId) as StudentSELCompetency[];
  } catch (error) {
    console.error('Database error in getSELCompetenciesByStudent:', error);
    throw error;
  }
}

export function getLatestSELCompetencyByStudent(studentId: string): StudentSELCompetency | null {
  try {
    ensureInitialized();
    const result = statements.getLatestByStudent.get(studentId);
    return result || null;
  } catch (error) {
    console.error('Database error in getLatestSELCompetencyByStudent:', error);
    throw error;
  }
}

export function getSELCompetencyById(id: string): StudentSELCompetency | null {
  try {
    ensureInitialized();
    const result = statements.getById.get(id);
    return result || null;
  } catch (error) {
    console.error('Database error in getSELCompetencyById:', error);
    throw error;
  }
}

export function insertSELCompetency(competency: StudentSELCompetency): void {
  try {
    ensureInitialized();
    statements.insert.run(
      competency.id,
      competency.studentId,
      competency.assessmentDate,
      competency.selfAwarenessLevel || null,
      competency.emotionRecognition || null,
      competency.emotionExpression || null,
      competency.emotionRegulation || null,
      competency.empathyLevel || null,
      competency.socialAwareness || null,
      competency.perspectiveTaking || null,
      competency.relationshipSkills || null,
      competency.cooperationSkills || null,
      competency.communicationSkills || null,
      competency.conflictManagement || null,
      competency.problemSolvingApproach || null,
      competency.problemSolvingSkills || null,
      competency.decisionMakingSkills || null,
      competency.responsibleDecisionMaking || null,
      competency.selfManagement || null,
      competency.impulseControl || null,
      competency.stressCoping || null,
      competency.stressManagementStrategies || null,
      competency.resilienceLevel || null,
      competency.adaptability || null,
      competency.goalSetting || null,
      competency.selfMotivation || null,
      competency.optimismLevel || null,
      competency.mindfulnessEngagement || null,
      competency.notes || null,
      competency.assessedBy || null
    );
  } catch (error) {
    console.error('Database error in insertSELCompetency:', error);
    throw error;
  }
}

export function updateSELCompetency(id: string, updates: Partial<StudentSELCompetency>): void {
  try {
    ensureInitialized();
    const db = getDatabase();
    
    const allowedFields = [
      'assessmentDate', 'selfAwarenessLevel', 'emotionRecognition', 'emotionExpression',
      'emotionRegulation', 'empathyLevel', 'socialAwareness', 'perspectiveTaking',
      'relationshipSkills', 'cooperationSkills', 'communicationSkills', 'conflictManagement',
      'problemSolvingApproach', 'problemSolvingSkills', 'decisionMakingSkills',
      'responsibleDecisionMaking', 'selfManagement', 'impulseControl', 'stressCoping',
      'stressManagementStrategies', 'resilienceLevel', 'adaptability', 'goalSetting',
      'selfMotivation', 'optimismLevel', 'mindfulnessEngagement', 'notes', 'assessedBy'
    ];
    
    const fields = Object.keys(updates).filter(key => allowedFields.includes(key));
    
    if (fields.length > 0) {
      const setClause = fields.map(field => `${field} = ?`).join(', ');
      const values = fields.map(field => updates[field as keyof StudentSELCompetency]);
      values.push(id);
      
      db.prepare(`UPDATE student_sel_competencies SET ${setClause}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`).run(...values);
    }
  } catch (error) {
    console.error('Database error in updateSELCompetency:', error);
    throw error;
  }
}

export function deleteSELCompetency(id: string, schoolId?: string): void {
  try {
    ensureInitialized();
    if (schoolId) {
      statements.deleteBySchool.run(id, schoolId);
    } else {
      statements.delete.run(id);
    }
  } catch (error) {
    console.error('Database error in deleteSELCompetency:', error);
    throw error;
  }
}
