-- Create review_letter RPC function
-- For reviewers to approve or request revision on letters
-- Uses correct enum values: SUBMITTED_TO_REVIEW, REVIEWED, REVISION_REQUESTED

CREATE OR REPLACE FUNCTION review_letter(
  p_letter_id UUID,
  p_user_id UUID,
  p_action TEXT,           -- 'APPROVE' | 'REQUEST_REVISION'
  p_notes TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_current_status TEXT;
  v_new_status TEXT;
  v_new_action_type TEXT;
  v_pending_review_id BIGINT;
  v_remaining_reviews INT := 0;
BEGIN
  RAISE NOTICE 'Starting review_letter for letter: %, user: %, action: %', p_letter_id, p_user_id, p_action;

  -- 1. Get current letter status
  SELECT status INTO v_current_status
  FROM outgoing_letters
  WHERE id = p_letter_id;  
  IF v_current_status IS NULL THEN
    RAISE NOTICE 'Letter not found: %', p_letter_id;
    RETURN jsonb_build_object(
      'success', false, 
      'error', 'Letter not found'
    );
  END IF;  
  IF v_current_status != 'SUBMITTED_TO_REVIEW' THEN
    RAISE NOTICE 'Letter not in review state. Current status: %', v_current_status;
    RETURN jsonb_build_object(
      'success', false, 
      'error', 'Letter is not in review state',
      'current_status', v_current_status
    );
  END IF;  
  -- 2. Determine new status and action type based on action
  IF p_action = 'REQUEST_REVISION' THEN
    v_new_status := 'REVISION_REQUESTED';
    v_new_action_type := 'REVISION_REQUESTED';
  ELSIF p_action = 'APPROVE' THEN
    v_new_status := 'REVIEWED';
    v_new_action_type := 'APPROVED_REVIEW';
  ELSE
    RAISE NOTICE 'Invalid action: %', p_action;
    RETURN jsonb_build_object(
      'success', false, 
      'error', 'Invalid action: ' || p_action
    );
  END IF;  
  -- 3. Find pending review entry for this user
  SELECT id INTO v_pending_review_id
  FROM letter_histories
  WHERE letter_id = p_letter_id
    AND assigned_to_id = p_user_id
    AND stage_type = 'REVIEW'
    AND to_status IS NULL
  LIMIT 1;  
  IF v_pending_review_id IS NULL THEN
    RAISE NOTICE 'No pending review found for user %', p_user_id;
    RETURN jsonb_build_object(
      'success', false, 
      'error', 'No pending review found for this user'
    );
  END IF;  
  -- 4. Update pending review entry with action taken
  UPDATE letter_histories
  SET action_by_id = p_user_id,
      action_type = v_new_action_type,
      from_status = 'SUBMITTED_TO_REVIEW',
      to_status = v_new_status,
      notes = p_notes,
      updated_at = NOW()
  WHERE id = v_pending_review_id;  
  RAISE NOTICE 'Updated history entry % with status %', v_pending_review_id, v_new_status;  
  -- 5. Check if all reviewers have acted (no more pending reviews)
  SELECT COUNT(*) INTO v_remaining_reviews
  FROM letter_histories
  WHERE letter_id = p_letter_id
    AND stage_type = 'REVIEW'
    AND to_status IS NULL;  
  -- 6. Update letter status only if all reviewers have acted
  IF v_remaining_reviews = 0 THEN
    UPDATE outgoing_letters
    SET status = v_new_status,
        updated_at = NOW()
    WHERE id = p_letter_id;    
    RAISE NOTICE 'Updated letter % status to %', p_letter_id, v_new_status;    
    -- 7. Create main history entry for status change
    INSERT INTO letter_histories (
      letter_id,
      action_by_id,
      action_type,
      from_status,
      to_status,
      notes,
      created_at
    ) VALUES (
      p_letter_id,
      p_user_id,
      v_new_action_type,
      'SUBMITTED_TO_REVIEW',
      v_new_status,
      'Letter ' || LOWER(p_action) || ' by all reviewers',
      NOW()
    );    
    RAISE NOTICE 'Created history entry for status change to %', v_new_status;
  END IF;  
  -- 8. Return success response
  RAISE NOTICE 'Review completed successfully. Status: %', v_new_status;  
  RETURN jsonb_build_object(
    'success', true, 
    'status', v_new_status,
    'message', 'Letter reviewed successfully',
    'action', p_action
  );  
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'Error in review_letter: %', SQLERRM;
  RETURN jsonb_build_object(
    'success', false, 
    'error', SQLERRM, 
    'detail', SQLSTATE
  );
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION review_letter(UUID, UUID, TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION review_letter(UUID, UUID, TEXT, TEXT) TO service_role;

-- Add comment to document the function
COMMENT ON FUNCTION review_letter IS 'Reviewer action: APPROVE (moves to REVIEWED) or REQUEST_REVISION (moves to REVISION_REQUESTED). Only allows review when status is SUBMITTED_TO_REVIEW.';
