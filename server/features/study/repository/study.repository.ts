import getDatabase from '../../../lib/database.js';
import type { StudyAssignment, WeeklySlot, PlannedTopic } from '../types/study.types.js';

let statements: any = null;
let isInitialized = false;

function ensureInitialized(): void {
  if (isInitialized && statements) return;
  
  const db = getDatabase();
  
  statements = {
    getStudyAssignmentsByStudent: db.prepare('SELECT * FROM study_assignments WHERE studentId = ? ORDER BY dueDate'),
    insertStudyAssignment: db.prepare(`
      INSERT INTO study_assignments (id, studentId, topicId, dueDate, status, notes)
      VALUES (?, ?, ?, ?, ?, ?)
    `),
    updateStudyAssignment: db.prepare(`
      UPDATE study_assignments SET status = ?, notes = ?
      WHERE id = ?
    `),
    deleteStudyAssignment: db.prepare('DELETE FROM study_assignments WHERE id = ?'),
    getAllWeeklySlots: db.prepare('SELECT * FROM weekly_slots ORDER BY day, startTime'),
    getWeeklySlotsByStudent: db.prepare('SELECT * FROM weekly_slots WHERE studentId = ? ORDER BY day, startTime'),
    insertWeeklySlot: db.prepare(`
      INSERT INTO weekly_slots (id, studentId, day, startTime, endTime, subjectId)
      VALUES (?, ?, ?, ?, ?, ?)
    `),
    updateWeeklySlot: db.prepare(`
      UPDATE weekly_slots SET day = ?, startTime = ?, endTime = ?, subjectId = ?
      WHERE id = ?
    `),
    deleteWeeklySlot: db.prepare('DELETE FROM weekly_slots WHERE id = ?'),
    getPlannedTopics: db.prepare('SELECT * FROM planned_topics WHERE studentId = ? AND weekStartDate = ? ORDER BY date, start'),
    insertPlannedTopic: db.prepare(`
      INSERT OR REPLACE INTO planned_topics (id, studentId, weekStartDate, date, start, end, subjectId, topicId, allocated, remainingAfter, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    `),
    deletePlannedTopicsByWeek: db.prepare('DELETE FROM planned_topics WHERE studentId = ? AND weekStartDate = ?'),
  };
  
  isInitialized = true;
}

export function getStudyAssignmentsByStudent(studentId: string): StudyAssignment[] {
  try {
    ensureInitialized();
    return statements.getStudyAssignmentsByStudent.all(studentId) as StudyAssignment[];
  } catch (error) {
    console.error('Database error in getStudyAssignmentsByStudent:', error);
    return [];
  }
}

export function insertStudyAssignment(
  id: string,
  studentId: string,
  topicId: string,
  dueDate: string,
  status: string,
  notes: string | null
): void {
  try {
    ensureInitialized();
    statements.insertStudyAssignment.run(id, studentId, topicId, dueDate, status, notes);
  } catch (error) {
    console.error('Error inserting study assignment:', error);
    throw error;
  }
}

export function updateStudyAssignment(id: string, status: string, notes: string | null): void {
  try {
    ensureInitialized();
    statements.updateStudyAssignment.run(status, notes, id);
  } catch (error) {
    console.error('Error updating study assignment:', error);
    throw error;
  }
}

export function deleteStudyAssignment(id: string): void {
  try {
    ensureInitialized();
    statements.deleteStudyAssignment.run(id);
  } catch (error) {
    console.error('Error deleting study assignment:', error);
    throw error;
  }
}

export function getAllWeeklySlots(): WeeklySlot[] {
  try {
    ensureInitialized();
    return statements.getAllWeeklySlots.all() as WeeklySlot[];
  } catch (error) {
    console.error('Database error in getAllWeeklySlots:', error);
    return [];
  }
}

export function getWeeklySlotsByStudent(studentId: string): WeeklySlot[] {
  try {
    ensureInitialized();
    return statements.getWeeklySlotsByStudent.all(studentId) as WeeklySlot[];
  } catch (error) {
    console.error('Database error in getWeeklySlotsByStudent:', error);
    return [];
  }
}

export function insertWeeklySlot(
  id: string,
  studentId: string,
  day: number,
  startTime: string,
  endTime: string,
  subjectId: string
): void {
  try {
    ensureInitialized();
    statements.insertWeeklySlot.run(id, studentId, day, startTime, endTime, subjectId);
  } catch (error) {
    console.error('Error inserting weekly slot:', error);
    throw error;
  }
}

export function updateWeeklySlot(
  id: string,
  day: number,
  startTime: string,
  endTime: string,
  subjectId: string
): void {
  try {
    ensureInitialized();
    statements.updateWeeklySlot.run(day, startTime, endTime, subjectId, id);
  } catch (error) {
    console.error('Error updating weekly slot:', error);
    throw error;
  }
}

export function deleteWeeklySlot(id: string): void {
  try {
    ensureInitialized();
    statements.deleteWeeklySlot.run(id);
  } catch (error) {
    console.error('Error deleting weekly slot:', error);
    throw error;
  }
}

export function getPlannedTopics(studentId: string, weekStartDate: string): PlannedTopic[] {
  try {
    ensureInitialized();
    return statements.getPlannedTopics.all(studentId, weekStartDate) as PlannedTopic[];
  } catch (error) {
    console.error('Error getting planned topics:', error);
    return [];
  }
}

export function insertPlannedTopics(topics: PlannedTopic[]): void {
  try {
    ensureInitialized();
    const insert = statements.insertPlannedTopic;
    for (const t of topics) {
      insert.run(t.id, t.studentId, t.weekStartDate, t.date, t.start, t.end, t.subjectId, t.topicId, t.allocated, t.remainingAfter);
    }
  } catch (error) {
    console.error('Error inserting planned topics:', error);
    throw error;
  }
}

export function deletePlannedTopicsByWeek(studentId: string, weekStartDate: string): void {
  try {
    ensureInitialized();
    statements.deletePlannedTopicsByWeek.run(studentId, weekStartDate);
  } catch (error) {
    console.error('Error deleting planned topics:', error);
    throw error;
  }
}
