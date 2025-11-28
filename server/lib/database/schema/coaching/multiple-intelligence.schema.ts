import type Database from 'better-sqlite3';

export function createMultipleIntelligenceTable(db: Database.Database): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS multiple_intelligence (
      id TEXT PRIMARY KEY,
      studentId TEXT NOT NULL,
      assessmentDate TEXT NOT NULL,
      linguisticVerbal REAL DEFAULT 0,
      logicalMathematical REAL DEFAULT 0,
      visualSpatial REAL DEFAULT 0,
      bodilyKinesthetic REAL DEFAULT 0,
      musicalRhythmic REAL DEFAULT 0,
      interpersonal REAL DEFAULT 0,
      intrapersonal REAL DEFAULT 0,
      naturalistic REAL DEFAULT 0,
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (studentId) REFERENCES students (id) ON DELETE CASCADE
    );
  `);

  try {
    db.exec(`ALTER TABLE multiple_intelligence ADD COLUMN linguisticVerbal REAL DEFAULT 0`);
  } catch (e) {  }
  
  try {
    db.exec(`ALTER TABLE multiple_intelligence ADD COLUMN visualSpatial REAL DEFAULT 0`);
  } catch (e) {  }
  
  try {
    db.exec(`ALTER TABLE multiple_intelligence ADD COLUMN naturalistic REAL DEFAULT 0`);
  } catch (e) {  }

  try {
    const hasOldColumns = db.prepare(`SELECT linguistic FROM multiple_intelligence LIMIT 1`);
    hasOldColumns.get();
    
    db.exec(`
      UPDATE multiple_intelligence 
      SET linguisticVerbal = COALESCE(linguistic, 0),
          visualSpatial = COALESCE(spatial, 0),
          naturalistic = COALESCE(naturalist, 0)
      WHERE linguisticVerbal IS NULL OR visualSpatial IS NULL OR naturalistic IS NULL
    `);
  } catch (e) {  }
}
