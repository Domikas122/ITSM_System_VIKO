import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import * as schema from "@shared/schema";

// Create or open the SQLite database
const sqlite = new Database("./incident-pilot.db");

// Enable foreign keys
sqlite.pragma("foreign_keys = ON");

// Create drizzle instance
export const db = drizzle(sqlite, { schema });

// Create tables if they don't exist
export function initializeDatabase() {
  // Ensure backwards compatibility: add missing columns
  const hasColumn = (table: string, column: string) => {
    try {
      const columns = sqlite.prepare(`PRAGMA table_info(${table})`).all();
      return columns.some((c: any) => c.name === column);
    } catch {
      return false;
    }
  };

  // Create users table
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      username TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL,
      email TEXT,
      role TEXT NOT NULL DEFAULT 'Darbuotojas',
      display_name TEXT NOT NULL
    )
  `);

  // Add email column if migrating from old database
  if (!hasColumn("users", "email")) {
    try {
      sqlite.exec("ALTER TABLE users ADD COLUMN email TEXT");
    } catch (e) {
      console.log("Email column already exists or migration failed (safe to ignore)");
    }
  }

  // Create incidents table
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS incidents (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      category TEXT NOT NULL,
      severity TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'Naujas',
      affected_systems TEXT,
      reported_by TEXT NOT NULL,
      assigned_to TEXT,
      ai_tags TEXT,
      ai_analysis TEXT,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL,
      resolved_at INTEGER
    )
  `);

  // Create incident history table
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS incident_history (
      id TEXT PRIMARY KEY,
      incident_id TEXT NOT NULL,
      action TEXT NOT NULL,
      previous_status TEXT,
      new_status TEXT,
      performed_by TEXT NOT NULL,
      notes TEXT,
      created_at INTEGER NOT NULL
    )
  `);

  console.log("✅ Database initialized");
}
