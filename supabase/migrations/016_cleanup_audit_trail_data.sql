-- Migration: Cleanup existing audit trail data using CANCELLED enum value
-- Date: 2026-02-28
-- Depends on: 015_cleanup_existing_audit_trail_data.sql (CANCELLED enum must exist first)

-- ── 1. Hapus system notes dari pending task rows (assigned_to_id IS NOT NULL) ──
UPDATE letter_histories
SET notes = NULL
WHERE assigned_to_id IS NOT NULL
  AND notes IS NOT NULL
  AND (
    notes LIKE 'Review task assigned%'
    OR notes LIKE 'Review task reassigned%'
    OR notes LIKE 'Approval task assigned%'
    OR notes = 'Revision requested by another reviewer'
  );

-- ── 2. Hapus system notes dari history rows aksi sistem (bukan input user) ──
UPDATE letter_histories
SET notes = NULL
WHERE assigned_to_id IS NULL
  AND action_type IN ('SUBMITTED', 'REVISED')
  AND notes IN (
    'Letter submitted for review',
    'Letter revised by creator',
    'Letter resubmitted after revision'
  );

-- ── 3. Hapus entry SUBMITTED ganda dari resubmit lama ──
WITH ranked AS (
  SELECT id,
    ROW_NUMBER() OVER (
      PARTITION BY letter_id, action_type, DATE_TRUNC('second', created_at)
      ORDER BY id
    ) AS rn
  FROM letter_histories
  WHERE action_type    = 'SUBMITTED'
    AND assigned_to_id IS NULL
)
DELETE FROM letter_histories
WHERE id IN (SELECT id FROM ranked WHERE rn > 1);

-- ── 4. Mark cancelled task entries ──
-- Pending task rows yang sudah completed (to_status IS NOT NULL),
-- bukan aksi langsung user, notes sudah NULL (dibersihkan step 1).
UPDATE letter_histories
SET action_type = 'CANCELLED'
WHERE assigned_to_id IS NOT NULL
  AND action_type     = 'SUBMITTED'
  AND to_status       IS NOT NULL
  AND notes           IS NULL;
