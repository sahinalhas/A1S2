import type Database from 'better-sqlite3';

export function createSchoolsTables(db: Database.Database): void {
  // Schools table
  db.exec(`
    CREATE TABLE IF NOT EXISTS schools (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL UNIQUE,
      code TEXT,
      address TEXT,
      phone TEXT,
      email TEXT,
      principal TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS idx_schools_name ON schools(name);
    CREATE INDEX IF NOT EXISTS idx_schools_code ON schools(code);
  `);

  // User-Schools association (many-to-many)
  db.exec(`
    CREATE TABLE IF NOT EXISTS user_schools (
      id TEXT PRIMARY KEY,
      userId TEXT NOT NULL,
      schoolId TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'counselor' CHECK(role IN ('owner', 'admin', 'counselor')),
      isDefault INTEGER DEFAULT 0,
      joinedDate DATETIME DEFAULT CURRENT_TIMESTAMP,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (userId) REFERENCES users (id) ON DELETE CASCADE,
      FOREIGN KEY (schoolId) REFERENCES schools (id) ON DELETE CASCADE,
      UNIQUE(userId, schoolId)
    );

    CREATE INDEX IF NOT EXISTS idx_user_schools_userId ON user_schools(userId);
    CREATE INDEX IF NOT EXISTS idx_user_schools_schoolId ON user_schools(schoolId);
  `);
}

export function seedDefaultSchools(db: Database.Database): void {
  try {
    const existingSchool = db.prepare('SELECT id FROM schools WHERE name = ?').get('Okul Rehberlik Servisi');
    
    if (!existingSchool) {
      const schoolId = 'school-default-001';
      db.prepare(`
        INSERT INTO schools (id, name, code, created_at)
        VALUES (?, ?, ?, CURRENT_TIMESTAMP)
      `).run(schoolId, 'Okul Rehberlik Servisi', 'DEFAULT');
      
      // Link admin user to default school
      const adminUser = db.prepare('SELECT id FROM users WHERE email = ?').get('rehber@okul.edu.tr') as { id: string } | undefined;
      if (adminUser) {
        const userSchoolId = `user-school-${Date.now()}`;
        db.prepare(`
          INSERT OR IGNORE INTO user_schools (id, userId, schoolId, role, joinedDate)
          VALUES (?, ?, ?, 'owner', CURRENT_TIMESTAMP)
        `).run(userSchoolId, adminUser.id, schoolId);
      }
      
      console.log('✅ Varsayılan okul oluşturuldu');
    }
  } catch (error) {
    console.warn('Varsayılan okul oluşturma hatası:', error);
  }
}
