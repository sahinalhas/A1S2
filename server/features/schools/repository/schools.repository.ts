import getDatabase from '../../../lib/database.js';

let statements: any = null;
let isInitialized = false;

function ensureInitialized(): void {
  if (isInitialized && statements) return;
  
  const db = getDatabase();
  
  statements = {
    getAllSchools: db.prepare('SELECT * FROM schools ORDER BY name'),
    getSchoolById: db.prepare('SELECT * FROM schools WHERE id = ?'),
    getSchoolByName: db.prepare('SELECT * FROM schools WHERE name = ?'),
    getUserSchools: db.prepare(`
      SELECT s.* FROM schools s
      INNER JOIN user_schools us ON s.id = us.schoolId
      WHERE us.userId = ?
      ORDER BY s.name
    `),
    getUserSchoolIds: db.prepare(`
      SELECT schoolId FROM user_schools WHERE userId = ?
    `),
    insertSchool: db.prepare(`
      INSERT INTO schools (id, name, code, address, phone, email, principal)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `)
  };
  
  isInitialized = true;
}

export function getAllSchools(): any[] {
  ensureInitialized();
  return statements.getAllSchools.all();
}

export function getSchoolById(id: string): any {
  ensureInitialized();
  return statements.getSchoolById.get(id);
}

export function getSchoolByName(name: string): any {
  ensureInitialized();
  return statements.getSchoolByName.get(name);
}

export function insertSchool(id: string, name: string, code?: string, address?: string, phone?: string, email?: string, principal?: string): void {
  ensureInitialized();
  statements.insertSchool.run(id, name, code || null, address || null, phone || null, email || null, principal || null);
}

export function getUserSchools(userId: string): any[] {
  ensureInitialized();
  return statements.getUserSchools.all(userId);
}

export function getUserSchoolIds(userId: string): string[] {
  ensureInitialized();
  const rows = statements.getUserSchoolIds.all(userId) as { schoolId: string }[];
  return rows.map(r => r.schoolId);
}
