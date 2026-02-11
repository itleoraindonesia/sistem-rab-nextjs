-- Update submit_letter_for_review RPC to use new schema
-- Uses: document_workflow_stages + letter_histories (with assigned_to_id)

DROP FUNCTION IF EXISTS submit_letter_for_review(UUID, UUID);

CREATE OR REPLACE FUNCTION submit_letter_for_review(
  p_letter_id UUID,
  p_user_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_letter_document_type_id BIGINT;
  v_letter_status TEXT;
  v_stage RECORD;
  v_assignee JSONB;
  v_history_count INT := 0;
BEGIN
  RAISE NOTICE 'Starting submit_letter_for_review for letter: %, user: %', p_letter_id, p_user_id;

  -- 1. Get and validate letter
  SELECT document_type_id, status 
  INTO v_letter_document_type_id, v_letter_status
  FROM outgoing_letters
  WHERE id = p_letter_id;

  IF v_letter_document_type_id IS NULL THEN
    RAISE EXCEPTION 'Letter not found: %', p_letter_id;
  END IF;

  IF v_letter_status != 'DRAFT' THEN
    RAISE EXCEPTION 'Only draft letters can be submitted for review. Current status: %', v_letter_status;
  END IF;

  -- 2. Get workflow stages for REVIEW
  FOR v_stage IN (
    SELECT id, stage_name, sequence, assignees
    FROM document_workflow_stages
    WHERE document_type_id = v_letter_document_type_id
      AND stage_type = 'REVIEW'
      AND is_active = true
    ORDER BY sequence
  ) LOOP
    -- 3. Loop through assignees in each stage
    FOR v_assignee IN (
      SELECT * FROM jsonb_array_elements(v_stage.assignees)
    ) LOOP
      -- Insert history entry for each reviewer
      INSERT INTO letter_histories (
        letter_id,
        action_by_id,
        assigned_to_id,
        action_type,
        from_status,
        to_status,
        stage_type,
        sequence,
        notes,
        created_at
      ) VALUES (
        p_letter_id,
        p_user_id,
        (v_assignee->>'user_id')::UUID,
        'SUBMITTED',
        'DRAFT',
        NULL,
        'REVIEW',
        v_stage.sequence,
        'Submitted for review - Stage: ' || v_stage.stage_name,
        NOW()
      );
      
      v_history_count := v_history_count + 1;
    END LOOP;
  END LOOP;

  IF v_history_count = 0 THEN
    RAISE EXCEPTION 'No reviewers found in workflow configuration for this document type';
  END IF;

  -- 4. Update letter status
  UPDATE outgoing_letters
  SET status = 'SUBMITTED_TO_REVIEW',
      updated_at = NOW()
  WHERE id = p_letter_id;

  -- 5. Create main history entry
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
    'SUBMITTED',
    'DRAFT',
    'SUBMITTED_TO_REVIEW',
    'Letter submitted for review',
    NOW()
  );

  RAISE NOTICE 'Successfully created % history entries', v_history_count;

  RETURN jsonb_build_object(
    'success', true, 
    'message', 'Letter submitted for review successfully',
    'reviewers_count', v_history_count
  );

EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object(
    'success', false, 
    'error', SQLERRM, 
    'detail', SQLSTATE
  );
END;
$$;

-- Grant permissions
GRANT EXECUTE ON FUNCTION submit_letter_for_review(UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION submit_letter_for_review(UUID, UUID) TO service_role;

COMMENT ON FUNCTION submit_letter_for_review IS 'Submit letter for review using document_workflow_stages and letter_histories with assigned_to_id';
