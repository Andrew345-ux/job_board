-- ============================================
-- FIX: Allow authenticated users to view all profiles
-- Run this in Supabase SQL Editor
-- ============================================

-- Drop the old restrictive policy
DROP POLICY IF EXISTS "Users can view their own profile" ON users;

-- Replace with a policy that lets any logged-in user see profiles
-- (This is safe — the users table only has name/email/role, no sensitive data)
CREATE POLICY "Authenticated users can view all profiles"
  ON users FOR SELECT
  USING (auth.role() = 'authenticated');
