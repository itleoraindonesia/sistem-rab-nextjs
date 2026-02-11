-- ============================================================================
-- Debug: Check complete letter data and structure
-- ============================================================================

-- Check letter data directly
SELECT 
  'Letter Data' as info,
  id,
  status,
  document_type_id,
  subject,
  body,
  opening,
  closing,
  letter_date,
  created_at,
  updated_at,
  recipient_name,
  recipient_company,
  recipient_email,
  recipient_whatsapp,
  recipient_address
FROM outgoing_letters
WHERE id = 'ac843669-dfe3-4a35-b951-e5b418da67ff';

-- Check if recipient_name is actually NULL
SELECT 
  'Check recipient_name' as check,
  recipient_name,
  CASE WHEN recipient_name IS NULL THEN 'NULL' ELSE 'NOT NULL' END as is_null
FROM outgoing_letters
WHERE id = 'ac843669-dfe3-4a35-b951-e5b418da67ff';

-- Check all letter history entries with full letter data
SELECT 
  'Full History Check' as info,
  lh.id as history_id,
  lh.action_type,
  lh.to_status,
  lh.stage_type,
  lh.assigned_to_id,
  ol.id as letter_id,
  ol.status as letter_status,
  ol.subject,
  ol.recipient_name,
  ol.letter_date,
  ol.body,
  ol.created_at
FROM letter_histories lh
LEFT JOIN outgoing_letters ol ON lh.letter_id = ol.id
WHERE lh.letter_id = 'ac843669-dfe3-4a35-b951-e5b418da67ff'
ORDER BY lh.created_at DESC;
