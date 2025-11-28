import type Database from 'better-sqlite3';

export function createEvaluations360Table(db: Database.Database): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS evaluations_360 (
      id TEXT PRIMARY KEY,
      studentId TEXT NOT NULL,
      evaluationDate TEXT NOT NULL,
      selfEvaluation TEXT,
      teacherEvaluation TEXT,
      peerEvaluation TEXT,
      parentEvaluation TEXT,
      strengths TEXT,
      areasForImprovement TEXT,
      actionPlan TEXT,
      notes TEXT,
      evaluatorType TEXT,
      evaluatorName TEXT,
      ratings TEXT,
      comments TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (studentId) REFERENCES students (id) ON DELETE CASCADE
    );
  `);

  try {
    db.exec(`ALTER TABLE evaluations_360 ADD COLUMN selfEvaluation TEXT`);
  } catch (e) {  }
  
  try {
    db.exec(`ALTER TABLE evaluations_360 ADD COLUMN teacherEvaluation TEXT`);
  } catch (e) {  }
  
  try {
    db.exec(`ALTER TABLE evaluations_360 ADD COLUMN peerEvaluation TEXT`);
  } catch (e) {  }
  
  try {
    db.exec(`ALTER TABLE evaluations_360 ADD COLUMN parentEvaluation TEXT`);
  } catch (e) {  }
  
  try {
    db.exec(`ALTER TABLE evaluations_360 ADD COLUMN strengths TEXT`);
  } catch (e) {  }
  
  try {
    db.exec(`ALTER TABLE evaluations_360 ADD COLUMN areasForImprovement TEXT`);
  } catch (e) {  }
  
  try {
    db.exec(`ALTER TABLE evaluations_360 ADD COLUMN actionPlan TEXT`);
  } catch (e) {  }
  
  try {
    db.exec(`ALTER TABLE evaluations_360 ADD COLUMN notes TEXT`);
  } catch (e) {  }
}
