-- ============================================================================
-- Phase 5: Improved review_letter RPC Function
-- ============================================================================
-- Improvements:
-- 1. Better error handling with detailed logging
-- 2. Prevent duplicate reviews
-- 3. Better status transition validation
-- ============================================================================

-- Drop existing function
DROP FUNCTION IF EXISTS review_letter(UUID, UUID, TEXT, TEXT);

-- Create improved function
CREATE OR REPLACE FUNCTION review_letter(
  p_letter_id UUID,
  p_user_id UUID,
  p_action TEXT,
  p_notes TEXT DEFAULT NULL
) RETURNS JSONB AS $$
DECLARE
  v_letter RECORD;
  v_history RECORD;
  v_all_approved BOOLEAN;
  v_document_type_id INTEGER;
  v_existing_action TEXT;
BEGIN
  -- 1. Validation
  SELECT * INTO v_letter FROM outgoing_letters WHERE id = p_letter_id;
  
  IF v_letter IS NULL THEN
    RAISE NOTICE 'Letter not found: %', p_letter_id;
    RETURN jsonb_build_object('success', false, 'error', 'Letter not found');
  END IF;

  IF v_letter.status != 'SUBMITTED_TO_REVIEW' THEN
    RAISE NOTICE 'Invalid status for review: % (expected: SUBMITTED_TO_REVIEW)', v_letter.status;
    RETURN jsonb_build_object('success', false, 'error', 'Letter is not in review stage. Current status: ' || v_letter.status);
  END IF;

  -- 2. Check if user already reviewed this letter (prevent duplicates)
  SELECT action_type INTO v_existing_action
  FROM letter_histories
  WHERE letter_id = p_letter_id
    AND assigned_to_id = p_user_id
    AND stage_type = 'REVIEW'
    AND to_status IS NOT NULL
  ORDER BY created_at DESC
  LIMIT 1;

  IF v_existing_action IS NOT NULL THEN
    RAISE NOTICE 'User already reviewed this letter: %', p_user_id;
    RETURN jsonb_build_object('success', false, 'error', 'You have already reviewed this letter');
  END IF;

  -- 3. Get pending review entry
  SELECT * INTO v_history 
  FROM letter_histories 
  WHERE letter_id = p_letter_id 
    AND assigned_to_id = p_user_id 
    AND stage_type = 'REVIEW'
    AND to_status IS NULL
  ORDER BY created_at DESC
  LIMIT 1;

  IF v_history IS NULL THEN
    RAISE NOTICE 'User not assigned to review: %', p_user_id;
    RETURN jsonb_build_object('success', false, 'error', 'You are not assigned to review this letter or already reviewed');
  END IF;

  v_document_type_id := v_letter.document_type_id;
  RAISE NOTICE 'Processing review: letter=%, user=%, action=%', p_letter_id, p_user_id, p_action;

  -- 4. Handle REQUEST_REVISION
  IF p_action = 'REQUEST_REVISION' THEN
    -- Update the history entry
    UPDATE letter_histories
    SET 
      action_by_id = p_user_id,
      action_type = 'REVISION_REQUESTED',
      from_status = 'SUBMITTED_TO_REVIEW',
      to_status = 'REVISION_REQUESTED',
      notes = COALESCE(p_notes, 'Revision requested'),
      updated_at = NOW()
    WHERE id = v_history.id;

    -- Update letter status
    UPDATE outgoing_letters 
    SET status = 'REVISION_REQUESTED', updated_at = NOW()
    WHERE id = p_letter_id;

    RAISE NOTICE 'Revision requested successfully: %', p_letter_id;
    RETURN jsonb_build_object('success', true, 'status', 'REVISION_REQUESTED');

  -- 5. Handle APPROVE
  ELSIF p_action = 'APPROVE' THEN
    -- Update the history entry
    UPDATE letter_histories
    SET 
      action_by_id = p_user_id,
      action_type = 'APPROVED_REVIEW',
      from_status = 'SUBMITTED_TO_REVIEW',
      to_status = 'APPROVED',
      notes = COALESCE(p_notes, 'Review approved'),
      updated_at = NOW()
    WHERE id = v_history.id;

    -- Check if ALL reviewers approved
    SELECT NOT EXISTS (
      SELECT 1 FROM letter_histories 
      WHERE letter_id = p_letter_id 
        AND stage_type = 'REVIEW' 
        AND to_status IS NULL
    ) INTO v_all_approved;

    IF v_all_approved THEN
      -- All approved - move to REVIEWED status
      UPDATE outgoing_letters 
      SET status = 'REVIEWED', updated_at = NOW()
      WHERE id = p_letter_id;

      -- Create approval stage entries
      INSERT INTO letter_histories (
        letter_id, assigned_to_id, stage_type, sequence, action_type, from_status, to_status, notes, created_at
      )
      SELECT 
        p_letter_id,
        aws.user_id,
        'APPROVAL',
        aws.sequence,
        'SUBMITTED',
        'REVIEWED',
        NULL,
        'Submitted for approval - Stage: ' || aws.stage_name,
        NOW()
      FROM document_workflow_stages aws
      WHERE aws.document_type_id = v_document_type_id
        AND aws.stage_type = 'APPROVAL'
        AND aws.is_active = true;

      RAISE NOTICE 'All approved, moved to REVIEWED: %', p_letter_id;
      RETURN jsonb_build_object('success', true, 'status', 'REVIEWED');
    ELSE
      -- Waiting for other reviewers
      RAISE NOTICE 'Approved, waiting for other reviewers: %', p_letter_id;
      RETURN jsonb_build_object('success', true, 'status', 'SUBMITTED_TO_REVIEW', 'message', 'Approved - waiting for other reviewers');
    END IF;

  ELSE
    RAISE NOTICE 'Invalid action: %', p_action;
    RETURN jsonb_build_object('success', false, 'error', 'Invalid action: ' || p_action);
  END IF;

EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'Error in review_letter: % (SQLSTATE: %)', SQLERRM, SQLSTATE;
  RETURN jsonb_build_object('success', false, 'error', 'Internal error: ' || SQLERRM);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Verify function was created
SELECT 
  p.proname as function_name,
  pg_get_function_arguments(p.oid) as arguments
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE p.proname = 'review_letter'
  AND n.nspname = 'public';
