-- Migration: Fix audit trail - notes & duplicates
-- Date: 2026-02-28
-- Issues fixed:
--   1. [review_letter] REVISION_REQUESTED duplikat:
--      - pending entry-nya di-UPDATE ke REVISION_REQUESTED (✓)
--      - entry lain yg di-cancel juga muncul di audit trail (✕)
--      Fix: Set notes = NULL pada entry yang di-cancel (bukan aksi user).
--      Set action_by_id = NULL juga supaya tidak muncul sebagai aksi user.
--
--   2. [resubmit_revision] Entry SUBMITTED ganda:
--      - INSERT 'REVISED' history (✓)
--      - INSERT 'SUBMITTED' history (✕ duplikat — pending task sudah merekam ini)
--      - INSERT pending review tasks per assignee (✓)
--      Fix: Hilangkan INSERT SUBMITTED yang terpisah. Pending task cukup.
--      Juga, INSERT REVISED cukup 1 entry tanpa notes sistem.
--
--   3. [submit_letter_for_review & resubmit_revision & review_letter] System notes:
--      Kolom notes pada pending task rows (assigned_to_id IS NOT NULL) berisi
--      teks sistem seperti "Review task assigned - Stage: ...", diset NULL saja.
--      Kolom notes pada history rows aksi user dibiarkan hanya dari p_notes (user input).

-- ============================================================================
-- FIX submit_letter_for_review
-- ============================================================================
-- Perubahan:
--   - notes pada INSERT history SUBMITTED → NULL (bukan 'Letter submitted for review')
--   - notes pada pending review task rows → NULL (bukan 'Review task assigned - Stage: ...')

CREATE OR REPLACE FUNCTION submit_letter_for_review(
  p_letter_id UUID,
  p_user_id   UUID
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_letter           outgoing_letters%ROWTYPE;
  v_document_type_id INT;
  v_stage_count      INT;
BEGIN
  SELECT * INTO v_letter FROM outgoing_letters WHERE id = p_letter_id;

  IF v_letter.id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Surat tidak ditemukan');
  END IF;

  IF v_letter.status != 'DRAFT' THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Hanya surat berstatus DRAFT yang bisa disubmit. Status saat ini: ' || v_letter.status::text
    );
  END IF;

  v_document_type_id := v_letter.document_type_id;

  -- Validasi: harus ada minimal 1 REVIEW stage aktif
  SELECT COUNT(*) INTO v_stage_count
  FROM document_workflow_stages
  WHERE document_type_id = v_document_type_id
    AND is_active = true
    AND stage_type = 'REVIEW';

  IF v_stage_count = 0 THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Workflow reviewer belum dikonfigurasi untuk jenis dokumen ini. Hubungi admin.'
    );
  END IF;

  -- Update status
  UPDATE outgoing_letters
  SET status       = 'SUBMITTED_TO_REVIEW',
      submitted_at = COALESCE(submitted_at, now()),
      updated_at   = now()
  WHERE id = p_letter_id;

  -- FIX #3: notes = NULL (bukan system string)
  INSERT INTO letter_histories (letter_id, action_by_id, action_type, from_status, to_status, notes, created_at)
  VALUES (p_letter_id, p_user_id, 'SUBMITTED', 'DRAFT', 'SUBMITTED_TO_REVIEW', NULL, now());

  -- FIX #3: notes = NULL pada pending review tasks
  INSERT INTO letter_histories (
    letter_id, action_by_id, assigned_to_id, action_type,
    from_status, to_status, stage_type, sequence, notes, created_at
  )
  SELECT
    p_letter_id,
    p_user_id,
    (elem->>'user_id')::uuid,
    'SUBMITTED',
    NULL,        -- from_status
    NULL,        -- to_status (pending)
    'REVIEW',
    ws.sequence,
    NULL,        -- FIX: bukan 'Review task assigned - Stage: ...'
    now()
  FROM document_workflow_stages ws
  CROSS JOIN LATERAL jsonb_array_elements(ws.assignees) AS elem
  WHERE ws.document_type_id = v_document_type_id
    AND ws.is_active = true
    AND ws.stage_type = 'REVIEW'
  ORDER BY ws.sequence;

  RETURN jsonb_build_object('success', true, 'id', p_letter_id, 'status', 'SUBMITTED_TO_REVIEW');

EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object('success', false, 'error', SQLERRM);
END;
$$;

-- ============================================================================
-- FIX resubmit_revision
-- ============================================================================
-- Perubahan:
--   - FIX #2: Hapus INSERT 'SUBMITTED' yang terpisah dan redundan.
--             Pending task rows (per assignee) sudah mewakili task review baru.
--             REVISED entry sudah cukup merekam aksi creator.
--   - FIX #3: notes = NULL pada REVISED entry dan pending task rows.
--   - FIX #1: Entry lain yang di-cancel tidak muncul sebagai input user.

CREATE OR REPLACE FUNCTION resubmit_revision(
  p_letter_id UUID,
  p_user_id   UUID
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_letter           outgoing_letters%ROWTYPE;
  v_document_type_id INT;
  v_stage_count      INT;
BEGIN
  SELECT * INTO v_letter FROM outgoing_letters WHERE id = p_letter_id;

  IF v_letter.id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Surat tidak ditemukan');
  END IF;

  IF v_letter.status != 'REVISION_REQUESTED' THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Hanya surat berstatus REVISION_REQUESTED yang bisa diresubmit. Status saat ini: ' || v_letter.status::text
    );
  END IF;

  v_document_type_id := v_letter.document_type_id;

  -- Validasi: harus ada minimal 1 REVIEW stage aktif
  SELECT COUNT(*) INTO v_stage_count
  FROM document_workflow_stages
  WHERE document_type_id = v_document_type_id
    AND is_active = true
    AND stage_type = 'REVIEW';

  IF v_stage_count = 0 THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Workflow reviewer belum dikonfigurasi untuk jenis dokumen ini. Hubungi admin.'
    );
  END IF;

  -- Hapus pending review entries lama (to_status IS NULL)
  DELETE FROM letter_histories
  WHERE letter_id = p_letter_id
    AND stage_type = 'REVIEW'
    AND to_status IS NULL;

  -- Update letter status
  UPDATE outgoing_letters
  SET status     = 'SUBMITTED_TO_REVIEW',
      updated_at = now()
  WHERE id = p_letter_id;

  -- FIX #2 & #3: Hanya INSERT 1 entry REVISED saja, notes = NULL (user tidak input catatan revisi di sini)
  -- Tidak perlu INSERT SUBMITTED terpisah — pending task rows sudah merepresentasikan submit baru.
  INSERT INTO letter_histories (letter_id, action_by_id, action_type, from_status, to_status, notes, created_at)
  VALUES (p_letter_id, p_user_id, 'REVISED', 'REVISION_REQUESTED', 'SUBMITTED_TO_REVIEW', NULL, now());

  -- FIX #3: Buat ulang pending review tasks dengan notes = NULL
  INSERT INTO letter_histories (
    letter_id, action_by_id, assigned_to_id, action_type,
    from_status, to_status, stage_type, sequence, notes, created_at
  )
  SELECT
    p_letter_id,
    p_user_id,
    (elem->>'user_id')::uuid,
    'SUBMITTED',
    NULL,        -- from_status
    NULL,        -- to_status (pending)
    'REVIEW',
    ws.sequence,
    NULL,        -- FIX: bukan 'Review task reassigned - Stage: ...'
    now() + interval '1 millisecond'
  FROM document_workflow_stages ws
  CROSS JOIN LATERAL jsonb_array_elements(ws.assignees) AS elem
  WHERE ws.document_type_id = v_document_type_id
    AND ws.is_active = true
    AND ws.stage_type = 'REVIEW'
  ORDER BY ws.sequence;

  RETURN jsonb_build_object('success', true, 'id', p_letter_id, 'status', 'SUBMITTED_TO_REVIEW');

EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object('success', false, 'error', SQLERRM);
END;
$$;

-- ============================================================================
-- FIX review_letter
-- ============================================================================
-- Perubahan:
--   - FIX #1 (REVISION_REQUESTED duplikat):
--     Entry lain yang di-cancel (bukan aksi user) jangan muncul di audit trail.
--     Set action_type = 'CANCELLED' dan notes = NULL pada entry yg di-cancel.
--   - FIX #3: notes pada pending approval tasks = NULL.
--   - FIX #3: notes pada REQUEST_REVISION di REVIEW stage: pakai hanya p_notes (user input).
--     Fallback COALESCE ke NULL, bukan ke 'Revision requested'.

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

    SELECT * INTO v_pending_entry
    FROM letter_histories
    WHERE letter_id      = p_letter_id
      AND assigned_to_id = p_user_id
      AND stage_type     = 'REVIEW'
      AND to_status      IS NULL
    ORDER BY created_at DESC
    LIMIT 1;

    IF v_pending_entry.id IS NULL THEN
      RETURN jsonb_build_object('success', false, 'error', 'You are not assigned to review this letter or already reviewed');
    END IF;

    IF p_action = 'REQUEST_REVISION' THEN
      -- Update pending entry (aksi user, notes dari user)
      UPDATE letter_histories
      SET to_status   = 'REVISION_REQUESTED',
          action_type = 'REVISION_REQUESTED',
          notes       = p_notes   -- FIX #3: hanya user input, NULL jika tidak ada
      WHERE id = v_pending_entry.id;

      -- FIX #1: Cancel entry reviewer lain — set action_type CANCELLED, notes NULL
      -- agar tidak muncul di audit trail sebagai aksi user
      UPDATE letter_histories
      SET to_status   = 'REVISION_REQUESTED',
          action_type = 'CANCELLED',
          notes       = NULL       -- FIX #1 & #3: bukan 'Revision requested by another reviewer'
      WHERE letter_id  = p_letter_id
        AND stage_type = 'REVIEW'
        AND to_status  IS NULL
        AND id         != v_pending_entry.id;

      -- Update letter status
      UPDATE outgoing_letters
      SET status         = 'REVISION_REQUESTED',
          revision_count = revision_count + 1,
          updated_at     = now()
      WHERE id = p_letter_id;

      RETURN jsonb_build_object('success', true, 'new_status', 'REVISION_REQUESTED');

    ELSIF p_action = 'APPROVE' THEN
      -- Update reviewer's pending entry (aksi user)
      UPDATE letter_histories
      SET to_status   = 'REVIEWED',
          action_type = 'APPROVED_REVIEW',
          notes       = p_notes   -- FIX #3: hanya user input
      WHERE id = v_pending_entry.id;

      -- Check if ALL reviewers have approved
      SELECT COUNT(*) INTO v_reviewer_count
      FROM letter_histories
      WHERE letter_id        = p_letter_id
        AND stage_type       = 'REVIEW'
        AND assigned_to_id   IS NOT NULL
        AND action_type     != 'CANCELLED';

      SELECT COUNT(*) INTO v_approved_count
      FROM letter_histories
      WHERE letter_id        = p_letter_id
        AND stage_type       = 'REVIEW'
        AND assigned_to_id   IS NOT NULL
        AND action_type     != 'CANCELLED'
        AND to_status        = 'REVIEWED';

      IF v_reviewer_count > 0 AND v_approved_count = v_reviewer_count THEN
        UPDATE outgoing_letters
        SET status      = 'REVIEWED',
            reviewed_at = now(),
            updated_at  = now()
        WHERE id = p_letter_id;

        -- FIX #3: notes = NULL pada pending approval tasks
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
          NULL,        -- to_status (pending)
          'APPROVAL',
          ws.sequence,
          NULL,        -- FIX: bukan 'Approval task assigned - Stage: ...'
          now()
        FROM document_workflow_stages ws
        CROSS JOIN LATERAL jsonb_array_elements(ws.assignees) AS elem
        WHERE ws.document_type_id = v_document_type_id
          AND ws.is_active = true
          AND ws.stage_type = 'APPROVAL'
        ORDER BY ws.sequence;

        RETURN jsonb_build_object('success', true, 'new_status', 'REVIEWED');
      ELSE
        RETURN jsonb_build_object('success', true, 'new_status', 'SUBMITTED_TO_REVIEW', 'message', 'Review recorded, waiting for other reviewers');
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
      RETURN jsonb_build_object('success', false, 'error', 'You are not assigned to approve this letter or already acted');
    END IF;

    IF p_action = 'APPROVED_FINAL' THEN
      v_document_number := generate_document_number(p_letter_id);

      -- FIX #3: notes = hanya user input
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

      -- FIX #1: Cancel pending approval entries lain
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
      -- FIX #3: notes = hanya user input
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

      -- FIX #1: Cancel pending approval entries lain
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
      -- FIX #3: notes = hanya user input
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
      'error', 'Invalid action ' || p_action || ' for current status ' || v_letter.status
    );
  END IF;

  RETURN jsonb_build_object('success', false, 'error', 'Unhandled case');

EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object('success', false, 'error', SQLERRM);
END;
$$;

COMMENT ON FUNCTION submit_letter_for_review(UUID, UUID) IS
  'Submit draft letter untuk review. Fix #3: notes = NULL (bukan system string).';

COMMENT ON FUNCTION resubmit_revision(UUID, UUID) IS
  'Resubmit setelah revisi. Fix #2: hapus INSERT SUBMITTED ganda. Fix #3: notes = NULL.';

COMMENT ON FUNCTION review_letter(TEXT, UUID, UUID, TEXT) IS
  'Review/approve letter. Fix #1: entry cancelled pakai action_type CANCELLED. Fix #3: notes = NULL pada pending tasks.';

-- ============================================================================
-- JUGA: Tambahkan CANCELLED ke ACTION_LABEL mapping agar tidak muncul di UI
-- ============================================================================
-- Di frontend (page.tsx), pastikan entri dengan action_type = 'CANCELLED'
-- difilter / tidak ditampilkan di audit trail.
-- Contoh filter di sortedHistories:
--   const sortedHistories = [...(letter.histories ?? [])]
--     .filter(h => h.action_type !== 'CANCELLED')
--     .sort(...)

-- ============================================================================
-- CLEANUP: Bersihkan data lama yang sudah terlanjur ada
-- ============================================================================
-- Jalankan ini untuk membersihkan data duplikat yang sudah ada di database:
/*

-- 1. Set action_type = 'CANCELLED' pada pending task rows yang sudah selesai
--    dan masih menyimpan notes sistem
UPDATE letter_histories
SET notes = NULL
WHERE assigned_to_id IS NOT NULL
  AND notes IS NOT NULL
  AND (
    notes LIKE 'Review task assigned%'
    OR notes LIKE 'Review task reassigned%'
    OR notes LIKE 'Approval task assigned%'
  );

-- 2. Set notes = NULL pada history SUBMITTED yang dibuat sistem
UPDATE letter_histories
SET notes = NULL
WHERE assigned_to_id IS NULL
  AND action_type IN ('SUBMITTED', 'REVISED')
  AND notes IN (
    'Letter submitted for review',
    'Letter revised by creator',
    'Letter resubmitted after revision'
  );

-- 3. Hapus entry SUBMITTED ganda dari resubmit lama (jika ada 2 SUBMITTED dalam 1 detik)
WITH ranked AS (
  SELECT id,
    ROW_NUMBER() OVER (
      PARTITION BY letter_id, action_type, DATE_TRUNC('second', created_at)
      ORDER BY id
    ) as rn
  FROM letter_histories
  WHERE action_type = 'SUBMITTED'
    AND assigned_to_id IS NULL
)
DELETE FROM letter_histories
WHERE id IN (SELECT id FROM ranked WHERE rn > 1);

*/
