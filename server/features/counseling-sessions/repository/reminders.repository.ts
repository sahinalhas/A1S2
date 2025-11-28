import getDatabase from '../../../lib/database.js';
import type { CounselingReminder } from '../types/counseling-sessions.types.js';
import type { Statement } from 'better-sqlite3';

let statements: Record<string, Statement> | null = null;
let isInitialized = false;

function ensureInitialized(): void {
  if (isInitialized && statements) return;
  
  const db = getDatabase();
  
  statements = {
    getAllReminders: db.prepare(`
      SELECT * FROM counseling_reminders 
      ORDER BY reminderDate DESC, reminderTime DESC
    `),
    getReminderById: db.prepare('SELECT * FROM counseling_reminders WHERE id = ?'),
    getRemindersBySessionId: db.prepare(`
      SELECT * FROM counseling_reminders 
      WHERE sessionId = ?
      ORDER BY reminderDate DESC, reminderTime DESC
    `),
    getRemindersByStatus: db.prepare(`
      SELECT * FROM counseling_reminders 
      WHERE status = ?
      ORDER BY reminderDate DESC, reminderTime DESC
    `),
    getPendingReminders: db.prepare(`
      SELECT * FROM counseling_reminders 
      WHERE status = 'pending' AND reminderDate <= ?
      ORDER BY reminderDate ASC, reminderTime ASC
    `),
    insertReminder: db.prepare(`
      INSERT INTO counseling_reminders (
        id, sessionId, reminderType, reminderDate, reminderTime,
        title, description, studentIds, status, notificationSent
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `),
    updateReminder: db.prepare(`
      UPDATE counseling_reminders 
      SET sessionId = ?, reminderType = ?, reminderDate = ?, reminderTime = ?,
          title = ?, description = ?, studentIds = ?, status = ?,
          notificationSent = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `),
    updateReminderStatus: db.prepare(`
      UPDATE counseling_reminders 
      SET status = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `),
    markNotificationSent: db.prepare(`
      UPDATE counseling_reminders 
      SET notificationSent = 1, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `),
    deleteReminder: db.prepare('DELETE FROM counseling_reminders WHERE id = ?'),
    deleteReminderBySchool: db.prepare(`
      DELETE FROM counseling_reminders 
      WHERE id = ? AND sessionId IN (
        SELECT id FROM counseling_sessions WHERE school_id = ?
      )
    `)
  };
  
  isInitialized = true;
}

export function getAllReminders(): CounselingReminder[] {
  ensureInitialized();
  return statements!.getAllReminders.all() as CounselingReminder[];
}

export function getReminderById(id: string): CounselingReminder | null {
  ensureInitialized();
  return statements!.getReminderById.get(id) as CounselingReminder | null;
}

export function getRemindersBySessionId(sessionId: string): CounselingReminder[] {
  ensureInitialized();
  return statements!.getRemindersBySessionId.all(sessionId) as CounselingReminder[];
}

export function getRemindersByStatus(status: string): CounselingReminder[] {
  ensureInitialized();
  return statements!.getRemindersByStatus.all(status) as CounselingReminder[];
}

export function getPendingReminders(currentDate: string): CounselingReminder[] {
  ensureInitialized();
  return statements!.getPendingReminders.all(currentDate) as CounselingReminder[];
}

export function insertReminder(reminder: CounselingReminder): void {
  ensureInitialized();
  statements!.insertReminder.run(
    reminder.id,
    reminder.sessionId || null,
    reminder.reminderType,
    reminder.reminderDate,
    reminder.reminderTime,
    reminder.title,
    reminder.description || null,
    reminder.studentIds || null,
    reminder.status,
    reminder.notificationSent ? 1 : 0
  );
}

export function updateReminder(reminder: CounselingReminder): { changes: number } {
  ensureInitialized();
  const result = statements!.updateReminder.run(
    reminder.sessionId || null,
    reminder.reminderType,
    reminder.reminderDate,
    reminder.reminderTime,
    reminder.title,
    reminder.description || null,
    reminder.studentIds || null,
    reminder.status,
    reminder.notificationSent ? 1 : 0,
    reminder.id
  );
  return { changes: result.changes };
}

export function updateReminderStatus(id: string, status: string): { changes: number } {
  ensureInitialized();
  const result = statements!.updateReminderStatus.run(status, id);
  return { changes: result.changes };
}

export function markNotificationSent(id: string): { changes: number } {
  ensureInitialized();
  const result = statements!.markNotificationSent.run(id);
  return { changes: result.changes };
}

export function deleteReminder(id: string, schoolId?: string): { changes: number } {
  ensureInitialized();
  const result = schoolId 
    ? statements!.deleteReminderBySchool.run(id, schoolId)
    : statements!.deleteReminder.run(id);
  return { changes: result.changes };
}
