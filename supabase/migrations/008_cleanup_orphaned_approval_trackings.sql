-- ============================================
-- CLEANUP: Remove Orphaned Approval Trackings
-- ============================================
-- Purpose: Delete approval stage trackings that were created
--          before all reviewers approved (data inconsistency)
-- ============================================

-- Delete APPROVAL trackings where letter status is NOT 'REVIEWED' or 'APPROVED'
-- These are invalid because approval stage should only exist after review is complete
DELETE FROM letter_workflow_trackings
WHERE stage_type = 'APPROVAL'
  AND letter_id IN (
    SELECT id FROM outgoing_letters
    WHERE status NOT IN ('REVIEWED', 'APPROVED', 'REJECTED')
  );

-- ============================================
-- VERIFICATION QUERY
-- ============================================
-- Check remaining approval trackings - should only be for REVIEWED/APPROVED letters
SELECT 
  lwt.id as tracking_id,
  ol.id as letter_id,
  ol.subject,
  ol.status as letter_status,
  lwt.stage_type,
  lwt.status as tracking_status,
  u.nama as assigned_to
FROM letter_workflow_trackings lwt
JOIN outgoing_letters ol ON lwt.letter_id = ol.id
JOIN users u ON lwt.assigned_to_id = u.id
WHERE lwt.stage_type = 'APPROVAL'
ORDER BY ol.created_at DESC;

-- ============================================
-- EXPECTED RESULT
-- ============================================
-- All APPROVAL trackings should have letter_status = 'REVIEWED' or 'APPROVED' or 'REJECTED'
-- If any show 'DRAFT' or 'SUBMITTED_TO_REVIEW', there's a data inconsistency
-- ============================================
