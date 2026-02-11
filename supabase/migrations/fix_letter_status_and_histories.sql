-- ============================================================================
-- Fix: Reset Letter Status and Clean Up Duplicate Histories
-- ============================================================================

-- Step 1: Delete all duplicate REVISION_REQUESTED histories for this letter
WITH ranked_histories AS (
  SELECT
    id,
    ROW_NUMBER() OVER (
      PARTITION BY letter_id, action_by_id, action_type,
                   created_at::date
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

-- Step 2: Update letter status to REVISION_REQUESTED
UPDATE outgoing_letters
SET status = 'REVISION_REQUESTED',
    updated_at = NOW()
WHERE id = 'ac843669-dfe3-4a35-b951-e5b418da67ff'
  AND status != 'REVISION_REQUESTED';

-- Step 3: Verify results
SELECT 'Letter Status:' as info;
SELECT id, status, updated_at
FROM outgoing_letters
WHERE id = 'ac843669-dfe3-4a35-b951-e5b418da67ff';

SELECT 'History Entries:' as info;
SELECT id, action_type, to_status, created_at
FROM letter_histories
WHERE letter_id = 'ac843669-dfe3-4a35-b951-e5b418da67ff'
  AND action_type = 'REVISION_REQUESTED'
ORDER BY created_at DESC;
