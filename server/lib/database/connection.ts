import Database from 'better-sqlite3';
import { databaseConfig } from '../../config/index.js';
import * as fs from 'fs';
import * as path from 'path';

let db: Database.Database | null = null;

export function getDatabase(): Database.Database {
  if (!db) {
    try {
      const dbPath = databaseConfig.path;
      
      // Ensure database directory exists
      const dbDir = path.dirname(dbPath);
      if (!fs.existsSync(dbDir)) {
        fs.mkdirSync(dbDir, { recursive: true });
      }
      
      db = new Database(dbPath);
      
      try {
        db.prepare('SELECT 1').get();
      } catch (connectionError) {
        console.error('Database connection test failed:', connectionError);
        db.close();
        db = null;
        throw new Error('Failed to establish database connection');
      }
      
      try {
        db.pragma(`journal_mode = ${databaseConfig.pragmas.journalMode}`);
        db.pragma(`foreign_keys = ${databaseConfig.pragmas.foreignKeys ? 'ON' : 'OFF'}`);
        db.pragma(`encoding = "${databaseConfig.pragmas.encoding}"`);
      } catch (pragmaError) {
        console.error('Failed to set database pragmas:', pragmaError);
        db.close();
        db = null;
        throw new Error('Failed to configure database settings');
      }
    } catch (error) {
      console.error('Error initializing database:', error);
      if (db) {
        try {
          db.close();
        } catch (closeError) {
          console.error('Error closing database after initialization failure:', closeError);
        }
        db = null;
      }
      throw error;
    }
  }
  return db;
}

/**
 * Closes the database connection gracefully
 * This should be called during application shutdown to ensure:
 * - WAL (Write-Ahead Logging) is properly flushed
 * - All pending writes are committed
 * - Lock files are cleaned up
 * - Database file integrity is maintained
 */
export function closeDatabase(): void {
  if (db) {
    try {
      console.log('Closing database connection...');
      db.close();
      db = null;
      console.log('Database connection closed successfully');
    } catch (error) {
      console.error('Error closing database:', error);
      throw error;
    }
  }
}
