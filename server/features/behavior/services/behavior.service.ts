import * as repository from '../repository/behavior.repository.js';
import type { BehaviorIncident, BehaviorStats } from '../types/behavior.types.js';

export function getBehaviorIncidentsByStudent(studentId: string): BehaviorIncident[] {
  return repository.getBehaviorIncidentsByStudent(studentId);
}

export function getBehaviorIncidentsByDateRange(
  studentId: string,
  startDate?: string,
  endDate?: string
): BehaviorIncident[] {
  return repository.getBehaviorIncidentsByDateRange(studentId, startDate, endDate);
}

export function getBehaviorStatsByStudent(studentId: string): BehaviorStats {
  return repository.getBehaviorStatsByStudent(studentId);
}

export function addBehaviorIncident(incident: BehaviorIncident): { success: boolean } {
  repository.insertBehaviorIncident(incident);
  return { success: true };
}

export function updateBehaviorIncident(id: string, updates: Partial<BehaviorIncident>): { success: boolean } {
  repository.updateBehaviorIncident(id, updates);
  return { success: true };
}

export function deleteBehaviorIncident(id: string): { success: boolean } {
  repository.deleteBehaviorIncident(id);
  return { success: true };
}
