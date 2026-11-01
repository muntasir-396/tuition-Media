import { pool } from './index';

export async function seedDatabase() {
  try {
    const client = await pool.connect();
    try {
      // 1. Ensure columns on tutor_profiles
      await client.query(`
        ALTER TABLE IF EXISTS tutor_profiles ADD COLUMN IF NOT EXISTS status text DEFAULT 'active';
        ALTER TABLE IF EXISTS tutor_profiles ADD COLUMN IF NOT EXISTS tagline text;
        ALTER TABLE IF EXISTS tutor_profiles ADD COLUMN IF NOT EXISTS short_bio text;
        ALTER TABLE IF EXISTS tutor_profiles ADD COLUMN IF NOT EXISTS blood_group text;
        ALTER TABLE IF EXISTS tutor_profiles ADD COLUMN IF NOT EXISTS religion text;
        ALTER TABLE IF EXISTS tutor_profiles ADD COLUMN IF NOT EXISTS marital_status text;
        ALTER TABLE IF EXISTS tutor_profiles ADD COLUMN IF NOT EXISTS nationality text DEFAULT 'Bangladeshi';
        ALTER TABLE IF EXISTS tutor_profiles ADD COLUMN IF NOT EXISTS nid_number text;
        ALTER TABLE IF EXISTS tutor_profiles ADD COLUMN IF NOT EXISTS primary_phone text;
        ALTER TABLE IF EXISTS tutor_profiles ADD COLUMN IF NOT EXISTS primary_phone_verified boolean DEFAULT false;
        ALTER TABLE IF EXISTS tutor_profiles ADD COLUMN IF NOT EXISTS secondary_phone text;
        ALTER TABLE IF EXISTS tutor_profiles ADD COLUMN IF NOT EXISTS whatsapp_number text;
        ALTER TABLE IF EXISTS tutor_profiles ADD COLUMN IF NOT EXISTS same_as_present_address boolean DEFAULT false;
        ALTER TABLE IF EXISTS tutor_profiles ADD COLUMN IF NOT EXISTS guardian_info jsonb;
        ALTER TABLE IF EXISTS tutor_profiles ADD COLUMN IF NOT EXISTS education_history jsonb;
        ALTER TABLE IF EXISTS tutor_profiles ADD COLUMN IF NOT EXISTS preferred_areas jsonb;
        ALTER TABLE IF EXISTS tutor_profiles ADD COLUMN IF NOT EXISTS classes jsonb;
        ALTER TABLE IF EXISTS tutor_profiles ADD COLUMN IF NOT EXISTS profile_visibility text DEFAULT 'public';
        ALTER TABLE IF EXISTS tutor_profiles ADD COLUMN IF NOT EXISTS hide_last_name boolean DEFAULT false;

        ALTER TABLE IF EXISTS tutors ADD COLUMN IF NOT EXISTS status text DEFAULT 'active';
        ALTER TABLE IF EXISTS tutors ADD COLUMN IF NOT EXISTS blood_group text;
        ALTER TABLE IF EXISTS tutors ADD COLUMN IF NOT EXISTS religion text;
        ALTER TABLE IF EXISTS tutors ADD COLUMN IF NOT EXISTS guardian_info jsonb;
        ALTER TABLE IF EXISTS tutors ADD COLUMN IF NOT EXISTS education_history jsonb;
        ALTER TABLE IF EXISTS tutors ADD COLUMN IF NOT EXISTS preferred_areas jsonb;
      `);

      // 2. Ensure new normalized tables exist
      await client.query(`
        CREATE TABLE IF NOT EXISTS tutor_education (
          id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
          tutor_id uuid REFERENCES tutor_profiles(id) ON DELETE CASCADE,
          level text NOT NULL,
          degree_name text NOT NULL,
          group_major text,
          institute text NOT NULL,
          board_university text,
          passing_year text,
          result_type text,
          result_value text,
          currently_studying boolean DEFAULT false,
          expected_graduation text,
          student_id text,
          department text,
          academic_year text,
          certificate_url text,
          display_order integer DEFAULT 0,
          created_at timestamp DEFAULT now(),
          updated_at timestamp DEFAULT now()
        );

        CREATE TABLE IF NOT EXISTS tutor_experience (
          id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
          tutor_id uuid REFERENCES tutor_profiles(id) ON DELETE CASCADE,
          subject text NOT NULL,
          course_class text NOT NULL,
          duration text,
          role text,
          reference_name text,
          reference_phone text,
          description text,
          achievements text,
          intro_video_url text,
          created_at timestamp DEFAULT now()
        );

        CREATE TABLE IF NOT EXISTS tutor_certifications (
          id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
          tutor_id uuid REFERENCES tutor_profiles(id) ON DELETE CASCADE,
          title text NOT NULL,
          issuer text NOT NULL,
          year text,
          certificate_url text,
          created_at timestamp DEFAULT now()
        );

        CREATE TABLE IF NOT EXISTS tutor_preferences (
          id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
          tutor_id uuid REFERENCES tutor_profiles(id) ON DELETE CASCADE UNIQUE,
          mediums jsonb,
          classes jsonb,
          subjects jsonb,
          tuition_types jsonb,
          student_gender_pref text DEFAULT 'Any',
          max_students integer DEFAULT 1,
          expected_salary_min integer,
          expected_salary_max integer,
          salary_negotiable boolean DEFAULT true,
          preferred_days_per_week text,
          preferred_duration text,
          language_skills jsonb,
          created_at timestamp DEFAULT now(),
          updated_at timestamp DEFAULT now()
        );

        CREATE TABLE IF NOT EXISTS tutor_areas (
          id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
          tutor_id uuid REFERENCES tutor_profiles(id) ON DELETE CASCADE,
          area_id text REFERENCES areas(id) ON DELETE CASCADE,
          max_travel_distance_km integer DEFAULT 5,
          willing_to_relocate boolean DEFAULT false,
          created_at timestamp DEFAULT now(),
          UNIQUE(tutor_id, area_id)
        );

        CREATE TABLE IF NOT EXISTS tutor_availability (
          id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
          tutor_id uuid REFERENCES tutor_profiles(id) ON DELETE CASCADE,
          day_of_week text NOT NULL,
          slot text NOT NULL,
          is_available boolean DEFAULT true,
          available_from timestamp,
          is_open_for_tuition boolean DEFAULT true,
          created_at timestamp DEFAULT now(),
          UNIQUE(tutor_id, day_of_week, slot)
        );

        CREATE TABLE IF NOT EXISTS tutor_documents (
          id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
          tutor_id uuid REFERENCES tutor_profiles(id) ON DELETE CASCADE,
          document_type text NOT NULL,
          storage_key text,
          file_url text,
          file_size integer,
          mime_type text,
          status text DEFAULT 'pending',
          rejection_reason text,
          reviewed_by uuid,
          reviewed_at timestamp,
          uploaded_at timestamp DEFAULT now(),
          updated_at timestamp DEFAULT now()
        );

        CREATE TABLE IF NOT EXISTS tutor_payment_info (
          id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
          tutor_id uuid REFERENCES tutor_profiles(id) ON DELETE CASCADE UNIQUE,
          method text NOT NULL DEFAULT 'bKash',
          mobile_wallet_number text,
          bank_name text,
          bank_account_holder text,
          bank_account_number text,
          bank_branch text,
          routing_number text,
          created_at timestamp DEFAULT now(),
          updated_at timestamp DEFAULT now()
        );

        CREATE TABLE IF NOT EXISTS tutor_emergency_contacts (
          id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
          tutor_id uuid REFERENCES tutor_profiles(id) ON DELETE CASCADE UNIQUE,
          father_name text,
          father_phone text,
          mother_name text,
          mother_phone text,
          emergency_contact_name text,
          emergency_contact_relation text,
          emergency_contact_phone text,
          created_at timestamp DEFAULT now(),
          updated_at timestamp DEFAULT now()
        );

        CREATE TABLE IF NOT EXISTS bookmarks (
          id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
          target_type text NOT NULL,
          target_id text NOT NULL,
          personal_note text,
          remind_me boolean DEFAULT false,
          created_at timestamp DEFAULT now(),
          UNIQUE(user_id, target_type, target_id)
        );

        CREATE TABLE IF NOT EXISTS profile_audit_logs (
          id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
          changed_by uuid,
          section text NOT NULL,
          field text,
          old_value text,
          new_value text,
          ip_address text,
          user_agent text,
          created_at timestamp DEFAULT now()
        );

        CREATE TABLE IF NOT EXISTS subjects (
          id serial PRIMARY KEY,
          name_en text NOT NULL UNIQUE,
          name_bn text,
          category text,
          is_approved boolean DEFAULT true,
          created_at timestamp DEFAULT now()
        );
      `);

      // 3. Seed subjects if empty
      await client.query(`
        INSERT INTO subjects (name_en, name_bn, category)
        VALUES 
          ('Bangla', 'বাংলা', 'General'),
          ('English', 'ইংরেজি', 'Language'),
          ('General Mathematics', 'সাধারণ গণিত', 'General'),
          ('Higher Mathematics', 'উচ্চতর গণিত', 'Science'),
          ('Physics', 'পদার্থবিজ্ঞান', 'Science'),
          ('Chemistry', 'রসায়ন', 'Science'),
          ('Biology', 'জীববিজ্ঞান', 'Science'),
          ('ICT (Information Technology)', 'তথ্য ও যোগাযোগ প্রযুক্তি', 'Science'),
          ('Accounting', 'হিসাববিজ্ঞান', 'Commerce'),
          ('Finance & Banking', 'অর্থায়ন ও ব্যাংকিং', 'Commerce'),
          ('Business Studies', 'ব্যবসায় উদ্যোগ', 'Commerce'),
          ('Economics', 'অর্থনীতি', 'Arts'),
          ('Statistics', 'পরিসংখ্যান', 'Science'),
          ('General Science', 'সাধারণ বিজ্ঞান', 'General'),
          ('Social Science', 'বাংলাদেশ ও বিশ্বপরিচয়', 'General'),
          ('Quranic Studies & Arabic', 'কোরআন শিক্ষা ও আরবি', 'Religious')
        ON CONFLICT (name_en) DO NOTHING;
      `);

      console.log('Ensured all normalized Tutor Profile tables and Subjects exist in PostgreSQL.');
    } finally {
      client.release();
    }
  } catch (err: any) {
    console.warn('DB schema ensure notice:', err.message);
  }
}

