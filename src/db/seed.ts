import { pool } from './index';

export async function seedDatabase() {
  try {
    const client = await pool.connect();
    try {
      await client.query(`
        ALTER TABLE IF EXISTS tutor_profiles ADD COLUMN IF NOT EXISTS status text DEFAULT 'active';
        ALTER TABLE IF EXISTS tutor_profiles ADD COLUMN IF NOT EXISTS blood_group text;
        ALTER TABLE IF EXISTS tutor_profiles ADD COLUMN IF NOT EXISTS religion text;
        ALTER TABLE IF EXISTS tutor_profiles ADD COLUMN IF NOT EXISTS guardian_info jsonb;
        ALTER TABLE IF EXISTS tutor_profiles ADD COLUMN IF NOT EXISTS education_history jsonb;
        ALTER TABLE IF EXISTS tutor_profiles ADD COLUMN IF NOT EXISTS preferred_areas jsonb;
        ALTER TABLE IF EXISTS tutor_profiles ADD COLUMN IF NOT EXISTS classes jsonb;
        ALTER TABLE IF EXISTS tutors ADD COLUMN IF NOT EXISTS status text DEFAULT 'active';
        ALTER TABLE IF EXISTS tutors ADD COLUMN IF NOT EXISTS blood_group text;
        ALTER TABLE IF EXISTS tutors ADD COLUMN IF NOT EXISTS religion text;
        ALTER TABLE IF EXISTS tutors ADD COLUMN IF NOT EXISTS guardian_info jsonb;
        ALTER TABLE IF EXISTS tutors ADD COLUMN IF NOT EXISTS education_history jsonb;
        ALTER TABLE IF EXISTS tutors ADD COLUMN IF NOT EXISTS preferred_areas jsonb;
      `);
      console.log('Ensured all tutor profile columns exist in PostgreSQL.');
    } finally {
      client.release();
    }
  } catch (err: any) {
    console.warn('DB column ensure notice:', err.message);
  }
}

