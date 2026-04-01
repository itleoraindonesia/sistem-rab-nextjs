-- Migration: 027_vendor_integration.sql
-- Feature: Vendor Integration
-- Purpose: Link vendor_spk to users table, add RLS for vendor access
-- Date: 2026-04-01
--
-- Safe for production:
--   - vendor_id is NULLABLE (existing SPKs without vendor user stay valid)
--   - RLS policies check stakeholder_type before restricting
--   - Internal users still see all vendor_spk data
--   - Vendors only see their own SPKs

-- ============================================================
-- STEP 1: Add vendor_id to vendor_spk
-- ============================================================

ALTER TABLE vendor_spk ADD COLUMN IF NOT EXISTS vendor_id UUID REFERENCES users(id) ON DELETE SET NULL;

COMMENT ON COLUMN vendor_spk.vendor_id IS 'FK ke users (stakeholder_type=vendor). NULL untuk SPK lama yang belum terintegrasi.';

-- ============================================================
-- STEP 2: Add indexes for RLS queries
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_vendor_spk_vendor_id ON vendor_spk(vendor_id);

-- ============================================================
-- STEP 3: RLS for vendor_spk
-- Enable RLS if not already enabled
-- ============================================================

ALTER TABLE vendor_spk ENABLE ROW LEVEL SECURITY;

-- Drop any existing policies (shadow replacement pattern)
DO $$
DECLARE r RECORD;
BEGIN
  FOR r IN SELECT policyname FROM pg_policies WHERE tablename = 'vendor_spk' AND schemaname = 'public' LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.vendor_spk', r.policyname);
  END LOOP;
END $$;

-- SELECT: Internal users see all, vendors see only their own
CREATE POLICY "vendor_spk_select"
ON vendor_spk FOR SELECT
TO authenticated
USING (
  is_internal_user()
  OR vendor_id = auth.uid()
);

-- INSERT: Only internal users can create SPK
CREATE POLICY "vendor_spk_insert"
ON vendor_spk FOR INSERT
TO authenticated
WITH CHECK (is_internal_user());

-- UPDATE: Only internal users can update SPK
CREATE POLICY "vendor_spk_update"
ON vendor_spk FOR UPDATE
TO authenticated
USING (is_internal_user())
WITH CHECK (is_internal_user());

-- DELETE: Only internal users can delete SPK
CREATE POLICY "vendor_spk_delete"
ON vendor_spk FOR DELETE
TO authenticated
USING (is_internal_user());

-- ============================================================
-- STEP 4: RLS for vendor_progress
-- Vendor bisa submit progress untuk SPK miliknya
-- ============================================================

ALTER TABLE vendor_progress ENABLE ROW LEVEL SECURITY;

DO $$
DECLARE r RECORD;
BEGIN
  FOR r IN SELECT policyname FROM pg_policies WHERE tablename = 'vendor_progress' AND schemaname = 'public' LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.vendor_progress', r.policyname);
  END LOOP;
END $$;

-- SELECT: Internal users see all, vendors see progress for their SPKs
CREATE POLICY "vendor_progress_select"
ON vendor_progress FOR SELECT
TO authenticated
USING (
  is_internal_user()
  OR EXISTS (
    SELECT 1 FROM vendor_spk vs
    WHERE vs.id = vendor_progress.vendor_spk_id
      AND vs.vendor_id = auth.uid()
  )
);

-- INSERT: Internal users + vendors for their own SPKs
CREATE POLICY "vendor_progress_insert"
ON vendor_progress FOR INSERT
TO authenticated
WITH CHECK (
  is_internal_user()
  OR EXISTS (
    SELECT 1 FROM vendor_spk vs
    WHERE vs.id = vendor_progress.vendor_spk_id
      AND vs.vendor_id = auth.uid()
  )
);

-- UPDATE: Internal users only (vendor tidak bisa edit progress)
CREATE POLICY "vendor_progress_update"
ON vendor_progress FOR UPDATE
TO authenticated
USING (is_internal_user())
WITH CHECK (is_internal_user());

-- DELETE: Internal users only
CREATE POLICY "vendor_progress_delete"
ON vendor_progress FOR DELETE
TO authenticated
USING (is_internal_user());

-- ============================================================
-- STEP 5: RLS for vendor_payment
-- Vendor bisa lihat pembayaran untuk SPK miliknya
-- ============================================================

ALTER TABLE vendor_payment ENABLE ROW LEVEL SECURITY;

DO $$
DECLARE r RECORD;
BEGIN
  FOR r IN SELECT policyname FROM pg_policies WHERE tablename = 'vendor_payment' AND schemaname = 'public' LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.vendor_payment', r.policyname);
  END LOOP;
END $$;

-- SELECT: Internal users see all, vendors see payments for their SPKs
CREATE POLICY "vendor_payment_select"
ON vendor_payment FOR SELECT
TO authenticated
USING (
  is_internal_user()
  OR EXISTS (
    SELECT 1 FROM vendor_spk vs
    WHERE vs.id = vendor_payment.vendor_spk_id
      AND vs.vendor_id = auth.uid()
  )
);

-- INSERT/UPDATE/DELETE: Internal users only
CREATE POLICY "vendor_payment_write"
ON vendor_payment FOR ALL
TO authenticated
USING (is_internal_user())
WITH CHECK (is_internal_user());

-- ============================================================
-- STEP 6: RLS for customer_payment
-- Internal only — vendor/client tidak bisa lihat pembayaran customer
-- ============================================================

ALTER TABLE customer_payment ENABLE ROW LEVEL SECURITY;

DO $$
DECLARE r RECORD;
BEGIN
  FOR r IN SELECT policyname FROM pg_policies WHERE tablename = 'customer_payment' AND schemaname = 'public' LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.customer_payment', r.policyname);
  END LOOP;
END $$;

CREATE POLICY "customer_payment_select"
ON customer_payment FOR SELECT
TO authenticated
USING (is_internal_user());

CREATE POLICY "customer_payment_write"
ON customer_payment FOR ALL
TO authenticated
USING (is_internal_user())
WITH CHECK (is_internal_user());
