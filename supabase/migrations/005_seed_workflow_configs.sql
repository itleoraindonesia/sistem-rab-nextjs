-- ============================================
-- SEED WORKFLOW CONFIGURATIONS
-- ============================================
-- Purpose: Configure parallel review workflow for each document type
-- Workflow: 2 parallel reviewers (ALL must approve) → 1 approver
-- ============================================

-- Get test user IDs
DO $$
DECLARE
  v_reviewer1_id TEXT := '00000000-0000-0000-0000-000000000001';
  v_reviewer2_id TEXT := '00000000-0000-0000-0000-000000000002';
  v_approver1_id TEXT := '00000000-0000-0000-0000-000000000003';
  v_doc_type_id INT;
BEGIN
  -- For SPH (Surat Penawaran Harga)
  SELECT id INTO v_doc_type_id FROM document_types WHERE code = 'SPH';
  
  -- Review Stage (Parallel)
  INSERT INTO document_workflow_configs 
  (document_type_id, stage_type, sequence, user_id, review_mode, completion_rule, is_required, is_active, created_at, updated_at)
  VALUES
  (v_doc_type_id, 'REVIEW', 1, v_reviewer1_id, 'PARALLEL', 'ALL', true, true, NOW(), NOW()),
  (v_doc_type_id, 'REVIEW', 1, v_reviewer2_id, 'PARALLEL', 'ALL', true, true, NOW(), NOW()),
  -- Approval Stage
  (v_doc_type_id, 'APPROVAL', 2, v_approver1_id, NULL, NULL, true, true, NOW(), NOW());
  
  -- For PO (Purchase Order)
  SELECT id INTO v_doc_type_id FROM document_types WHERE code = 'PO';
  
  INSERT INTO document_workflow_configs 
  (document_type_id, stage_type, sequence, user_id, review_mode, completion_rule, is_required, is_active, created_at, updated_at)
  VALUES
  (v_doc_type_id, 'REVIEW', 1, v_reviewer1_id, 'PARALLEL', 'ALL', true, true, NOW(), NOW()),
  (v_doc_type_id, 'REVIEW', 1, v_reviewer2_id, 'PARALLEL', 'ALL', true, true, NOW(), NOW()),
  (v_doc_type_id, 'APPROVAL', 2, v_approver1_id, NULL, NULL, true, true, NOW(), NOW());
  
  -- For INV (Invoice)
  SELECT id INTO v_doc_type_id FROM document_types WHERE code = 'INV';
  
  INSERT INTO document_workflow_configs 
  (document_type_id, stage_type, sequence, user_id, review_mode, completion_rule, is_required, is_active, created_at, updated_at)
  VALUES
  (v_doc_type_id, 'REVIEW', 1, v_reviewer1_id, 'PARALLEL', 'ALL', true, true, NOW(), NOW()),
  (v_doc_type_id, 'REVIEW', 1, v_reviewer2_id, 'PARALLEL', 'ALL', true, true, NOW(), NOW()),
  (v_doc_type_id, 'APPROVAL', 2, v_approver1_id, NULL, NULL, true, true, NOW(), NOW());
  
  -- For SKT (Surat Kontrak)
  SELECT id INTO v_doc_type_id FROM document_types WHERE code = 'SKT';
  
  INSERT INTO document_workflow_configs 
  (document_type_id, stage_type, sequence, user_id, review_mode, completion_rule, is_required, is_active, created_at, updated_at)
  VALUES
  (v_doc_type_id, 'REVIEW', 1, v_reviewer1_id, 'PARALLEL', 'ALL', true, true, NOW(), NOW()),
  (v_doc_type_id, 'REVIEW', 1, v_reviewer2_id, 'PARALLEL', 'ALL', true, true, NOW(), NOW()),
  (v_doc_type_id, 'APPROVAL', 2, v_approver1_id, NULL, NULL, true, true, NOW(), NOW());
  
  -- For MOU (Memorandum of Understanding)
  SELECT id INTO v_doc_type_id FROM document_types WHERE code = 'MOU';
  
  INSERT INTO document_workflow_configs 
  (document_type_id, stage_type, sequence, user_id, review_mode, completion_rule, is_required, is_active, created_at, updated_at)
  VALUES
  (v_doc_type_id, 'REVIEW', 1, v_reviewer1_id, 'PARALLEL', 'ALL', true, true, NOW(), NOW()),
  (v_doc_type_id, 'REVIEW', 1, v_reviewer2_id, 'PARALLEL', 'ALL', true, true, NOW(), NOW()),
  (v_doc_type_id, 'APPROVAL', 2, v_approver1_id, NULL, NULL, true, true, NOW(), NOW());
  
  -- For MEMO (Memo Internal)
  SELECT id INTO v_doc_type_id FROM document_types WHERE code = 'MEMO';
  
  INSERT INTO document_workflow_configs 
  (document_type_id, stage_type, sequence, user_id, review_mode, completion_rule, is_required, is_active, created_at, updated_at)
  VALUES
  (v_doc_type_id, 'REVIEW', 1, v_reviewer1_id, 'PARALLEL', 'ALL', true, true, NOW(), NOW()),
  (v_doc_type_id, 'REVIEW', 1, v_reviewer2_id, 'PARALLEL', 'ALL', true, true, NOW(), NOW()),
  (v_doc_type_id, 'APPROVAL', 2, v_approver1_id, NULL, NULL, true, true, NOW(), NOW());
  
  -- For EDM (Edaran)
  SELECT id INTO v_doc_type_id FROM document_types WHERE code = 'EDM';
  
  INSERT INTO document_workflow_configs 
  (document_type_id, stage_type, sequence, user_id, review_mode, completion_rule, is_required, is_active, created_at, updated_at)
  VALUES
  (v_doc_type_id, 'REVIEW', 1, v_reviewer1_id, 'PARALLEL', 'ALL', true, true, NOW(), NOW()),
  (v_doc_type_id, 'REVIEW', 1, v_reviewer2_id, 'PARALLEL', 'ALL', true, true, NOW(), NOW()),
  (v_doc_type_id, 'APPROVAL', 2, v_approver1_id, NULL, NULL, true, true, NOW(), NOW());
  
  -- For SPK (Surat Perintah Kerja)
  SELECT id INTO v_doc_type_id FROM document_types WHERE code = 'SPK';
  
  INSERT INTO document_workflow_configs 
  (document_type_id, stage_type, sequence, user_id, review_mode, completion_rule, is_required, is_active, created_at, updated_at)
  VALUES
  (v_doc_type_id, 'REVIEW', 1, v_reviewer1_id, 'PARALLEL', 'ALL', true, true, NOW(), NOW()),
  (v_doc_type_id, 'REVIEW', 1, v_reviewer2_id, 'PARALLEL', 'ALL', true, true, NOW(), NOW()),
  (v_doc_type_id, 'APPROVAL', 2, v_approver1_id, NULL, NULL, true, true, NOW(), NOW());
  
  -- For SR (Surat Referensi)
  SELECT id INTO v_doc_type_id FROM document_types WHERE code = 'SR';
  
  INSERT INTO document_workflow_configs 
  (document_type_id, stage_type, sequence, user_id, review_mode, completion_rule, is_required, is_active, created_at, updated_at)
  VALUES
  (v_doc_type_id, 'REVIEW', 1, v_reviewer1_id, 'PARALLEL', 'ALL', true, true, NOW(), NOW()),
  (v_doc_type_id, 'REVIEW', 1, v_reviewer2_id, 'PARALLEL', 'ALL', true, true, NOW(), NOW()),
  (v_doc_type_id, 'APPROVAL', 2, v_approver1_id, NULL, NULL, true, true, NOW(), NOW());
END $$;

-- ============================================
-- VERIFY WORKFLOW CONFIGURATIONS
-- ============================================

SELECT 
  dt.code as document_type,
  dt.name as document_name,
  dwc.stage_type,
  dwc.sequence,
  u.username as assigned_to,
  u.email,
  dwc.review_mode,
  dwc.completion_rule,
  dwc.is_required,
  dwc.is_active
FROM document_workflow_configs dwc
JOIN document_types dt ON dwc.document_type_id = dt.id
JOIN users u ON dwc.user_id = u.id
ORDER BY dt.code, dwc.sequence, dwc.id;

-- ============================================
-- WORKFLOW CONFIGURATION SUMMARY
-- ============================================
-- Each document type has:
-- - Sequence 1: REVIEW stage with 2 parallel reviewers (reviewer1, reviewer2)
-- - Sequence 2: APPROVAL stage with 1 approver (approver1)
-- - Completion rule: ALL (both reviewers must approve)
-- ============================================