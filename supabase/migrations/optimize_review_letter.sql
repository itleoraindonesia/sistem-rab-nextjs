-- ============================================================================
-- Optimize Review Letter Logic (Server-Side Transaction)
-- ============================================================================
-- Moves the complex review logic to a stored procedure to:
-- 1. Reduce network round trips (speed up "Mengirim..." state)
-- 2. Ensure data consistency (atomic transaction)
-- 3. Handle race conditions better
-- ============================================================================

CREATE OR REPLACE FUNCTION review_letter(
  p_letter_id UUID,
  p_user_id UUID,
  p_action TEXT, -- 'APPROVE' or 'REQUEST_REVISION'
  p_notes TEXT DEFAULT NULL
) RETURNS JSONB AS $$
DECLARE
  v_letter RECORD;
  v_tracking RECORD;
  v_all_approved BOOLEAN;
  v_config RECORD;
  v_new_status TEXT;
  v_history_notes TEXT;
BEGIN
  -- 1. Validation & Setup
  -- Get letter details
  SELECT * INTO v_letter FROM outgoing_letters WHERE id = p_letter_id;
  
  IF v_letter IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Letter not found');
  END IF;

  IF v_letter.status != 'SUBMITTED_TO_REVIEW' THEN
    RETURN jsonb_build_object('success', false, 'error', 'Letter is not in review stage');
  END IF;

  -- Get user's tracking for this letter
  SELECT * INTO v_tracking 
  FROM letter_workflow_trackings 
  WHERE letter_id = p_letter_id 
    AND assigned_to_id = p_user_id 
    AND stage_type = 'REVIEW'
    AND status = 'PENDING';

  IF v_tracking IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'You are not assigned to review this letter or already reviewed');
  END IF;

  -- 2. Update Tracking Status
  UPDATE letter_workflow_trackings
  SET 
    status = CASE WHEN p_action = 'APPROVE' THEN 'APPROVED' ELSE 'REQUESTED_REVISION' END,
    notes = p_notes,
    action_at = NOW()
  WHERE id = v_tracking.id;

  -- 3. Handle Actions
  IF p_action = 'REQUEST_REVISION' THEN
    -- =================================================
    -- CASE: REQUEST REVISION
    -- =================================================
    
    -- Update letter status
    UPDATE outgoing_letters 
    SET status = 'NEEDS_REVISION', updated_at = NOW()
    WHERE id = p_letter_id;

    -- Insert history
    INSERT INTO letter_histories (
      letter_id, action_by_id, action_type, from_status, to_status, notes
    ) VALUES (
      p_letter_id, p_user_id, 'REVISION_REQUESTED', 'SUBMITTED_TO_REVIEW', 'NEEDS_REVISION', p_notes
    );
    
    RETURN jsonb_build_object('success', true, 'status', 'NEEDS_REVISION');

  ELSE
    -- =================================================
    -- CASE: APPROVE
    -- =================================================
    
    -- Check if ALL reviewers have approved
    -- Logic: Count pending reviewers. If 0, then ALL APPROVED.
    -- (We already updated current user's status above)
    SELECT NOT EXISTS (
      SELECT 1 FROM letter_workflow_trackings 
      WHERE letter_id = p_letter_id 
        AND stage_type = 'REVIEW' 
        AND status != 'APPROVED'
    ) INTO v_all_approved;

    IF v_all_approved THEN
      -- ALL APPROVED -> Move to REVIEWED status
      UPDATE outgoing_letters 
      SET status = 'REVIEWED', updated_at = NOW()
      WHERE id = p_letter_id;

      -- Create Approval Stage Trackings
      -- This ensures approvers only get notified/assigned AFTER review phase is complete
      INSERT INTO letter_workflow_trackings (
        letter_id, assigned_to_id, stage_type, sequence, status, created_at
      )
      SELECT 
        p_letter_id,
        user_id,
        'APPROVAL',
        sequence,
        'PENDING',
        NOW()
      FROM document_workflow_configs
      WHERE document_type_id = v_letter.document_type_id
        AND stage_type = 'APPROVAL'
        AND is_active = true;

      -- Insert history
      INSERT INTO letter_histories (
        letter_id, action_by_id, action_type, from_status, to_status, notes
      ) VALUES (
        p_letter_id, p_user_id, 'APPROVED_REVIEW', 'SUBMITTED_TO_REVIEW', 'REVIEWED', 
        'All reviewers approved - moved to approval stage'
      );

      RETURN jsonb_build_object('success', true, 'status', 'REVIEWED');

    ELSE
      -- STILL PENDING (Waiting for other reviewers)
      -- Status remains SUBMITTED_TO_REVIEW
      
      -- Insert history
      INSERT INTO letter_histories (
        letter_id, action_by_id, action_type, from_status, to_status, notes
      ) VALUES (
        p_letter_id, p_user_id, 'APPROVED_REVIEW', 'SUBMITTED_TO_REVIEW', 'SUBMITTED_TO_REVIEW', 
        COALESCE(p_notes, 'Reviewer approved - waiting for others')
      );

      RETURN jsonb_build_object('success', true, 'status', 'SUBMITTED_TO_REVIEW');
    END IF;

  END IF;

EXCEPTION WHEN OTHERS THEN
  -- Rollback will happen automatically
  RETURN jsonb_build_object('success', false, 'error', SQLERRM);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
