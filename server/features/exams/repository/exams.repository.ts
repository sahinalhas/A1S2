import getDatabase from '../../../lib/database.js';
import type { ExamResult, ExamProgressData } from '../types/exams.types.js';

let statements: any = null;
let isInitialized = false;

function ensureInitialized(): void {
  if (isInitialized && statements) return;
  
  const db = getDatabase();
  
  statements = {
    getExamResultsByStudent: db.prepare('SELECT * FROM exam_results WHERE studentId = ? ORDER BY examDate DESC'),
    getExamResultsByType: db.prepare('SELECT * FROM exam_results WHERE studentId = ? AND examType = ? ORDER BY examDate DESC'),
    getLatestExamResult: db.prepare('SELECT * FROM exam_results WHERE studentId = ? ORDER BY examDate DESC LIMIT 1'),
    getLatestExamResultByType: db.prepare('SELECT * FROM exam_results WHERE studentId = ? AND examType = ? ORDER BY examDate DESC LIMIT 1'),
    getExamProgressAnalysis: db.prepare(`
      SELECT examDate, examName, totalScore, totalNet, percentileRank
      FROM exam_results 
      WHERE studentId = ? AND examType = ?
      ORDER BY examDate ASC
    `),
    insertExamResult: db.prepare(`
      INSERT INTO exam_results (id, studentId, examType, examName, examDate, examProvider, totalScore,
                               percentileRank, turkishScore, mathScore, scienceScore, socialScore,
                               foreignLanguageScore, turkishNet, mathNet, scienceNet, socialNet,
                               foreignLanguageNet, totalNet, correctAnswers, wrongAnswers, emptyAnswers,
                               totalQuestions, subjectBreakdown, topicAnalysis, strengthAreas, weaknessAreas,
                               improvementSuggestions, comparedToGoal, comparedToPrevious, comparedToClassAverage,
                               schoolRank, classRank, isOfficial, certificateUrl, answerKeyUrl, detailedReportUrl,
                               goalsMet, parentNotified, counselorNotes, actionPlan, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `),
    deleteExamResult: db.prepare('DELETE FROM exam_results WHERE id = ?')
  };
  
  isInitialized = true;
}

function parseExamResult(result: any): any {
  return {
    ...result,
    subjectBreakdown: result.subjectBreakdown ? JSON.parse(result.subjectBreakdown) : null,
    topicAnalysis: result.topicAnalysis ? JSON.parse(result.topicAnalysis) : null,
    strengthAreas: result.strengthAreas ? JSON.parse(result.strengthAreas) : [],
    weaknessAreas: result.weaknessAreas ? JSON.parse(result.weaknessAreas) : []
  };
}

export function getExamResultsByStudent(studentId: string): unknown[] {
  try {
    ensureInitialized();
    const results = statements.getExamResultsByStudent.all(studentId);
    return results.map(parseExamResult);
  } catch (error) {
    console.error('Database error in getExamResultsByStudent:', error);
    throw error;
  }
}

export function getExamResultsByType(studentId: string, examType: string): unknown[] {
  try {
    ensureInitialized();
    const results = statements.getExamResultsByType.all(studentId, examType);
    return results.map(parseExamResult);
  } catch (error) {
    console.error('Database error in getExamResultsByType:', error);
    throw error;
  }
}

export function getLatestExamResult(studentId: string, examType?: string): any | null {
  try {
    ensureInitialized();
    
    let result;
    if (examType) {
      result = statements.getLatestExamResultByType.get(studentId, examType);
    } else {
      result = statements.getLatestExamResult.get(studentId);
    }
    
    if (result) {
      return parseExamResult(result);
    }
    return null;
  } catch (error) {
    console.error('Database error in getLatestExamResult:', error);
    throw error;
  }
}

export function getExamProgressAnalysis(studentId: string, examType: string): ExamProgressData[] {
  try {
    ensureInitialized();
    return statements.getExamProgressAnalysis.all(studentId, examType) as ExamProgressData[];
  } catch (error) {
    console.error('Database error in getExamProgressAnalysis:', error);
    throw error;
  }
}

export function insertExamResult(result: ExamResult): void {
  try {
    ensureInitialized();
    
    const subjectBreakdownJson = JSON.stringify(result.subjectBreakdown || null);
    const topicAnalysisJson = JSON.stringify(result.topicAnalysis || null);
    const strengthAreasJson = JSON.stringify(result.strengthAreas || []);
    const weaknessAreasJson = JSON.stringify(result.weaknessAreas || []);
    
    statements.insertExamResult.run(
      result.id,
      result.studentId,
      result.examType,
      result.examName,
      result.examDate,
      result.examProvider,
      result.totalScore,
      result.percentileRank,
      result.turkishScore,
      result.mathScore,
      result.scienceScore,
      result.socialScore,
      result.foreignLanguageScore,
      result.turkishNet,
      result.mathNet,
      result.scienceNet,
      result.socialNet,
      result.foreignLanguageNet,
      result.totalNet,
      result.correctAnswers,
      result.wrongAnswers,
      result.emptyAnswers,
      result.totalQuestions,
      subjectBreakdownJson,
      topicAnalysisJson,
      strengthAreasJson,
      weaknessAreasJson,
      result.improvementSuggestions,
      result.comparedToGoal,
      result.comparedToPrevious,
      result.comparedToClassAverage,
      result.schoolRank,
      result.classRank,
      result.isOfficial ? 1 : 0,
      result.certificateUrl,
      result.answerKeyUrl,
      result.detailedReportUrl,
      result.goalsMet ? 1 : 0,
      result.parentNotified ? 1 : 0,
      result.counselorNotes,
      result.actionPlan,
      result.notes
    );
  } catch (error) {
    console.error('Error inserting exam result:', error);
    throw error;
  }
}

export function updateExamResult(id: string, updates: any): void {
  try {
    ensureInitialized();
    const db = getDatabase();
    
    const updatesWithStringifiedArrays = { ...updates };
    if (updates.subjectBreakdown) {
      updatesWithStringifiedArrays.subjectBreakdown = JSON.stringify(updates.subjectBreakdown);
    }
    if (updates.topicAnalysis) {
      updatesWithStringifiedArrays.topicAnalysis = JSON.stringify(updates.topicAnalysis);
    }
    if (updates.strengthAreas) {
      updatesWithStringifiedArrays.strengthAreas = JSON.stringify(updates.strengthAreas);
    }
    if (updates.weaknessAreas) {
      updatesWithStringifiedArrays.weaknessAreas = JSON.stringify(updates.weaknessAreas);
    }
    if (updates.isOfficial !== undefined) {
      updatesWithStringifiedArrays.isOfficial = updates.isOfficial ? 1 : 0;
    }
    if (updates.goalsMet !== undefined) {
      updatesWithStringifiedArrays.goalsMet = updates.goalsMet ? 1 : 0;
    }
    if (updates.parentNotified !== undefined) {
      updatesWithStringifiedArrays.parentNotified = updates.parentNotified ? 1 : 0;
    }
    
    const allowedFields = ['examType', 'examName', 'examDate', 'examProvider', 'totalScore', 'percentileRank',
                          'turkishScore', 'mathScore', 'scienceScore', 'socialScore', 'foreignLanguageScore',
                          'turkishNet', 'mathNet', 'scienceNet', 'socialNet', 'foreignLanguageNet', 'totalNet',
                          'correctAnswers', 'wrongAnswers', 'emptyAnswers', 'totalQuestions', 'subjectBreakdown',
                          'topicAnalysis', 'strengthAreas', 'weaknessAreas', 'improvementSuggestions',
                          'comparedToGoal', 'comparedToPrevious', 'comparedToClassAverage', 'schoolRank',
                          'classRank', 'isOfficial', 'certificateUrl', 'answerKeyUrl', 'detailedReportUrl',
                          'goalsMet', 'parentNotified', 'counselorNotes', 'actionPlan', 'notes'];
    const fields = Object.keys(updatesWithStringifiedArrays).filter(key => allowedFields.includes(key));
    
    if (fields.length === 0) {
      throw new Error('No valid fields to update');
    }
    
    const setClause = fields.map(field => `${field} = ?`).join(', ');
    const values = fields.map(field => updatesWithStringifiedArrays[field]);
    values.push(id);
    
    db.prepare(`UPDATE exam_results SET ${setClause} WHERE id = ?`).run(...values);
  } catch (error) {
    console.error('Error updating exam result:', error);
    throw error;
  }
}

export function deleteExamResult(id: string): void {
  try {
    ensureInitialized();
    statements.deleteExamResult.run(id);
  } catch (error) {
    console.error('Error deleting exam result:', error);
    throw error;
  }
}
