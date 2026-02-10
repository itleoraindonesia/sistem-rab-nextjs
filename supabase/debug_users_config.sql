-- CHECK USERS & DOCUMENT TYPES
-- 1. Get available users
SELECT id, email, nama, role FROM users LIMIT 5;

-- 2. Get document types
SELECT id, name, code FROM document_types;

-- 3. Check existing configs (if any)
SELECT 
  dt.name as doc_type,
  dwc.stage_type,
  dwc.sequence,
  u.nama as assigned_to
FROM document_workflow_configs dwc
JOIN document_types dt ON dwc.document_type_id = dt.id
JOIN users u ON dwc.user_id = u.id
ORDER BY dt.name, dwc.sequence;
