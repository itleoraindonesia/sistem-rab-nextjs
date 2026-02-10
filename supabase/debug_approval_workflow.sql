-- ============================================
-- QUICK DEBUG: Check Latest Letter Workflow
-- ============================================

-- 1. Get latest letter info
SELECT 
  '=== LATEST LETTER ===' as info,
  ol.id as letter_id,
  ol.subject,
  ol.status,
  dt.name as document_type,
  ol.created_at
FROM outgoing_letters ol
JOIN document_types dt ON ol.document_type_id = dt.id
ORDER BY ol.created_at DESC
LIMIT 1;

-- 2. Get all trackings for latest letter
SELECT 
  '=== TRACKINGS ===' as info,
  lwt.stage_type,
  lwt.status,
  lwt.sequence,
  u.nama as assigned_to,
  u.email,
  lwt.created_at,
  lwt.action_at
FROM outgoing_letters ol
JOIN letter_workflow_trackings lwt ON ol.id = lwt.letter_id
JOIN users u ON lwt.assigned_to_id = u.id
WHERE ol.id = (SELECT id FROM outgoing_letters ORDER BY created_at DESC LIMIT 1)
ORDER BY lwt.stage_type, lwt.sequence;

-- 3. Check approval configs
SELECT 
  '=== APPROVAL CONFIGS ===' as info,
  dt.name as document_type,
  u.nama as approver_name,
  u.email as approver_email,
  u.id as approver_user_id,
  dwc.is_active
FROM document_workflow_configs dwc
JOIN document_types dt ON dwc.document_type_id = dt.id
JOIN users u ON dwc.user_id = u.id
WHERE dwc.stage_type = 'APPROVAL'
  AND dwc.document_type_id = (
    SELECT document_type_id FROM outgoing_letters ORDER BY created_at DESC LIMIT 1
  );

-- 4. Check pending approvals (what approver should see)
SELECT 
  '=== PENDING APPROVALS ===' as info,
  ol.subject,
  ol.status as letter_status,
  lwt.status as tracking_status,
  u.nama as approver,
  u.email as approver_email,
  u.id as approver_user_id
FROM letter_workflow_trackings lwt
JOIN outgoing_letters ol ON lwt.letter_id = ol.id
JOIN users u ON lwt.assigned_to_id = u.id
WHERE lwt.stage_type = 'APPROVAL'
  AND lwt.status = 'PENDING'
ORDER BY ol.created_at DESC;

-- ============================================
-- INTERPRETATION GUIDE
-- ============================================
-- Query 1: Latest letter info
--   ✅ Status should be 'REVIEWED' if all reviewers approved
--   ❌ If 'SUBMITTED_TO_REVIEW' = not all reviewers approved yet
--
-- Query 2: All trackings for the letter
--   ✅ Should see 2 REVIEW trackings with status 'APPROVED'
--   ✅ Should see 1+ APPROVAL trackings with status 'PENDING'
--   ❌ If no APPROVAL trackings = BUG in createApprovalStageTrackings
--
-- Query 3: Approval configs
--   ✅ Should show who is configured as approver
--   ❌ If empty = no approver configured for this document type
--
-- Query 4: Pending approvals
--   ✅ If has data = approval trackings exist, frontend issue
--   ❌ If empty = approval trackings not created, backend issue
-- ============================================
