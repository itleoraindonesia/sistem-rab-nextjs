-- Fix UUID cast for assigned_to_id in RPC functions
-- Date: 2026-02-26
-- Issue: assigned_to_id column is of type uuid, but jsonb_array_elements()->>'user_id'
--        returns text. Need explicit ::uuid cast.

-- Fix submit_letter_for_review
CREATE OR REPLACE FUNCTION submit_letter_for_review(
    p_letter_id UUID,
    p_user_id UUID
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_letter outgoing_letters%ROWTYPE;
    v_document_type_id integer;
    v_result jsonb;
BEGIN
    -- Get letter and check status
    SELECT * INTO v_letter
    FROM outgoing_letters
    WHERE id = p_letter_id;

    IF v_letter.id IS NULL THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Letter not found'
        );
    END IF;

    IF v_letter.status != 'DRAFT' THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Only draft letters can be submitted for review'
        );
    END IF;

    -- Get document type ID
    v_document_type_id := v_letter.document_type_id;

    -- Update letter status to SUBMITTED_TO_REVIEW
    UPDATE outgoing_letters
    SET status = 'SUBMITTED_TO_REVIEW',
        updated_at = now()
    WHERE id = p_letter_id;

    -- Create history record for submission
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
        now()
    );

    -- Create pending review tasks for each reviewer based on workflow stages
    -- Cast assignee_user_id to uuid explicitly to match column type
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
    )
    SELECT
        p_letter_id,
        p_user_id,
        (jsonb_array_elements(ws.assignees)->>'user_id')::uuid,
        'ASSIGNED',
        NULL,
        NULL,
        'REVIEW',
        ws.sequence,
        'Review task assigned - Stage: ' || ws.stage_name,
        now()
    FROM document_workflow_stages ws
    WHERE ws.document_type_id = v_document_type_id
      AND ws.is_active = true
      AND ws.stage_type = 'REVIEW'
    ORDER BY ws.sequence;

    -- Return success
    v_result := jsonb_build_object(
        'success', true,
        'id', p_letter_id,
        'status', 'SUBMITTED_TO_REVIEW'
    );

    RETURN v_result;

EXCEPTION
    WHEN OTHERS THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', SQLERRM
        );
END;
$$;

-- Fix resubmit_revision
CREATE OR REPLACE FUNCTION resubmit_revision(
    p_letter_id UUID,
    p_user_id UUID
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_letter outgoing_letters%ROWTYPE;
    v_document_type_id integer;
    v_result jsonb;
BEGIN
    -- Get letter and check status
    SELECT * INTO v_letter
    FROM outgoing_letters
    WHERE id = p_letter_id;

    IF v_letter.id IS NULL THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Letter not found'
        );
    END IF;

    IF v_letter.status != 'REVISION_REQUESTED' THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Only letters in revision can be resubmitted for review'
        );
    END IF;

    -- Get document type ID
    v_document_type_id := v_letter.document_type_id;

    -- Delete old pending review entries (to_status is null for pending)
    DELETE FROM letter_histories
    WHERE letter_id = p_letter_id
      AND stage_type = 'REVIEW'
      AND to_status IS NULL;

    -- Update letter status to SUBMITTED_TO_REVIEW
    UPDATE outgoing_letters
    SET status = 'SUBMITTED_TO_REVIEW',
        updated_at = now()
    WHERE id = p_letter_id;

    -- Create history record for resubmission
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
        'RESUBMITTED',
        'REVISION_REQUESTED',
        'SUBMITTED_TO_REVIEW',
        'Letter resubmitted after revision',
        now()
    );

    -- Create new pending review tasks
    -- Cast assignee_user_id to uuid explicitly to match column type
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
    )
    SELECT
        p_letter_id,
        p_user_id,
        (jsonb_array_elements(ws.assignees)->>'user_id')::uuid,
        'ASSIGNED',
        NULL,
        NULL,
        'REVIEW',
        ws.sequence,
        'Review task reassigned - Stage: ' || ws.stage_name,
        now()
    FROM document_workflow_stages ws
    WHERE ws.document_type_id = v_document_type_id
      AND ws.is_active = true
      AND ws.stage_type = 'REVIEW'
    ORDER BY ws.sequence;

    -- Return success
    v_result := jsonb_build_object(
        'success', true,
        'id', p_letter_id,
        'status', 'SUBMITTED_TO_REVIEW'
    );

    RETURN v_result;

EXCEPTION
    WHEN OTHERS THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', SQLERRM
        );
END;
$$;
