import * as SQLite from 'expo-sqlite';
import { seedMedicines } from './seedData';

const DATABASE_NAME = 'rxfast.db';

let db: SQLite.SQLiteDatabase | null = null;

export async function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (db) return db;
  db = await SQLite.openDatabaseAsync(DATABASE_NAME);
  return db;
}

export async function initDatabase(): Promise<void> {
  const database = await getDatabase();

  // Enable foreign keys
  await database.execAsync('PRAGMA foreign_keys = ON;');

  // Create tables
  await database.execAsync(`
    -- Doctor Profile
    CREATE TABLE IF NOT EXISTS doctor (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      qualification TEXT,
      registration_number TEXT NOT NULL,
      clinic_name TEXT,
      clinic_address TEXT,
      phone TEXT,
      email TEXT,
      signature_base64 TEXT,
      logo_base64 TEXT,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    );

    -- Patients
    CREATE TABLE IF NOT EXISTS patients (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      age INTEGER,
      gender TEXT CHECK(gender IN ('M', 'F', 'O')),
      phone TEXT,
      last_visit INTEGER NOT NULL,
      visit_count INTEGER DEFAULT 1,
      created_at INTEGER NOT NULL
    );

    -- Medicines Master
    CREATE TABLE IF NOT EXISTS medicines (
      id TEXT PRIMARY KEY,
      generic_name TEXT NOT NULL,
      brand_name TEXT,
      strength TEXT,
      form TEXT NOT NULL,
      default_dose TEXT,
      default_frequency TEXT,
      default_duration TEXT,
      default_instruction TEXT,
      use_count INTEGER DEFAULT 0,
      is_custom INTEGER DEFAULT 0
    );

    -- Prescriptions
    CREATE TABLE IF NOT EXISTS prescriptions (
      id TEXT PRIMARY KEY,
      patient_id TEXT NOT NULL,
      doctor_id TEXT NOT NULL,
      diagnosis TEXT,
      advice TEXT,
      follow_up_days INTEGER,
      pdf_path TEXT,
      created_at INTEGER NOT NULL,
      FOREIGN KEY (patient_id) REFERENCES patients(id),
      FOREIGN KEY (doctor_id) REFERENCES doctor(id)
    );

    -- Prescription Items
    CREATE TABLE IF NOT EXISTS prescription_items (
      id TEXT PRIMARY KEY,
      prescription_id TEXT NOT NULL,
      medicine_id TEXT,
      medicine_name TEXT NOT NULL,
      dose TEXT,
      frequency TEXT,
      duration TEXT,
      duration_unit TEXT DEFAULT 'days',
      instruction TEXT,
      sort_order INTEGER,
      FOREIGN KEY (prescription_id) REFERENCES prescriptions(id) ON DELETE CASCADE
    );

    -- Templates
    CREATE TABLE IF NOT EXISTS templates (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      diagnosis TEXT,
      medicines_json TEXT NOT NULL,
      advice TEXT,
      use_count INTEGER DEFAULT 0,
      created_at INTEGER NOT NULL
    );

    -- Indexes
    CREATE INDEX IF NOT EXISTS idx_patients_name ON patients(name);
    CREATE INDEX IF NOT EXISTS idx_patients_last_visit ON patients(last_visit DESC);
    CREATE INDEX IF NOT EXISTS idx_medicines_generic ON medicines(generic_name);
    CREATE INDEX IF NOT EXISTS idx_medicines_use_count ON medicines(use_count DESC);
    CREATE INDEX IF NOT EXISTS idx_prescriptions_patient ON prescriptions(patient_id);
    CREATE INDEX IF NOT EXISTS idx_prescriptions_date ON prescriptions(created_at DESC);
  `);

  // Check if medicines need seeding
  const medicineCount = await database.getFirstAsync<{ count: number }>(
    'SELECT COUNT(*) as count FROM medicines'
  );

  if (!medicineCount || medicineCount.count === 0) {
    await seedMedicines(database);
  }

  console.log('Database initialized successfully');
}

export async function resetDatabase(): Promise<void> {
  const database = await getDatabase();
  await database.execAsync(`
    DROP TABLE IF EXISTS prescription_items;
    DROP TABLE IF EXISTS prescriptions;
    DROP TABLE IF EXISTS templates;
    DROP TABLE IF EXISTS patients;
    DROP TABLE IF EXISTS medicines;
    DROP TABLE IF EXISTS doctor;
  `);
  await initDatabase();
}
