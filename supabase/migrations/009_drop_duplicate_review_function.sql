-- Migration: Drop duplicate RPC functions to resolve overloading conflict
-- Date: 2026-02-27
-- Fix for: PGRST203 "Could not choose the best candidate function"
-- Terjadi karena Supabase (PostgREST) bingung memilih antara 2 versi
-- fungsi review_letter akibat perubahan urutan argumen sebelumnya.

-- ============================================================================
-- 1. DROP SEMUA VERSI fungsi review_letter untuk menghindari konflik
-- ============================================================================

DROP FUNCTION IF EXISTS review_letter(UUID, UUID, TEXT, TEXT);
DROP FUNCTION IF EXISTS review_letter(TEXT, UUID, UUID, TEXT);
DROP FUNCTION IF EXISTS review_letter; -- drop any other non-arg matched if possible

-- ============================================================================
-- 2. CREATE ULANG fungsi review_letter (Versi FINAL, sesuai migration 004)
-- ============================================================================

CREATE OR REPLACE FUNCTION review_letter(
  p_action    TEXT,
  p_letter_id UUID,
  p_user_id   UUID,
  p_notes     TEXT DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_letter            outgoing_letters%ROWTYPE;
  v_pending_entry     letter_histories%ROWTYPE;
  v_all_approved      BOOLEAN;
  v_reviewer_count    INT;
  v_approved_count    INT;
  v_new_status        letter_status;
  v_document_type_id  INT;
  v_document_number   TEXT;
BEGIN
  -- Get letter
  SELECT * INTO v_letter FROM outgoing_letters WHERE id = p_letter_id;

  IF v_letter.id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Letter not found');
  END IF;

  -- Validate action
  IF p_action NOT IN ('APPROVE', 'REQUEST_REVISION', 'REJECT', 'APPROVED_FINAL') THEN
    RETURN jsonb_build_object('success', false, 'error', 'Invalid action: ' || p_action);
  END IF;

  v_document_type_id := v_letter.document_type_id;

  -- ── REVIEW stage ──
  IF v_letter.status = 'SUBMITTED_TO_REVIEW' AND p_action IN ('APPROVE', 'REQUEST_REVISION') THEN

    -- Check user has pending review task
    SELECT * INTO v_pending_entry
    FROM letter_histories
    WHERE letter_id = p_letter_id
      AND assigned_to_id = p_user_id
      AND stage_type = 'REVIEW'
      AND to_status IS NULL
    ORDER BY created_at DESC
    LIMIT 1;

    IF v_pending_entry.id IS NULL THEN
      RETURN jsonb_build_object('success', false, 'error', 'You are not assigned to review this letter or already reviewed');
    END IF;

    IF p_action = 'REQUEST_REVISION' THEN
      -- Update pending entry to show revision requested
      UPDATE letter_histories
      SET to_status = 'REVISION_REQUESTED',
          action_type = 'REVISION_REQUESTED',
          notes = COALESCE(p_notes, 'Revision requested')
      WHERE id = v_pending_entry.id;

      -- Cancel all other pending review entries
      UPDATE letter_histories
      SET to_status = 'REVISION_REQUESTED',
          notes = 'Revision requested by another reviewer'
      WHERE letter_id = p_letter_id
        AND stage_type = 'REVIEW'
        AND to_status IS NULL
        AND id != v_pending_entry.id;

      -- Update letter status + increment revision_count
      UPDATE outgoing_letters
      SET status = 'REVISION_REQUESTED',
          revision_count = revision_count + 1,
          updated_at = now()
      WHERE id = p_letter_id;

      -- Insert status change history
      INSERT INTO letter_histories (letter_id, action_by_id, action_type, from_status, to_status, notes, created_at)
      VALUES (p_letter_id, p_user_id, 'REVISION_REQUESTED', 'SUBMITTED_TO_REVIEW', 'REVISION_REQUESTED', p_notes, now());

      RETURN jsonb_build_object('success', true, 'new_status', 'REVISION_REQUESTED');

    ELSIF p_action = 'APPROVE' THEN
      -- Update this reviewer's pending entry
      UPDATE letter_histories
      SET to_status = 'REVIEWED',
          action_type = 'APPROVED_REVIEW',
          notes = p_notes
      WHERE id = v_pending_entry.id;

      -- Check if ALL reviewers have now approved
      SELECT COUNT(*) INTO v_reviewer_count
      FROM letter_histories
      WHERE letter_id = p_letter_id
        AND stage_type = 'REVIEW'
        AND assigned_to_id IS NOT NULL;

      SELECT COUNT(*) INTO v_approved_count
      FROM letter_histories
      WHERE letter_id = p_letter_id
        AND stage_type = 'REVIEW'
        AND assigned_to_id IS NOT NULL
        AND to_status = 'REVIEWED';

      IF v_reviewer_count > 0 AND v_approved_count = v_reviewer_count THEN
        -- All reviewers approved → advance to REVIEWED
        UPDATE outgoing_letters
        SET status = 'REVIEWED',
            reviewed_at = now(),
            updated_at = now()
        WHERE id = p_letter_id;

        -- Insert status change history
        INSERT INTO letter_histories (letter_id, action_by_id, action_type, from_status, to_status, notes, created_at)
        VALUES (p_letter_id, p_user_id, 'APPROVED_REVIEW', 'SUBMITTED_TO_REVIEW', 'REVIEWED', 'All reviewers approved', now());

        -- Create pending approval tasks for approvers
        INSERT INTO letter_histories (
          letter_id, action_by_id, assigned_to_id, action_type,
          from_status, to_status, stage_type, sequence, notes, created_at
        )
        SELECT
          p_letter_id,
          p_user_id,
          (elem->>'user_id')::uuid,
          'SUBMITTED',
          'REVIEWED',
          NULL,
          'APPROVAL',
          ws.sequence,
          'Approval task assigned - Stage: ' || ws.stage_name,
          now()
        FROM document_workflow_stages ws
        CROSS JOIN LATERAL jsonb_array_elements(ws.assignees) AS elem
        WHERE ws.document_type_id = v_document_type_id
          AND ws.is_active = true
          AND ws.stage_type = 'APPROVAL'
        ORDER BY ws.sequence;

        RETURN jsonb_build_object('success', true, 'new_status', 'REVIEWED');
      ELSE
        -- Not all approved yet, still waiting
        RETURN jsonb_build_object('success', true, 'new_status', 'SUBMITTED_TO_REVIEW', 'message', 'Review recorded, waiting for other reviewers');
      END IF;
    END IF;

  -- ── APPROVAL stage ──
  ELSIF v_letter.status = 'REVIEWED' AND p_action IN ('APPROVED_FINAL', 'REQUEST_REVISION', 'REJECT') THEN

    -- Check user has pending approval task
    SELECT * INTO v_pending_entry
    FROM letter_histories
    WHERE letter_id = p_letter_id
      AND assigned_to_id = p_user_id
      AND stage_type = 'APPROVAL'
      AND to_status IS NULL
    ORDER BY created_at DESC
    LIMIT 1;

    IF v_pending_entry.id IS NULL THEN
      RETURN jsonb_build_object('success', false, 'error', 'You are not assigned to approve this letter or already acted');
    END IF;

    IF p_action = 'APPROVED_FINAL' THEN
      -- Generate nomor surat (proper RPC, bukan test)
      v_document_number := generate_document_number(p_letter_id);

      -- Update pending entry
      UPDATE letter_histories
      SET to_status = 'APPROVED',
          action_type = 'APPROVED_FINAL',
          notes = p_notes
      WHERE id = v_pending_entry.id;

      -- Update letter
      UPDATE outgoing_letters
      SET status = 'APPROVED',
          document_number = v_document_number,
          approved_at = now(),
          updated_at = now()
      WHERE id = p_letter_id;

      -- Insert status change history
      INSERT INTO letter_histories (letter_id, action_by_id, action_type, from_status, to_status, notes, created_at)
      VALUES (p_letter_id, p_user_id, 'APPROVED_FINAL', 'REVIEWED', 'APPROVED',
              COALESCE(p_notes, 'Letter approved. Document number: ' || v_document_number), now());

      RETURN jsonb_build_object('success', true, 'new_status', 'APPROVED', 'document_number', v_document_number);

    ELSIF p_action = 'REQUEST_REVISION' THEN
      -- Approver juga bisa minta revisi
      UPDATE letter_histories
      SET to_status = 'REVISION_REQUESTED',
          action_type = 'REVISION_REQUESTED',
          notes = COALESCE(p_notes, 'Revision requested')
      WHERE id = v_pending_entry.id;

      UPDATE outgoing_letters
      SET status = 'REVISION_REQUESTED',
          revision_count = revision_count + 1,
          updated_at = now()
      WHERE id = p_letter_id;

      INSERT INTO letter_histories (letter_id, action_by_id, action_type, from_status, to_status, notes, created_at)
      VALUES (p_letter_id, p_user_id, 'REVISION_REQUESTED', 'REVIEWED', 'REVISION_REQUESTED', p_notes, now());

      RETURN jsonb_build_object('success', true, 'new_status', 'REVISION_REQUESTED');

    ELSIF p_action = 'REJECT' THEN
      -- Permanent rejection
      UPDATE letter_histories
      SET to_status = 'REJECTED',
          action_type = 'REJECTED',
          notes = p_notes
      WHERE id = v_pending_entry.id;

      UPDATE outgoing_letters
      SET status = 'REJECTED',
          rejected_at = now(),
          updated_at = now()
      WHERE id = p_letter_id;

      INSERT INTO letter_histories (letter_id, action_by_id, action_type, from_status, to_status, notes, created_at)
      VALUES (p_letter_id, p_user_id, 'REJECTED', 'REVIEWED', 'REJECTED', p_notes, now());

      RETURN jsonb_build_object('success', true, 'new_status', 'REJECTED');
    END IF;

  ELSE
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Invalid action ' || p_action || ' for current status ' || v_letter.status
    );
  END IF;

  RETURN jsonb_build_object('success', false, 'error', 'Unhandled case');

EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object('success', false, 'error', SQLERRM);
END;
$$;
