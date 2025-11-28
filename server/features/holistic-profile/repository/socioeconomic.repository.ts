import getDatabase from '../../../lib/database.js';
import type { StudentSocioeconomic } from '../../../../shared/types.js';

let statements: any = null;
let isInitialized = false;

function ensureInitialized(): void {
  if (isInitialized && statements) return;
  
  const db = getDatabase();
  
  statements = {
    getByStudent: db.prepare('SELECT * FROM student_socioeconomic WHERE studentId = ? ORDER BY assessmentDate DESC'),
    getLatestByStudent: db.prepare('SELECT * FROM student_socioeconomic WHERE studentId = ? ORDER BY assessmentDate DESC LIMIT 1'),
    getById: db.prepare('SELECT * FROM student_socioeconomic WHERE id = ?'),
    insert: db.prepare(`
      INSERT INTO student_socioeconomic (
        id, studentId, assessmentDate, familyIncomeLevel, parentEmploymentStatus, motherEducationLevel,
        fatherEducationLevel, householdSize, numberOfSiblings, birthOrder, housingType, housingCondition,
        studySpaceAvailability, internetAccess, deviceAccess, schoolResourcesUsage, financialBarriers,
        resourcesAndSupports, scholarshipsOrAid, materialNeeds, nutritionStatus, transportationToSchool,
        extracurricularAccessibility, culturalCapital, socialCapital, communitySupport, economicStressors,
        familyFinancialStability, workResponsibilities, caregivingResponsibilities, notes,
        confidentialityLevel, assessedBy
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `),
    delete: db.prepare('DELETE FROM student_socioeconomic WHERE id = ?'),
    deleteBySchool: db.prepare('DELETE FROM student_socioeconomic WHERE id = ? AND studentId IN (SELECT id FROM students WHERE school_id = ?)')
  };
  
  isInitialized = true;
}

export function getSocioeconomicByStudent(studentId: string): StudentSocioeconomic[] {
  try {
    ensureInitialized();
    return statements.getByStudent.all(studentId) as StudentSocioeconomic[];
  } catch (error) {
    console.error('Database error in getSocioeconomicByStudent:', error);
    throw error;
  }
}

export function getLatestSocioeconomicByStudent(studentId: string): StudentSocioeconomic | null {
  try {
    ensureInitialized();
    const result = statements.getLatestByStudent.get(studentId);
    return result || null;
  } catch (error) {
    console.error('Database error in getLatestSocioeconomicByStudent:', error);
    throw error;
  }
}

export function getSocioeconomicById(id: string): StudentSocioeconomic | null {
  try {
    ensureInitialized();
    const result = statements.getById.get(id);
    return result || null;
  } catch (error) {
    console.error('Database error in getSocioeconomicById:', error);
    throw error;
  }
}

export function insertSocioeconomic(socioeconomic: StudentSocioeconomic): void {
  try {
    ensureInitialized();
    statements.insert.run(
      socioeconomic.id,
      socioeconomic.studentId,
      socioeconomic.assessmentDate,
      socioeconomic.familyIncomeLevel || null,
      socioeconomic.parentEmploymentStatus || null,
      socioeconomic.motherEducationLevel || null,
      socioeconomic.fatherEducationLevel || null,
      socioeconomic.householdSize || null,
      socioeconomic.numberOfSiblings || null,
      socioeconomic.birthOrder || null,
      socioeconomic.housingType || null,
      socioeconomic.housingCondition || null,
      socioeconomic.studySpaceAvailability || null,
      socioeconomic.internetAccess || null,
      socioeconomic.deviceAccess || null,
      socioeconomic.schoolResourcesUsage || null,
      socioeconomic.financialBarriers || null,
      socioeconomic.resourcesAndSupports || null,
      socioeconomic.scholarshipsOrAid || null,
      socioeconomic.materialNeeds || null,
      socioeconomic.nutritionStatus || null,
      socioeconomic.transportationToSchool || null,
      socioeconomic.extracurricularAccessibility || null,
      socioeconomic.culturalCapital || null,
      socioeconomic.socialCapital || null,
      socioeconomic.communitySupport || null,
      socioeconomic.economicStressors || null,
      socioeconomic.familyFinancialStability || null,
      socioeconomic.workResponsibilities || null,
      socioeconomic.caregivingResponsibilities || null,
      socioeconomic.notes || null,
      socioeconomic.confidentialityLevel || 'GİZLİ',
      socioeconomic.assessedBy || null
    );
  } catch (error) {
    console.error('Database error in insertSocioeconomic:', error);
    throw error;
  }
}

export function updateSocioeconomic(id: string, updates: Partial<StudentSocioeconomic>): void {
  try {
    ensureInitialized();
    const db = getDatabase();
    
    const allowedFields = [
      'assessmentDate', 'familyIncomeLevel', 'parentEmploymentStatus', 'motherEducationLevel',
      'fatherEducationLevel', 'householdSize', 'numberOfSiblings', 'birthOrder', 'housingType',
      'housingCondition', 'studySpaceAvailability', 'internetAccess', 'deviceAccess',
      'schoolResourcesUsage', 'financialBarriers', 'resourcesAndSupports', 'scholarshipsOrAid',
      'materialNeeds', 'nutritionStatus', 'transportationToSchool', 'extracurricularAccessibility',
      'culturalCapital', 'socialCapital', 'communitySupport', 'economicStressors',
      'familyFinancialStability', 'workResponsibilities', 'caregivingResponsibilities',
      'notes', 'confidentialityLevel', 'assessedBy'
    ];
    
    const fields = Object.keys(updates).filter(key => allowedFields.includes(key));
    
    if (fields.length > 0) {
      const setClause = fields.map(field => `${field} = ?`).join(', ');
      const values = fields.map(field => updates[field as keyof StudentSocioeconomic]);
      values.push(id);
      
      db.prepare(`UPDATE student_socioeconomic SET ${setClause}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`).run(...values);
    }
  } catch (error) {
    console.error('Database error in updateSocioeconomic:', error);
    throw error;
  }
}

export function deleteSocioeconomic(id: string, schoolId?: string): void {
  try {
    ensureInitialized();
    if (schoolId) {
      statements.deleteBySchool.run(id, schoolId);
    } else {
      statements.delete.run(id);
    }
  } catch (error) {
    console.error('Database error in deleteSocioeconomic:', error);
    throw error;
  }
}
