-- Migration: Fix RLS for updating letters in revision
-- Date: 2026-02-27
-- Issue: "Update letter failed: Cannot coerce the result to a single JSON object" 
-- Penyebab: RLS policy "auth_letters_update_own_draft" hanya membolehkan 
--          UPDATE bila status = 'DRAFT'. Akibatnya surat dengan status 
--          'REVISION_REQUESTED' tidak bisa diedit oleh pembuatnya.

-- ============================================================================
-- 1. DROP POLICY LAMA
-- ============================================================================
DROP POLICY IF EXISTS "auth_letters_update_own_draft" ON outgoing_letters;

-- ============================================================================
-- 2. BUAT POLICY BARU YANG MENGIZINKAN UPDATE SAAT REVISI
-- ============================================================================
-- UPDATE: Creator bisa update surat miliknya yang masih DRAFT ATAU REVISION_REQUESTED
CREATE POLICY "auth_letters_update_own"
ON outgoing_letters
FOR UPDATE
TO authenticated
USING (
  created_by_id = auth.uid() 
  AND status IN ('DRAFT', 'REVISION_REQUESTED')
)
WITH CHECK (
  created_by_id = auth.uid()
);
