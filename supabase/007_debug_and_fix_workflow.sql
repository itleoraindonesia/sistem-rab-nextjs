-- ============================================================================
-- Debug & Fix: Submit to Review & Request Review Errors
-- Date: 2026-02-27
-- ============================================================================

-- ============================================================================
-- DIAGNOSTIC QUERIES
-- Run ini satu per satu untuk diagnosa masalah
-- ============================================================================

-- 1. Cek document_workflow_stages (apakah ada konfigurasi?)
SELECT
  ws.id,
  ws.stage_name,
  ws.stage_type,
  ws.sequence,
  ws.is_active,
  ws.completion_rule,
  ws.assignees,
  dt.name as document_type_name,
  dt.id as document_type_id
FROM document_workflow_stages ws
JOIN document_types dt ON ws.document_type_id = dt.id
ORDER BY dt.id, ws.sequence;

-- 2. Cek letter_histories untuk surat terbaru
SELECT
  lh.id,
  lh.action_type,
  lh.stage_type,
  lh.from_status,
  lh.to_status,
  lh.assigned_to_id,
  u.nama as assigned_to_name,
  lh.created_at
FROM letter_histories lh
LEFT JOIN users u ON lh.assigned_to_id = u.id
WHERE lh.letter_id = (
  SELECT id FROM outgoing_letters ORDER BY created_at DESC LIMIT 1
)
ORDER BY lh.created_at;

-- 3. Cek pending reviews untuk semua reviewer
SELECT
  lh.id,
  lh.letter_id,
  lh.stage_type,
  lh.to_status,
  u.email as reviewer_email,
  u.nama as reviewer_name,
  ol.subject,
  ol.status as letter_status
FROM letter_histories lh
JOIN users u ON lh.assigned_to_id = u.id
JOIN outgoing_letters ol ON lh.letter_id = ol.id
WHERE lh.stage_type = 'REVIEW'
  AND lh.to_status IS NULL
ORDER BY lh.created_at DESC;

-- 4. Check apakah submit_letter_for_review berhasil buat pending tasks
-- (Ganti 'YOUR_LETTER_ID' dengan ID surat yang bermasalah)
/*
SELECT
  lh.*,
  u.email as assigned_to_email
FROM letter_histories lh
LEFT JOIN users u ON lh.assigned_to_id = u.id
WHERE lh.letter_id = 'YOUR_LETTER_ID'
ORDER BY lh.created_at;
*/
