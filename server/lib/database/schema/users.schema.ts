import type Database from 'better-sqlite3';
import bcrypt from 'bcryptjs';

export function createUsersTable(db: Database.Database): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      passwordHash TEXT NOT NULL,
      role TEXT NOT NULL CHECK(role IN ('counselor', 'teacher', 'student', 'parent')),
      isActive BOOLEAN DEFAULT TRUE,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
    CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
    CREATE INDEX IF NOT EXISTS idx_users_isActive ON users(isActive);
  `);

  // Migration: Remove institution column if it exists and add it back if needed (will be handled by user_schools)
  try {
    const tableInfo = db.prepare("PRAGMA table_info(users)").all();
    const hasInstitution = tableInfo.some((col: any) => col.name === 'institution');
    if (hasInstitution) {
      // Column exists, we'll leave it for backward compatibility but it's deprecated
      console.log('ℹ️ institution column exists in users table (deprecated, use user_schools)');
    }
  } catch (e) {
    // Ignore errors
  }
}

export function seedAdminUser(db: Database.Database): void {
  const existingUser = db.prepare('SELECT id FROM users WHERE email = ?').get('rehber@okul.edu.tr');
  
  if (!existingUser) {
    const passwordHash = bcrypt.hashSync('rehber123', 10);
    db.prepare(`
      INSERT INTO users (id, name, email, passwordHash, role, isActive)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(
      'rehber-user-id-12345',
      'Rehber Öğretmen',
      'rehber@okul.edu.tr',
      passwordHash,
      'counselor',
      1
    );
    console.log('✅ Rehber öğretmen kullanıcısı oluşturuldu: rehber@okul.edu.tr / rehber123');
  }
}
