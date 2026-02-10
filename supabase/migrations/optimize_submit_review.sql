-- KOREKSI: fix column name action_by -> action_by_id
CREATE OR REPLACE FUNCTION submit_letter_for_review(
  p_letter_id UUID,
  p_user_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_letter_document_type_id BIGINT;
  v_letter_status TEXT;
  v_config RECORD;
  v_tracking_count INT := 0;
BEGIN
  -- 1. Get and validate letter
  SELECT document_type_id, status INTO v_letter_document_type_id, v_letter_status
  FROM outgoing_letters
  WHERE id = p_letter_id;

  IF v_letter_document_type_id IS NULL THEN
    RAISE EXCEPTION 'Letter not found';
  END IF;

  IF v_letter_status != 'DRAFT' THEN
    RAISE EXCEPTION 'Only draft letters can be submitted for review. Current status: %', v_letter_status;
  END IF;

  -- 2. Loop through configs and insert trackings for REVIEW stage
  FOR v_config IN (
    SELECT user_id, sequence
    FROM document_workflow_configs
    WHERE document_type_id = v_letter_document_type_id
      AND stage_type = 'REVIEW'
      AND is_active = true
      ORDER BY sequence
  ) LOOP
    INSERT INTO letter_workflow_trackings (
      letter_id,
      assigned_to_id,
      stage_type,
      sequence,
      status,
      created_at
    ) VALUES (
      p_letter_id,
      v_config.user_id,
      'REVIEW',
      v_config.sequence,
      'PENDING',
      NOW()
    );
    v_tracking_count := v_tracking_count + 1;
  END LOOP;

  IF v_tracking_count = 0 THEN
    RAISE EXCEPTION 'No reviewers configuration found for this document type (REVIEW stage). Please check workflow configuration.';
  END IF;

  -- 3. Update letter status
  UPDATE outgoing_letters
  SET status = 'SUBMITTED_TO_REVIEW',
      updated_at = NOW()
  WHERE id = p_letter_id;

  -- 4. Create history (FIXED COLUMN NAME)
  INSERT INTO letter_histories (
    letter_id,
    action_by_id,  -- KOREKSI: action_by -> action_by_id
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
    'Submitted for review',
    NOW()
  );

  RETURN jsonb_build_object('success', true, 'message', 'Letter submitted for review successfully');
END;
$$;
