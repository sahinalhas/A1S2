import getDatabase from '../../../lib/database/index.js';
import type { BehaviorIncident, BehaviorStats } from '../types/behavior.types.js';

export function getBehaviorIncidentsByStudent(studentId: string): BehaviorIncident[] {
  const db = getDatabase();
  const stmt = db.prepare(`
    SELECT * FROM behavior_incidents 
    WHERE studentId = ? 
    ORDER BY incidentDate DESC, incidentTime DESC
  `);
  return stmt.all(studentId) as BehaviorIncident[];
}

export function getBehaviorIncidentsByDateRange(
  studentId: string,
  startDate?: string,
  endDate?: string
): BehaviorIncident[] {
  const db = getDatabase();
  let query = 'SELECT * FROM behavior_incidents WHERE studentId = ?';
  const params: (string | undefined)[] = [studentId];

  if (startDate) {
    query += ' AND incidentDate >= ?';
    params.push(startDate);
  }

  if (endDate) {
    query += ' AND incidentDate <= ?';
    params.push(endDate);
  }

  query += ' ORDER BY incidentDate DESC, incidentTime DESC';

  const stmt = db.prepare(query);
  return stmt.all(...params) as BehaviorIncident[];
}

export function getBehaviorStatsByStudent(studentId: string): BehaviorStats {
  const db = getDatabase();
  
  const overallStmt = db.prepare(`
    SELECT 
      COUNT(*) as totalIncidents,
      SUM(CASE WHEN intensity IN ('Ciddi', 'Çok Ciddi') THEN 1 ELSE 0 END) as seriousCount,
      SUM(CASE WHEN behaviorCategory = 'Olumlu' THEN 1 ELSE 0 END) as positiveCount
    FROM behavior_incidents 
    WHERE studentId = ?
  `);
  
  const categoryStmt = db.prepare(`
    SELECT behaviorCategory, COUNT(*) as count
    FROM behavior_incidents
    WHERE studentId = ?
    GROUP BY behaviorCategory
  `);
  
  const overallStats = overallStmt.get(studentId) as { totalIncidents: number; seriousCount: number; positiveCount: number } | undefined;
  const categoryData = categoryStmt.all(studentId) as Array<{ behaviorCategory: string; count: number }>;
  
  const categoryBreakdown: Record<string, number> = {};
  categoryData.forEach((row) => {
    categoryBreakdown[row.behaviorCategory] = row.count;
  });
  
  return {
    overallStats: {
      totalIncidents: overallStats?.totalIncidents || 0,
      seriousCount: overallStats?.seriousCount || 0,
      positiveCount: overallStats?.positiveCount || 0,
    },
    categoryBreakdown,
  };
}

export function insertBehaviorIncident(incident: BehaviorIncident): void {
  const db = getDatabase();
  const stmt = db.prepare(`
    INSERT INTO behavior_incidents (
      id, studentId, incidentDate, incidentTime, location, 
      behaviorType, behaviorCategory, description, antecedent,
      consequence, duration, intensity, frequency, witnessedBy,
      othersInvolved, interventionUsed, interventionEffectiveness,
      parentNotified, parentNotificationMethod, parentResponse,
      followUpRequired, followUpDate, followUpNotes, adminNotified,
      consequenceGiven, supportProvided, triggerAnalysis, patternNotes,
      positiveAlternative, status, recordedBy, notes
    ) VALUES (
      ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,
      ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
    )
  `);

  stmt.run(
    incident.id,
    incident.studentId,
    incident.incidentDate,
    incident.incidentTime,
    incident.location,
    incident.behaviorType,
    incident.behaviorCategory,
    incident.description,
    incident.antecedent || null,
    incident.consequence || null,
    incident.duration || null,
    incident.intensity || null,
    incident.frequency || null,
    incident.witnessedBy || null,
    incident.othersInvolved || null,
    incident.interventionUsed || null,
    incident.interventionEffectiveness || null,
    incident.parentNotified ? 1 : 0,
    incident.parentNotificationMethod || null,
    incident.parentResponse || null,
    incident.followUpRequired ? 1 : 0,
    incident.followUpDate || null,
    incident.followUpNotes || null,
    incident.adminNotified ? 1 : 0,
    incident.consequenceGiven || null,
    incident.supportProvided || null,
    incident.triggerAnalysis || null,
    incident.patternNotes || null,
    incident.positiveAlternative || null,
    incident.status,
    incident.recordedBy,
    incident.notes || null
  );
}

export function updateBehaviorIncident(id: string, updates: Partial<BehaviorIncident>): void {
  const db = getDatabase();
  const fields = Object.keys(updates)
    .filter(key => key !== 'id')
    .map(key => `${key} = ?`)
    .join(', ');
  
  const values = Object.entries(updates)
    .filter(([key]) => key !== 'id')
    .map(([_, value]) => value);
  
  const stmt = db.prepare(`UPDATE behavior_incidents SET ${fields} WHERE id = ?`);
  stmt.run(...values, id);
}

export function deleteBehaviorIncident(id: string, schoolId?: string): void {
  const db = getDatabase();
  if (schoolId) {
    const stmt = db.prepare(`
      DELETE FROM behavior_incidents 
      WHERE id = ? AND studentId IN (
        SELECT id FROM students WHERE school_id = ?
      )
    `);
    stmt.run(id, schoolId);
  } else {
    const stmt = db.prepare('DELETE FROM behavior_incidents WHERE id = ?');
    stmt.run(id);
  }
}
