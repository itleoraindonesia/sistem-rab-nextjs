-- Debug: Cek kenapa status masih REVIEWED (Menunggu Approval) meski sudah approve
-- Jalankan query ini satu per satu di Supabase SQL Editor

-- ==========================================================================
-- 1. Cek status surat terbaru beserta history lengkap
-- ==========================================================================
SELECT 
  ol.id,
  ol.subject,
  ol.status,
  ol.document_number,
  ol.updated_at,
  ol.approved_at
FROM outgoing_letters ol
ORDER BY ol.updated_at DESC
LIMIT 10;

-- ==========================================================================
-- 2. Cek history surat yang bermasalah (ganti <LETTER_ID> dengan id dari query 1)
-- ==========================================================================
SELECT 
  lh.id,
  lh.action_type,
  lh.stage_type,
  lh.from_status,
  lh.to_status,
  lh.assigned_to_id,
  u_assigned.nama   AS assigned_to_nama,
  u_assigned.email  AS assigned_to_email,
  u_action.nama     AS action_by_nama,
  lh.notes,
  lh.created_at
FROM letter_histories lh
LEFT JOIN users u_assigned ON lh.assigned_to_id = u_assigned.id
LEFT JOIN users u_action   ON lh.action_by_id   = u_action.id
WHERE lh.letter_id = (
  SELECT id FROM outgoing_letters ORDER BY updated_at DESC LIMIT 1
)
ORDER BY lh.created_at;

-- ==========================================================================
-- 3. Cek APPROVAL stage workflow untuk document type surat tersebut
-- ==========================================================================
SELECT 
  ws.id,
  ws.stage_name,
  ws.stage_type,
  ws.sequence,
  ws.assignees,
  ws.is_active,
  dt.name AS document_type_name
FROM document_workflow_stages ws
JOIN document_types dt ON ws.document_type_id = dt.id
WHERE ws.document_type_id = (
  SELECT document_type_id FROM outgoing_letters ORDER BY updated_at DESC LIMIT 1
)
AND ws.stage_type = 'APPROVAL'
ORDER BY ws.sequence;

-- ==========================================================================
-- 4. Cek apakah user yang ada di assignees cocok dengan user yang ada di DB
-- ==========================================================================
WITH approver_config AS (
  SELECT 
    jsonb_array_elements(ws.assignees) ->> 'user_id' AS configured_user_id
  FROM document_workflow_stages ws
  WHERE ws.document_type_id = (
    SELECT document_type_id FROM outgoing_letters ORDER BY updated_at DESC LIMIT 1
  )
  AND ws.stage_type = 'APPROVAL'
  AND ws.is_active = true
)
SELECT 
  ac.configured_user_id,
  u.nama,
  u.email,
  u.is_active
FROM approver_config ac
LEFT JOIN users u ON u.id = ac.configured_user_id::uuid;

-- ==========================================================================
-- 5. Cek pending approval entries (yang seharusnya di-complete saat approve)
-- ==========================================================================
SELECT 
  lh.id,
  lh.action_type,
  lh.to_status,
  lh.stage_type,
  lh.assigned_to_id,
  u.nama AS assigned_to_nama,
  u.email AS assigned_to_email
FROM letter_histories lh
LEFT JOIN users u ON lh.assigned_to_id = u.id
WHERE lh.letter_id = (
  SELECT id FROM outgoing_letters ORDER BY updated_at DESC LIMIT 1
)
AND lh.stage_type = 'APPROVAL'
ORDER BY lh.created_at;

-- ==========================================================================
-- 6. Coba manual approve (GANTI <USER_ID> dan <LETTER_ID>!)
-- Ini untuk test apakah RPC berhasil
-- ==========================================================================
-- SELECT review_letter(
--   'APPROVED_FINAL',
--   '<LETTER_ID>'::uuid,
--   '<USER_ID>'::uuid,
--   null
-- );
