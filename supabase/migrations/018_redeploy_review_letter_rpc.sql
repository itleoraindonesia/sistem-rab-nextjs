-- Migration 018: Force apply latest review_letter RPC + manual fix untuk data yang sudah ada
-- Jalankan di Supabase SQL Editor

-- ============================================================================
-- STEP 1: Cek status surat yang bermasalah dan history-nya
-- ============================================================================
SELECT 
  ol.id AS letter_id,
  ol.subject,
  ol.status AS letter_status,
  lh.id AS history_id,
  lh.action_type,
  lh.stage_type,
  lh.to_status,
  u.nama AS assigned_to,
  u.email AS email
FROM outgoing_letters ol
JOIN letter_histories lh ON lh.letter_id = ol.id
LEFT JOIN users u ON lh.assigned_to_id = u.id
WHERE ol.status = 'REVIEWED'
ORDER BY lh.created_at;

-- ============================================================================
-- STEP 2: Force re-deploy review_letter v018 (deterministik, tidak ada ambiguitas)
-- ============================================================================
DROP FUNCTION IF EXISTS review_letter(TEXT, UUID, UUID, TEXT);
DROP FUNCTION IF EXISTS review_letter(UUID, UUID, TEXT, TEXT);

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
  v_reviewer_count    INT;
  v_approved_count    INT;
  v_new_status        letter_status;
  v_document_type_id  INT;
  v_document_number   TEXT;
BEGIN
  -- Get letter
  SELECT * INTO v_letter FROM outgoing_letters WHERE id = p_letter_id;

  IF v_letter.id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Letter not found: ' || p_letter_id);
  END IF;

  -- Validate action
  IF p_action NOT IN ('APPROVE', 'REQUEST_REVISION', 'REJECT', 'APPROVED_FINAL') THEN
    RETURN jsonb_build_object('success', false, 'error', 'Invalid action: ' || p_action);
  END IF;

  v_document_type_id := v_letter.document_type_id;

  -- ── REVIEW stage ──
  IF v_letter.status = 'SUBMITTED_TO_REVIEW' AND p_action IN ('APPROVE', 'REQUEST_REVISION') THEN

    SELECT * INTO v_pending_entry
    FROM letter_histories
    WHERE letter_id      = p_letter_id
      AND assigned_to_id = p_user_id
      AND stage_type     = 'REVIEW'
      AND to_status      IS NULL
    ORDER BY created_at DESC
    LIMIT 1;

    IF v_pending_entry.id IS NULL THEN
      RETURN jsonb_build_object(
        'success', false,
        'error', 'Anda tidak ditugaskan untuk mereview surat ini atau sudah direview. ' ||
                 'user_id: ' || p_user_id::text ||
                 ', letter_status: ' || v_letter.status::text
      );
    END IF;

    IF p_action = 'REQUEST_REVISION' THEN
      UPDATE letter_histories
      SET to_status   = 'REVISION_REQUESTED',
          action_type = 'REVISION_REQUESTED',
          notes       = p_notes
      WHERE id = v_pending_entry.id;

      UPDATE letter_histories
      SET to_status   = 'REVISION_REQUESTED',
          action_type = 'CANCELLED',
          notes       = NULL
      WHERE letter_id  = p_letter_id
        AND stage_type = 'REVIEW'
        AND to_status  IS NULL
        AND id         != v_pending_entry.id;

      UPDATE outgoing_letters
      SET status         = 'REVISION_REQUESTED',
          revision_count = revision_count + 1,
          updated_at     = now()
      WHERE id = p_letter_id;

      RETURN jsonb_build_object('success', true, 'new_status', 'REVISION_REQUESTED');

    ELSIF p_action = 'APPROVE' THEN
      UPDATE letter_histories
      SET to_status   = 'REVIEWED',
          action_type = 'APPROVED_REVIEW',
          notes       = p_notes
      WHERE id = v_pending_entry.id;

      -- Hitung reviewer aktif siklus ini:
      -- (to_status IS NULL = masih pending) ATAU (to_status = 'REVIEWED' = sudah approve siklus ini)
      -- Ini mengecualikan entry lama dengan to_status='REVISION_REQUESTED' dari siklus sebelumnya.
      SELECT COUNT(*) INTO v_reviewer_count
      FROM letter_histories
      WHERE letter_id      = p_letter_id
        AND stage_type     = 'REVIEW'
        AND assigned_to_id IS NOT NULL
        AND (to_status IS NULL OR to_status = 'REVIEWED');

      SELECT COUNT(*) INTO v_approved_count
      FROM letter_histories
      WHERE letter_id      = p_letter_id
        AND stage_type     = 'REVIEW'
        AND assigned_to_id IS NOT NULL
        AND to_status      = 'REVIEWED';

      IF v_reviewer_count > 0 AND v_approved_count = v_reviewer_count THEN
        UPDATE outgoing_letters
        SET status      = 'REVIEWED',
            reviewed_at = now(),
            updated_at  = now()
        WHERE id = p_letter_id;

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
          NULL,
          now()
        FROM document_workflow_stages ws
        CROSS JOIN LATERAL jsonb_array_elements(ws.assignees) AS elem
        WHERE ws.document_type_id = v_document_type_id
          AND ws.is_active = true
          AND ws.stage_type = 'APPROVAL'
        ORDER BY ws.sequence;

        RETURN jsonb_build_object('success', true, 'new_status', 'REVIEWED');
      ELSE
        RETURN jsonb_build_object(
          'success', true,
          'new_status', 'SUBMITTED_TO_REVIEW',
          'message', 'Review recorded, waiting for other reviewers',
          'approved', v_approved_count,
          'total', v_reviewer_count
        );
      END IF;
    END IF;

  -- ── APPROVAL stage ──
  ELSIF v_letter.status = 'REVIEWED' AND p_action IN ('APPROVED_FINAL', 'REQUEST_REVISION', 'REJECT') THEN

    SELECT * INTO v_pending_entry
    FROM letter_histories
    WHERE letter_id      = p_letter_id
      AND assigned_to_id = p_user_id
      AND stage_type     = 'APPROVAL'
      AND to_status      IS NULL
    ORDER BY created_at DESC
    LIMIT 1;

    IF v_pending_entry.id IS NULL THEN
      RETURN jsonb_build_object(
        'success', false,
        'error', 'Anda tidak ditugaskan untuk approve surat ini atau sudah melakukan aksi. ' ||
                 'user_id: ' || p_user_id::text ||
                 ', letter_status: ' || v_letter.status::text
      );
    END IF;

    IF p_action = 'APPROVED_FINAL' THEN
      v_document_number := generate_document_number(p_letter_id);

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

      UPDATE letter_histories
      SET to_status   = 'APPROVED',
          action_type = 'CANCELLED',
          notes       = NULL
      WHERE letter_id  = p_letter_id
        AND stage_type = 'APPROVAL'
        AND to_status  IS NULL
        AND id         != v_pending_entry.id;

      RETURN jsonb_build_object('success', true, 'new_status', 'APPROVED', 'document_number', v_document_number);

    ELSIF p_action = 'REQUEST_REVISION' THEN
      UPDATE letter_histories
      SET to_status   = 'REVISION_REQUESTED',
          action_type = 'REVISION_REQUESTED',
          notes       = p_notes
      WHERE id = v_pending_entry.id;

      UPDATE outgoing_letters
      SET status         = 'REVISION_REQUESTED',
          revision_count = revision_count + 1,
          updated_at     = now()
      WHERE id = p_letter_id;

      UPDATE letter_histories
      SET to_status   = 'REVISION_REQUESTED',
          action_type = 'CANCELLED',
          notes       = NULL
      WHERE letter_id  = p_letter_id
        AND stage_type = 'APPROVAL'
        AND to_status  IS NULL
        AND id         != v_pending_entry.id;

      RETURN jsonb_build_object('success', true, 'new_status', 'REVISION_REQUESTED');

    ELSIF p_action = 'REJECT' THEN
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

      RETURN jsonb_build_object('success', true, 'new_status', 'REJECTED');
    END IF;

  ELSE
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Action ' || p_action || ' tidak valid untuk status surat saat ini: ' || v_letter.status::text
    );
  END IF;

  RETURN jsonb_build_object('success', false, 'error', 'Unhandled case');

EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object('success', false, 'error', 'Exception: ' || SQLERRM);
END;
$$;

COMMENT ON FUNCTION review_letter(TEXT, UUID, UUID, TEXT) IS
  'v018: Review & Approval letter. Error messages lebih deskriptif (menyertakan user_id & letter_status untuk debug).';

-- ============================================================================
-- STEP 3: Test manual — ganti <LETTER_ID> dan <APPROVER_USER_ID> dengan nilai nyata
-- (HAPUS KOMENTAR di bawah ini dan isi ID yang benar sebelum dijalankan)
-- ============================================================================

-- Cek ID surat yang status REVIEWED:
SELECT id, subject, status FROM outgoing_letters WHERE status = 'REVIEWED';

-- Cek user approver:
SELECT id, nama, email FROM users WHERE email = 'approver@test.com';

-- Test RPC manual (isi ID yang benar):
-- SELECT review_letter(
--   'APPROVED_FINAL',
--   '<LETTER_ID>'::uuid,
--   '9539f526-e60a-4397-a0df-ba5d7c5c9346'::uuid,  -- approver user_id
--   null
-- );
