/**
 * School Statistics Repository
 * Okul Geneli İstatistikler Veri Erişim Katmanı
 */

import { getDatabase } from '../../../lib/database/connection.js';
import type { SchoolStatistics, ClassDistribution } from '../types/advanced-reports.types.js';

export function getSchoolStatistics(schoolId: string): SchoolStatistics {
  const db = getDatabase();
  
  // Total students
  const totalStudents = db.prepare('SELECT COUNT(*) as count FROM students WHERE school_id = ?').get(schoolId) as { count: number };
  
  // Total classes
  const totalClasses = db.prepare(`
    SELECT COUNT(DISTINCT class) as count 
    FROM students 
    WHERE class IS NOT NULL AND school_id = ?
  `).get(schoolId) as { count: number };
  
  // Total counselors
  const totalCounselors = db.prepare(`
    SELECT COUNT(*) as count 
    FROM users 
    WHERE role = 'counselor' AND isActive = 1 AND school_id = ?
  `).get(schoolId) as { count: number };
  
  // Total sessions
  const totalSessions = db.prepare('SELECT COUNT(*) as count FROM counseling_sessions WHERE school_id = ?').get(schoolId) as { count: number };
  
  // Risk distribution
  const riskData = db.prepare(`
    SELECT 
      SUM(CASE WHEN risk_level = 'Düşük' OR risk_level IS NULL THEN 1 ELSE 0 END) as low,
      SUM(CASE WHEN risk_level = 'Orta' THEN 1 ELSE 0 END) as medium,
      SUM(CASE WHEN risk_level = 'Yüksek' THEN 1 ELSE 0 END) as high,
      SUM(CASE WHEN risk_level = 'Kritik' THEN 1 ELSE 0 END) as critical
    FROM student_analytics_snapshot
  `).get() as any;
  
  // Class distribution
  const classDistData = db.prepare(`
    SELECT 
      class as className,
      COUNT(*) as studentCount,
      SUM(CASE WHEN gender = 'E' THEN 1 ELSE 0 END) as maleCount,
      SUM(CASE WHEN gender = 'K' THEN 1 ELSE 0 END) as femaleCount,
      AVG(CAST(JULIANDAY('now') - JULIANDAY(birthDate) AS REAL) / 365.25) as averageAge
    FROM students
    WHERE class IS NOT NULL
    GROUP BY class
    ORDER BY class
  `).all() as ClassDistribution[];
  
  // Gender distribution
  const genderData = db.prepare(`
    SELECT 
      SUM(CASE WHEN gender = 'E' THEN 1 ELSE 0 END) as male,
      SUM(CASE WHEN gender = 'K' THEN 1 ELSE 0 END) as female,
      SUM(CASE WHEN gender NOT IN ('E', 'K') OR gender IS NULL THEN 1 ELSE 0 END) as other
    FROM students
  `).get() as any;
  
  // Attendance overview
  const attendanceData = db.prepare(`
    WITH student_attendance AS (
      SELECT 
        studentId,
        COUNT(*) as total,
        SUM(CASE WHEN status = 'Var' THEN 1 ELSE 0 END) as present
      FROM attendance
      GROUP BY studentId
    )
    SELECT 
      AVG(CAST(present AS REAL) / total) as average,
      SUM(CASE WHEN CAST(present AS REAL) / total >= 0.95 THEN 1 ELSE 0 END) as excellent,
      SUM(CASE WHEN CAST(present AS REAL) / total >= 0.85 AND CAST(present AS REAL) / total < 0.95 THEN 1 ELSE 0 END) as good,
      SUM(CASE WHEN CAST(present AS REAL) / total < 0.85 THEN 1 ELSE 0 END) as poor
    FROM student_attendance
  `).get() as any;
  
  // Academic overview
  const academicData = db.prepare(`
    SELECT 
      AVG(avg_exam_score) as averageGPA,
      SUM(CASE WHEN avg_exam_score >= 85 THEN 1 ELSE 0 END) as topPerformers,
      SUM(CASE WHEN avg_exam_score < 60 THEN 1 ELSE 0 END) as needsSupport
    FROM student_analytics_snapshot
  `).get() as any;
  
  return {
    totalStudents: totalStudents.count,
    totalClasses: totalClasses.count,
    totalCounselors: totalCounselors.count,
    totalSessions: totalSessions.count,
    riskDistribution: {
      low: riskData?.low || 0,
      medium: riskData?.medium || 0,
      high: riskData?.high || 0,
      critical: riskData?.critical || 0,
    },
    classDistribution: classDistData,
    genderDistribution: {
      male: genderData?.male || 0,
      female: genderData?.female || 0,
      other: genderData?.other || 0,
    },
    attendanceOverview: {
      average: attendanceData?.average || 0,
      excellent: attendanceData?.excellent || 0,
      good: attendanceData?.good || 0,
      poor: attendanceData?.poor || 0,
    },
    academicOverview: {
      averageGPA: academicData?.averageGPA || 0,
      topPerformers: academicData?.topPerformers || 0,
      needsSupport: academicData?.needsSupport || 0,
    },
    lastUpdated: new Date().toISOString(),
  };
}

export function getClassList(): string[] {
  const db = getDatabase();
  const classes = db.prepare(`
    SELECT DISTINCT class 
    FROM students 
    WHERE class IS NOT NULL 
    ORDER BY class
  `).all() as { class: string }[];
  
  return classes.map(c => c.class);
}
