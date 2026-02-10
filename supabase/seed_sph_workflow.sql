-- ============================================================================
-- Seed Workflow Config for SPH (Surat Penawaran Harga)
-- ============================================================================
-- Document Type ID: 1 (SPH)
-- Workflow:
-- 1. REVIEW   (Sequence 1) -> Assigned to Reviewer 1
-- 2. APPROVAL (Sequence 2) -> Assigned to Approver
-- ============================================================================

DO $$
DECLARE
  v_doc_type_id INT := 1; -- SPH
  v_reviewer_id UUID;
  v_approver_id UUID;
BEGIN
  -- 1. Get User IDs (Using specific IDs you provided, with fallback to email lookup)
  
  -- Reviewer 1
  SELECT id INTO v_reviewer_id FROM users WHERE id = '2f05da18-d6c6-45c1-a86a-700cb51255f0';
  IF v_reviewer_id IS NULL THEN
    SELECT id INTO v_reviewer_id FROM users WHERE email = 'reviewer1@test.com' LIMIT 1;
  END IF;

  -- Approver
  SELECT id INTO v_approver_id FROM users WHERE id = '9539f526-e60a-4397-a0df-ba5d7c5c9346';
  IF v_approver_id IS NULL THEN
    SELECT id INTO v_approver_id FROM users WHERE email = 'approver@test.com' LIMIT 1;
  END IF;

  -- Validate Users
  IF v_reviewer_id IS NULL OR v_approver_id IS NULL THEN
    RAISE EXCEPTION 'Reviewer or Approver user not found. Please ensure users exist.';
  END IF;

  -- 2. Clear existing configs for this document type to avoid duplicates
  DELETE FROM document_workflow_configs WHERE document_type_id = v_doc_type_id;

  RAISE NOTICE 'Cleared existing configs for Document Type ID: %', v_doc_type_id;

  -- 3. Insert New Workflow Configs
  
  -- Stage 1: REVIEW
  INSERT INTO document_workflow_configs (
    document_type_id,
    stage_type,
    sequence,
    user_id,
    is_active,
    created_at
  ) VALUES (
    v_doc_type_id,
    'REVIEW',
    1,
    v_reviewer_id,
    true,
    NOW()
  );
  RAISE NOTICE 'Added REVIEW config for User ID: %', v_reviewer_id;

  -- Stage 2: APPROVAL
  INSERT INTO document_workflow_configs (
    document_type_id,
    stage_type,
    sequence,
    user_id,
    is_active,
    created_at
  ) VALUES (
    v_doc_type_id,
    'APPROVAL',
    2,
    v_approver_id,
    true,
    NOW()
  );
  RAISE NOTICE 'Added APPROVAL config for User ID: %', v_approver_id;

  RAISE NOTICE '==================================================';
  RAISE NOTICE 'Workflow setup for SPH (ID 1) completed successfully.';
  RAISE NOTICE '==================================================';
  
END $$;
