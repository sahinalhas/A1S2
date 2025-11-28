import * as repository from '../repository/sessions.repository.js';
import { sanitizeString } from '../../../middleware/validation.js';
import type { StudySession } from '../types/sessions.types.js';

export function validateStudySession(session: any): { valid: boolean; error?: string } {
  if (!session || typeof session !== 'object') {
    return { valid: false, error: 'Geçersiz çalışma oturumu verisi' };
  }
  
  if (!session.id || !session.studentId || !session.topicId || !session.startTime) {
    return { valid: false, error: 'id, studentId, topicId, and startTime are required' };
  }
  
  return { valid: true };
}

export function getStudentSessions(studentId: string): StudySession[] {
  if (!studentId || typeof studentId !== 'string') {
    throw new Error('studentId is required');
  }
  
  const sanitizedId = sanitizeString(studentId);
  return repository.getStudySessionsByStudent(sanitizedId);
}

export function createStudySession(data: any): { success: boolean } {
  const validation = validateStudySession(data);
  if (!validation.valid) {
    throw new Error(validation.error);
  }
  
  const session: StudySession = {
    id: data.id,
    studentId: sanitizeString(data.studentId),
    topicId: sanitizeString(data.topicId),
    startTime: data.startTime,
    endTime: data.endTime,
    duration: data.duration,
    notes: data.notes ? sanitizeString(data.notes) : undefined,
    efficiency: data.efficiency
  };
  
  repository.insertStudySession(session);
  return { success: true };
}
