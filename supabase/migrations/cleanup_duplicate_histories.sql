-- ============================================================================
-- Phase 1: Cleanup Duplicate History Entries
-- ============================================================================

-- 1. Check current state before cleanup
SELECT 'Before cleanup:' as status;
SELECT id, letter_id, action_type, to_status, COUNT(*) as cnt
FROM letter_histories
WHERE letter_id = 'ac843669-dfe3-4a35-b951-e5b418da67ff'
GROUP BY id, letter_id, action_type, to_status
ORDER BY created_at DESC;

-- 2. Delete duplicate history entries, keeping only the latest
WITH ranked_histories AS (
  SELECT
    id,
    ROW_NUMBER() OVER (
      PARTITION BY letter_id, action_by_id, action_type, to_status,
                   stage_type, sequence, created_at::date
      ORDER BY created_at DESC
    ) as rn
  FROM letter_histories
  WHERE letter_id = 'ac843669-dfe3-4a35-b951-e5b418da67ff'
    AND action_type = 'REVISION_REQUESTED'
)
DELETE FROM letter_histories
WHERE id IN (
  SELECT id FROM ranked_histories WHERE rn > 1
);

-- 3. Verify cleanup
SELECT 'After cleanup:' as status;
SELECT id, letter_id, action_type, to_status, created_at
FROM letter_histories
WHERE letter_id = 'ac843669-dfe3-4a35-b951-e5b418da67ff'
ORDER BY created_at DESC;

-- 4. Reset letter status to REVISION_REQUESTED
UPDATE outgoing_letters
SET status = 'REVISION_REQUESTED', updated_at = NOW()
WHERE id = 'ac843669-dfe3-4a35-b951-e5b418da67ff'
  AND status != 'REVISION_REQUESTED';

-- 5. Verify final state
SELECT id, status, updated_at FROM outgoing_letters WHERE id = 'ac843669-dfe3-4a35-b951-e5b418da67ff';
