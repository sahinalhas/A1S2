import getDatabase from '../../../lib/database.js';
import type { CounselingFollowUp } from '../types/counseling-sessions.types.js';
import type { Statement } from 'better-sqlite3';

let statements: Record<string, Statement> | null = null;
let isInitialized = false;

function ensureInitialized(): void {
  if (isInitialized && statements) return;
  
  const db = getDatabase();
  
  statements = {
    getAllFollowUps: db.prepare(`
      SELECT * FROM counseling_follow_ups 
      ORDER BY followUpDate DESC
    `),
    getFollowUpById: db.prepare('SELECT * FROM counseling_follow_ups WHERE id = ?'),
    getFollowUpsBySessionId: db.prepare(`
      SELECT * FROM counseling_follow_ups 
      WHERE sessionId = ?
      ORDER BY followUpDate DESC
    `),
    getFollowUpsByStatus: db.prepare(`
      SELECT * FROM counseling_follow_ups 
      WHERE status = ?
      ORDER BY followUpDate DESC
    `),
    getFollowUpsByAssignee: db.prepare(`
      SELECT * FROM counseling_follow_ups 
      WHERE assignedTo = ?
      ORDER BY followUpDate DESC
    `),
    getOverdueFollowUps: db.prepare(`
      SELECT * FROM counseling_follow_ups 
      WHERE status != 'completed' AND followUpDate < ?
      ORDER BY priority DESC, followUpDate ASC
    `),
    getFollowUpsByPriority: db.prepare(`
      SELECT * FROM counseling_follow_ups 
      WHERE priority = ? AND status != 'completed'
      ORDER BY followUpDate ASC
    `),
    insertFollowUp: db.prepare(`
      INSERT INTO counseling_follow_ups (
        id, sessionId, followUpDate, assignedTo, priority,
        status, actionItems, notes, completedDate
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `),
    updateFollowUp: db.prepare(`
      UPDATE counseling_follow_ups 
      SET sessionId = ?, followUpDate = ?, assignedTo = ?, priority = ?,
          status = ?, actionItems = ?, notes = ?, completedDate = ?,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `),
    updateFollowUpStatus: db.prepare(`
      UPDATE counseling_follow_ups 
      SET status = ?, completedDate = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `),
    deleteFollowUp: db.prepare('DELETE FROM counseling_follow_ups WHERE id = ?'),
    deleteFollowUpBySchool: db.prepare(`
      DELETE FROM counseling_follow_ups 
      WHERE id = ? AND sessionId IN (
        SELECT id FROM counseling_sessions WHERE school_id = ?
      )
    `)
  };
  
  isInitialized = true;
}

export function getAllFollowUps(): CounselingFollowUp[] {
  ensureInitialized();
  return statements!.getAllFollowUps.all() as CounselingFollowUp[];
}

export function getFollowUpById(id: string): CounselingFollowUp | null {
  ensureInitialized();
  return statements!.getFollowUpById.get(id) as CounselingFollowUp | null;
}

export function getFollowUpsBySessionId(sessionId: string): CounselingFollowUp[] {
  ensureInitialized();
  return statements!.getFollowUpsBySessionId.all(sessionId) as CounselingFollowUp[];
}

export function getFollowUpsByStatus(status: string): CounselingFollowUp[] {
  ensureInitialized();
  return statements!.getFollowUpsByStatus.all(status) as CounselingFollowUp[];
}

export function getFollowUpsByAssignee(assignedTo: string): CounselingFollowUp[] {
  ensureInitialized();
  return statements!.getFollowUpsByAssignee.all(assignedTo) as CounselingFollowUp[];
}

export function getOverdueFollowUps(currentDate: string): CounselingFollowUp[] {
  ensureInitialized();
  return statements!.getOverdueFollowUps.all(currentDate) as CounselingFollowUp[];
}

export function getFollowUpsByPriority(priority: string): CounselingFollowUp[] {
  ensureInitialized();
  return statements!.getFollowUpsByPriority.all(priority) as CounselingFollowUp[];
}

export function insertFollowUp(followUp: CounselingFollowUp): void {
  ensureInitialized();
  statements!.insertFollowUp.run(
    followUp.id,
    followUp.sessionId || null,
    followUp.followUpDate,
    followUp.assignedTo,
    followUp.priority,
    followUp.status,
    followUp.actionItems,
    followUp.notes || null,
    followUp.completedDate || null
  );
}

export function updateFollowUp(followUp: CounselingFollowUp): { changes: number } {
  ensureInitialized();
  const result = statements!.updateFollowUp.run(
    followUp.sessionId || null,
    followUp.followUpDate,
    followUp.assignedTo,
    followUp.priority,
    followUp.status,
    followUp.actionItems,
    followUp.notes || null,
    followUp.completedDate || null,
    followUp.id
  );
  return { changes: result.changes };
}

export function updateFollowUpStatus(id: string, status: string, completedDate: string | null): { changes: number } {
  ensureInitialized();
  const result = statements!.updateFollowUpStatus.run(status, completedDate || null, id);
  return { changes: result.changes };
}

export function deleteFollowUp(id: string, schoolId?: string): { changes: number } {
  ensureInitialized();
  const result = schoolId 
    ? statements!.deleteFollowUpBySchool.run(id, schoolId)
    : statements!.deleteFollowUp.run(id);
  return { changes: result.changes };
}
