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
      website TEXT,
      socialMedia TEXT,
      viceEducationDirector TEXT,
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
      // Get admin user
      const adminUser = db.prepare('SELECT id FROM users WHERE email = ?').get('rehber@okul.edu.tr') as { id: string } | undefined;
      if (!adminUser) return;

      // Create 3 schools for testing multiple schools feature
      const schools = [
        {
          id: 'school-001',
          name: 'Atatürk Anadolu Lisesi',
          code: 'AAL-001',
          address: 'Ankara, Türkiye',
          phone: '+90 (312) 555-0101',
          email: 'ataturk@meb.gov.tr',
          principal: 'Prof. Dr. Ahmet Yılmaz',
          viceEducationDirector: 'Doç. Dr. Fatma Kaya',
          website: 'https://ataturkanadolu.meb.gov.tr',
          socialMedia: '@ataturkanadolu'
        },
        {
          id: 'school-002',
          name: 'İstanbul Bilim ve Teknoloji Lisesi',
          code: 'IBTL-002',
          address: 'İstanbul, Türkiye',
          phone: '+90 (212) 555-0202',
          email: 'ibtl@meb.gov.tr',
          principal: 'Dr. Mehmet Özdemir',
          viceEducationDirector: 'Yrd. Doç. Ayşe Demir',
          website: 'https://istanbulbtl.meb.gov.tr',
          socialMedia: '@ibtl_istanbul'
        },
        {
          id: 'school-003',
          name: 'İzmir Deniz Mühendislik Fakültesi Hazırlık',
          code: 'IDMF-003',
          address: 'İzmir, Türkiye',
          phone: '+90 (232) 555-0303',
          email: 'idmf@meb.gov.tr',
          principal: 'Prof. Dr. Mustafa Erdoğan',
          viceEducationDirector: 'Doç. Dr. Zeynep Aksoy',
          website: 'https://izmirdeniz.meb.gov.tr',
          socialMedia: '@idmf_izmir'
        }
      ];

      // Insert schools
      for (const school of schools) {
        db.prepare(`
          INSERT INTO schools (id, name, code, address, phone, email, principal, viceEducationDirector, website, socialMedia, created_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
        `).run(school.id, school.name, school.code, school.address, school.phone, school.email, school.principal, school.viceEducationDirector, school.website, school.socialMedia);
      }

      // Link all schools to admin user (first school as default)
      for (let i = 0; i < schools.length; i++) {
        const userSchoolId = `user-school-${i}-${Date.now()}`;
        const isDefault = i === 0 ? 1 : 0; // First school is default
        db.prepare(`
          INSERT OR IGNORE INTO user_schools (id, userId, schoolId, role, isDefault, joinedDate)
          VALUES (?, ?, ?, 'owner', ?, CURRENT_TIMESTAMP)
        `).run(userSchoolId, adminUser.id, schools[i].id, isDefault);
      }
      
      console.log('✅ Birden fazla okul oluşturuldu (test verisi)');
    }
  } catch (error) {
    console.warn('Okul oluşturma hatası:', error);
  }
}
