-- Migration: Fix Storage RLS Policies for Meeting Attachments
-- Date: 2026-03-28
-- Changes:
--   1. Create policies for authenticated users to access "Leora Files" bucket
--
-- NOTE: storage.objects RLS is already enabled by Supabase by default.
--       We only manage policies here, not the table itself.

-- ============================================
-- 1. CREATE POLICIES FOR "Leora Files" BUCKET
-- ============================================

-- Drop existing policies if they exist (for idempotency)
DROP POLICY IF EXISTS "Allow authenticated uploads to Leora Files" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated reads from Leora Files" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated deletes from Leora Files" ON storage.objects;

-- Policy for UPLOAD (INSERT)
-- Allow authenticated users to upload files to "Leora Files" bucket
CREATE POLICY "Allow authenticated uploads to Leora Files"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'Leora Files'
);

-- Policy for READ (SELECT)
-- Allow authenticated users to read files from "Leora Files" bucket
CREATE POLICY "Allow authenticated reads from Leora Files"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'Leora Files'
);

-- Policy for DELETE
-- Allow authenticated users to delete files from "Leora Files" bucket
CREATE POLICY "Allow authenticated deletes from Leora Files"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'Leora Files'
);

-- ============================================
-- 2. VERIFY BUCKET EXISTS
-- ============================================
-- Note: Pastikan bucket "Leora Files" sudah dibuat di Supabase Storage
-- Kalau belum, buat via Supabase Dashboard atau SQL:
-- INSERT INTO storage.buckets (id, name, public) VALUES ('Leora Files', 'Leora Files', true);
