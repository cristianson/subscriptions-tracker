import { migrate } from "drizzle-orm/postgres-js/migrator";
import { db } from "./db";
import { dbStorage } from "./dbStorage";

export async function runMigrations() {
  try {
    console.log("Starting database migration...");
    
    // Initialize tables - Drizzle handles "if not exists" automatically
    await db.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        email TEXT,
        name TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
      
      CREATE TABLE IF NOT EXISTS subscriptions (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        provider TEXT NOT NULL,
        description TEXT,
        amount REAL NOT NULL,
        category TEXT NOT NULL,
        billing_cycle TEXT NOT NULL,
        next_payment_date TIMESTAMPTZ NOT NULL,
        reminder_enabled BOOLEAN DEFAULT FALSE,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
      
      CREATE TABLE IF NOT EXISTS categories (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL UNIQUE,
        color TEXT NOT NULL
      );
    `);
    
    // Initialize default data
    await dbStorage.initializeData();
    
    console.log("Database migration completed successfully");
  } catch (error) {
    console.error("Migration failed:", error);
    throw error;
  }
}