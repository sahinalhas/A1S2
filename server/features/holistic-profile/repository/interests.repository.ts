import getDatabase from '../../../lib/database.js';
import type { StudentInterest } from '../../../../shared/types.js';

let statements: any = null;
let isInitialized = false;

function ensureInitialized(): void {
  if (isInitialized && statements) return;
  
  const db = getDatabase();
  
  statements = {
    getByStudent: db.prepare('SELECT * FROM student_interests WHERE studentId = ? ORDER BY assessmentDate DESC'),
    getLatestByStudent: db.prepare('SELECT * FROM student_interests WHERE studentId = ? ORDER BY assessmentDate DESC LIMIT 1'),
    getById: db.prepare('SELECT * FROM student_interests WHERE id = ?'),
    insert: db.prepare(`
      INSERT INTO student_interests (
        id, studentId, assessmentDate, hobbies, passions, favoriteSubjects, leastFavoriteSubjects,
        specialTalents, creativeExpressionForms, sportsActivities, artisticActivities, musicInterests,
        technologicalInterests, readingHabits, favoriteBooks, favoriteMoviesShows, curiosityAreas,
        explorativeTopics, careerInterests, clubMemberships, volunteerWork, partTimeJobs,
        projectsUndertaken, skillsDevelopment, learningPreferences, motivationalTopics, notes, assessedBy
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `),
    delete: db.prepare('DELETE FROM student_interests WHERE id = ?'),
    deleteBySchool: db.prepare('DELETE FROM student_interests WHERE id = ? AND studentId IN (SELECT id FROM students WHERE school_id = ?)')
  };
  
  isInitialized = true;
}

export function getInterestsByStudent(studentId: string): StudentInterest[] {
  try {
    ensureInitialized();
    return statements.getByStudent.all(studentId) as StudentInterest[];
  } catch (error) {
    console.error('Database error in getInterestsByStudent:', error);
    throw error;
  }
}

export function getLatestInterestByStudent(studentId: string): StudentInterest | null {
  try {
    ensureInitialized();
    const result = statements.getLatestByStudent.get(studentId);
    return result || null;
  } catch (error) {
    console.error('Database error in getLatestInterestByStudent:', error);
    throw error;
  }
}

export function getInterestById(id: string): StudentInterest | null {
  try {
    ensureInitialized();
    const result = statements.getById.get(id);
    return result || null;
  } catch (error) {
    console.error('Database error in getInterestById:', error);
    throw error;
  }
}

export function insertInterest(interest: StudentInterest): void {
  try {
    ensureInitialized();
    statements.insert.run(
      interest.id,
      interest.studentId,
      interest.assessmentDate,
      interest.hobbies || null,
      interest.passions || null,
      interest.favoriteSubjects || null,
      interest.leastFavoriteSubjects || null,
      interest.specialTalents || null,
      interest.creativeExpressionForms || null,
      interest.sportsActivities || null,
      interest.artisticActivities || null,
      interest.musicInterests || null,
      interest.technologicalInterests || null,
      interest.readingHabits || null,
      interest.favoriteBooks || null,
      interest.favoriteMoviesShows || null,
      interest.curiosityAreas || null,
      interest.explorativeTopics || null,
      interest.careerInterests || null,
      interest.clubMemberships || null,
      interest.volunteerWork || null,
      interest.partTimeJobs || null,
      interest.projectsUndertaken || null,
      interest.skillsDevelopment || null,
      interest.learningPreferences || null,
      interest.motivationalTopics || null,
      interest.notes || null,
      interest.assessedBy || null
    );
  } catch (error) {
    console.error('Database error in insertInterest:', error);
    throw error;
  }
}

export function updateInterest(id: string, updates: Partial<StudentInterest>): void {
  try {
    ensureInitialized();
    const db = getDatabase();
    
    const allowedFields = [
      'assessmentDate', 'hobbies', 'passions', 'favoriteSubjects', 'leastFavoriteSubjects',
      'specialTalents', 'creativeExpressionForms', 'sportsActivities', 'artisticActivities',
      'musicInterests', 'technologicalInterests', 'readingHabits', 'favoriteBooks',
      'favoriteMoviesShows', 'curiosityAreas', 'explorativeTopics', 'careerInterests',
      'clubMemberships', 'volunteerWork', 'partTimeJobs', 'projectsUndertaken',
      'skillsDevelopment', 'learningPreferences', 'motivationalTopics', 'notes', 'assessedBy'
    ];
    
    const fields = Object.keys(updates).filter(key => allowedFields.includes(key));
    
    if (fields.length > 0) {
      const setClause = fields.map(field => `${field} = ?`).join(', ');
      const values = fields.map(field => updates[field as keyof StudentInterest]);
      values.push(id);
      
      db.prepare(`UPDATE student_interests SET ${setClause}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`).run(...values);
    }
  } catch (error) {
    console.error('Database error in updateInterest:', error);
    throw error;
  }
}

export function deleteInterest(id: string, schoolId?: string): void {
  try {
    ensureInitialized();
    if (schoolId) {
      statements.deleteBySchool.run(id, schoolId);
    } else {
      statements.delete.run(id);
    }
  } catch (error) {
    console.error('Database error in deleteInterest:', error);
    throw error;
  }
}
