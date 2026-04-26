-- ============================================
-- JobBoard — FULL Database Schema
-- Run this in Supabase SQL Editor
-- ============================================

-- ─── DROP OLD TABLES (if they exist) ───
DROP TABLE IF EXISTS saved_jobs CASCADE;
DROP TABLE IF EXISTS applications CASCADE;
DROP TABLE IF EXISTS jobs CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- ─── 1. USERS TABLE ───
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('recruiter', 'seeker')),
  full_name TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- ─── 2. JOBS TABLE ───
CREATE TABLE jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recruiter_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  location TEXT,
  job_type TEXT CHECK (job_type IN ('full-time', 'part-time', 'contract', 'internship')),
  salary_min DECIMAL,
  salary_max DECIMAL,
  category TEXT CHECK (category IN ('technology', 'marketing', 'sales', 'design', 'business', 'other')),
  requirements TEXT DEFAULT '',
  benefits TEXT DEFAULT '',
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'closed')),
  created_at TIMESTAMP DEFAULT NOW()
);

-- ─── 3. APPLICATIONS TABLE ───
CREATE TABLE applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID REFERENCES jobs(id) ON DELETE CASCADE NOT NULL,
  seeker_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'rejected', 'accepted')),
  cover_letter TEXT DEFAULT '',
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(job_id, seeker_id)
);

-- ─── 4. SAVED_JOBS TABLE ───
CREATE TABLE saved_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID REFERENCES jobs(id) ON DELETE CASCADE NOT NULL,
  seeker_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(job_id, seeker_id)
);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_jobs ENABLE ROW LEVEL SECURITY;

-- ─── USERS POLICIES ───
CREATE POLICY "Users can view their own profile"
  ON users FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON users FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON users FOR UPDATE
  USING (auth.uid() = id);

-- ─── JOBS POLICIES ───
CREATE POLICY "Anyone authenticated can view jobs"
  ON jobs FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Recruiters can insert jobs"
  ON jobs FOR INSERT
  WITH CHECK (auth.uid() = recruiter_id);

CREATE POLICY "Recruiters can update their own jobs"
  ON jobs FOR UPDATE
  USING (auth.uid() = recruiter_id);

CREATE POLICY "Recruiters can delete their own jobs"
  ON jobs FOR DELETE
  USING (auth.uid() = recruiter_id);

-- ─── APPLICATIONS POLICIES ───
CREATE POLICY "Seekers can view their own applications"
  ON applications FOR SELECT
  USING (auth.uid() = seeker_id);

CREATE POLICY "Recruiters can view applications for their jobs"
  ON applications FOR SELECT
  USING (
    job_id IN (SELECT id FROM jobs WHERE recruiter_id = auth.uid())
  );

CREATE POLICY "Seekers can insert applications"
  ON applications FOR INSERT
  WITH CHECK (auth.uid() = seeker_id);

CREATE POLICY "Seekers can delete their own applications"
  ON applications FOR DELETE
  USING (auth.uid() = seeker_id);

CREATE POLICY "Recruiters can update application status"
  ON applications FOR UPDATE
  USING (
    job_id IN (SELECT id FROM jobs WHERE recruiter_id = auth.uid())
  );

-- ─── SAVED_JOBS POLICIES ───
CREATE POLICY "Seekers can view their saved jobs"
  ON saved_jobs FOR SELECT
  USING (auth.uid() = seeker_id);

CREATE POLICY "Seekers can save jobs"
  ON saved_jobs FOR INSERT
  WITH CHECK (auth.uid() = seeker_id);

CREATE POLICY "Seekers can unsave jobs"
  ON saved_jobs FOR DELETE
  USING (auth.uid() = seeker_id);
