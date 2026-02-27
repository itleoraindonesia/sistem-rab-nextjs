-- Migration: Fix duplicate audit trail entries in review_letter
-- Date: 2026-02-27
-- Issues fixed:
--   1. REVISION_REQUESTED di REVIEW stage: ada UPDATE pending entry + INSERT audit event (duplikat)
--   2. APPROVED_FINAL di APPROVAL stage: ada UPDATE pending entry + INSERT audit event (duplikat)
--   3. REJECTED di APPROVAL stage: ada UPDATE pending entry + INSERT audit event (duplikat)
--   4. REVISION_REQUESTED di APPROVAL stage: ada UPDATE pending entry + INSERT audit event (duplikat)
--
-- Fix: Hapus INSERT statement untuk audit event karena UPDATE pending entry sudah cukup merekam aksi user.
--      Pending entry yang di-UPDATE sudah mencatat action_type, action_by_id, from_status, to_status, dan notes.

DROP FUNCTION IF EXISTS review_letter(TEXT, UUID, UUID, TEXT);

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
      -- Update pending entry (INI SUDAH MENCATAT AKSI REVIEWER)
      UPDATE letter_histories
      SET to_status   = 'REVISION_REQUESTED',
          action_type = 'REVISION_REQUESTED',
          notes       = COALESCE(p_notes, 'Revision requested')
      WHERE id = v_pending_entry.id;

      -- Cancel all other pending review entries
      UPDATE letter_histories
      SET to_status = 'REVISION_REQUESTED',
          notes     = 'Revision requested by another reviewer'
      WHERE letter_id = p_letter_id
        AND stage_type = 'REVIEW'
        AND to_status IS NULL
        AND id != v_pending_entry.id;

      -- Update letter status
      UPDATE outgoing_letters
      SET status         = 'REVISION_REQUESTED',
          revision_count = revision_count + 1,
          updated_at     = now()
      WHERE id = p_letter_id;

      -- FIX: Hapus INSERT audit event duplikat
      -- Pending entry yang di-UPDATE di atas sudah cukup merekam aksi ini
      -- (action_type, action_by_id, from_status, to_status, notes, created_at)

      RETURN jsonb_build_object('success', true, 'new_status', 'REVISION_REQUESTED');

    ELSIF p_action = 'APPROVE' THEN
      -- Update this reviewer's pending entry (INI SUDAH MENCATAT AKSI REVIEWER)
      UPDATE letter_histories
      SET to_status   = 'REVIEWED',
          action_type = 'APPROVED_REVIEW',
          notes       = p_notes
      WHERE id = v_pending_entry.id;

      -- Check if ALL reviewers have now approved
      SELECT COUNT(*) INTO v_reviewer_count
      FROM letter_histories
      WHERE letter_id    = p_letter_id
        AND stage_type   = 'REVIEW'
        AND assigned_to_id IS NOT NULL;

      SELECT COUNT(*) INTO v_approved_count
      FROM letter_histories
      WHERE letter_id    = p_letter_id
        AND stage_type   = 'REVIEW'
        AND assigned_to_id IS NOT NULL
        AND to_status    = 'REVIEWED';

      IF v_reviewer_count > 0 AND v_approved_count = v_reviewer_count THEN
        -- All reviewers approved → advance to REVIEWED
        UPDATE outgoing_letters
        SET status      = 'REVIEWED',
            reviewed_at = now(),
            updated_at  = now()
        WHERE id = p_letter_id;

        -- TIDAK insert row APPROVED_REVIEW baru di sini —
        -- pending task masing-masing reviewer sudah terekam di atas.
        -- Cukup buat pending approval tasks untuk approver.

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
    WHERE letter_id    = p_letter_id
      AND assigned_to_id = p_user_id
      AND stage_type   = 'APPROVAL'
      AND to_status    IS NULL
    ORDER BY created_at DESC
    LIMIT 1;

    IF v_pending_entry.id IS NULL THEN
      RETURN jsonb_build_object('success', false, 'error', 'You are not assigned to approve this letter or already acted');
    END IF;

    IF p_action = 'APPROVED_FINAL' THEN
      v_document_number := generate_document_number(p_letter_id);

      -- Update pending entry (INI SUDAH MENCATAT AKSI APPROVER)
      UPDATE letter_histories
      SET to_status   = 'APPROVED',
          action_type = 'APPROVED_FINAL',
          notes       = p_notes
      WHERE id = v_pending_entry.id;

      UPDATE outgoing_letters
      SET status          = 'APPROVED',
          document_number = v_document_number,
          approved_at     = now(),
          updated_at      = now()
      WHERE id = p_letter_id;

      -- FIX: Hapus INSERT audit event duplikat
      -- Pending entry yang di-UPDATE di atas sudah cukup merekam aksi ini

      RETURN jsonb_build_object('success', true, 'new_status', 'APPROVED', 'document_number', v_document_number);

    ELSIF p_action = 'REQUEST_REVISION' THEN
      -- Update pending entry (INI SUDAH MENCATAT AKSI APPROVER)
      UPDATE letter_histories
      SET to_status   = 'REVISION_REQUESTED',
          action_type = 'REVISION_REQUESTED',
          notes       = COALESCE(p_notes, 'Revision requested')
      WHERE id = v_pending_entry.id;

      UPDATE outgoing_letters
      SET status         = 'REVISION_REQUESTED',
          revision_count = revision_count + 1,
          updated_at     = now()
      WHERE id = p_letter_id;

      -- FIX: Hapus INSERT audit event duplikat
      -- Pending entry yang di-UPDATE di atas sudah cukup merekam aksi ini

      RETURN jsonb_build_object('success', true, 'new_status', 'REVISION_REQUESTED');

    ELSIF p_action = 'REJECT' THEN
      -- Update pending entry (INI SUDAH MENCATAT AKSI APPROVER)
      UPDATE letter_histories
      SET to_status   = 'REJECTED',
          action_type = 'REJECTED',
          notes       = p_notes
      WHERE id = v_pending_entry.id;

      UPDATE outgoing_letters
      SET status      = 'REJECTED',
          rejected_at = now(),
          updated_at  = now()
      WHERE id = p_letter_id;

      -- FIX: Hapus INSERT audit event duplikat
      -- Pending entry yang di-UPDATE di atas sudah cukup merekam aksi ini

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

COMMENT ON FUNCTION review_letter(TEXT, UUID, UUID, TEXT) IS
  'Review/approve letter workflow. Fix: Hapus INSERT duplikat audit events.
   Pending task entry yang di-UPDATE sudah cukup merekam aksi reviewer/approver.';

-- ============================================================================
-- CLEANUP: Hapus history entries duplikat yang sudah ada di database
-- ============================================================================
-- Jalankan query ini untuk membersihkan data duplikat yang sudah terlanjur tercipta:
/*
-- Hapus duplicate REVISION_REQUESTED entries (yang to_status IS NOT NULL tapi ada duplikatnya)
WITH duplicates AS (
  SELECT id, letter_id, action_by_id, action_type, created_at,
         ROW_NUMBER() OVER (
           PARTITION BY letter_id, action_by_id, action_type, DATE_TRUNC('second', created_at)
           ORDER BY id
         ) as rn
  FROM letter_histories
  WHERE action_type IN ('REVISION_REQUESTED', 'APPROVED_FINAL', 'REJECTED')
    AND assigned_to_id IS NULL  -- Entry audit event (bukan pending task)
)
DELETE FROM letter_histories
WHERE id IN (SELECT id FROM duplicates WHERE rn > 1);
*/
