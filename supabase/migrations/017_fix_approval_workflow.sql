-- Migration: Fix Approval Workflow (v017)
-- Date: 2026-02-28
-- ROOT CAUSE yang ditemukan:
--   Ketika reviewer approve setelah resubmit (siklus ke-2+), COUNT query turut
--   menghitung entry lama dari siklus ke-1 (to_status='REVISION_REQUESTED',
--   action_type='REVISION_REQUESTED'). Akibatnya:
--     v_reviewer_count = 2  (entry lama + entry baru)
--     v_approved_count = 1  (hanya entry baru yang to_status='REVIEWED')
--     → 1 ≠ 2 → INSERT pending approval tasks tidak jalan
-- FIX:
--   COUNT hanya entries dari siklus aktif:
--   (to_status IS NULL = masih pending) ATAU (to_status = 'REVIEWED' = sudah approve siklus ini)
--   Ini mengecualikan entry lama dengan to_status='REVISION_REQUESTED'.
-- PLUS:
--   Tambahkan index untuk mempercepat query pending approvals/reviews.

-- ============================================================================
-- DROP & RECREATE: review_letter (versi bersih, final)
-- ============================================================================
-- Drop semua versi yang mungkin ada (overload conflict prevention)
DROP FUNCTION IF EXISTS review_letter(UUID, UUID, TEXT, TEXT);
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
      -- Update pending entry aksi user
      UPDATE letter_histories
      SET to_status   = 'REVISION_REQUESTED',
          action_type = 'REVISION_REQUESTED',
          notes       = p_notes
      WHERE id = v_pending_entry.id;

      -- Cancel reviewer lain (bukan aksi user — notes NULL, action_type = CANCELLED)
      UPDATE letter_histories
      SET to_status   = 'REVISION_REQUESTED',
          action_type = 'CANCELLED',
          notes       = NULL
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
      -- Update reviewer's pending entry
      UPDATE letter_histories
      SET to_status   = 'REVIEWED',
          action_type = 'APPROVED_REVIEW',
          notes       = p_notes
      WHERE id = v_pending_entry.id;

      -- FIX ROOT CAUSE: Hanya hitung entries dari siklus aktif:
      -- - to_status IS NULL  = masih pending (belum direview di siklus ini)
      -- - to_status = 'REVIEWED' = sudah approve di siklus ini
      -- Ini mengecualikan entry lama (to_status='REVISION_REQUESTED') dari siklus sebelumnya.
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
        -- Semua reviewer approved → advance ke REVIEWED
        UPDATE outgoing_letters
        SET status      = 'REVIEWED',
            reviewed_at = now(),
            updated_at  = now()
        WHERE id = p_letter_id;

        -- Buat pending approval tasks (notes = NULL — bukan system string)
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
          NULL,        -- no system notes
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
      RETURN jsonb_build_object('success', false, 'error', 'You are not assigned to approve this letter or already acted');
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

      -- Cancel approval entries lain (jika ada multiple approver)
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

      -- Cancel approval entries lain
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
      'error', 'Invalid action ' || p_action || ' for current letter status ' || v_letter.status::text
    );
  END IF;

  RETURN jsonb_build_object('success', false, 'error', 'Unhandled case');

EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object('success', false, 'error', SQLERRM);
END;
$$;

COMMENT ON FUNCTION review_letter(TEXT, UUID, UUID, TEXT) IS
  'v017: FIX COUNT reviewer — hanya hitung entries dari siklus aktif '
  '(to_status IS NULL OR to_status=REVIEWED). '
  'Excludes old REVISION_REQUESTED entries from previous cycles. '
  'Clean notes (no system strings). Cancel unused pending entries.';

-- ============================================================================
-- INDEX: Percepat query pending reviews & approvals
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_letter_histories_pending_review
  ON letter_histories (assigned_to_id, stage_type, to_status)
  WHERE to_status IS NULL;

CREATE INDEX IF NOT EXISTS idx_letter_histories_letter_stage
  ON letter_histories (letter_id, stage_type, assigned_to_id)
  WHERE assigned_to_id IS NOT NULL;

-- ============================================================================
-- DEBUG QUERIES: Jalankan untuk verifikasi workflow approval
-- ============================================================================
/*

-- 1. Cek semua pending approval tasks
SELECT
  lh.id,
  lh.letter_id,
  lh.stage_type,
  lh.action_type,
  lh.to_status,
  lh.from_status,
  u.email  AS assigned_to_email,
  u.nama   AS assigned_to_nama,
  ol.subject,
  ol.status AS letter_status
FROM letter_histories lh
JOIN users          u  ON lh.assigned_to_id = u.id
JOIN outgoing_letters ol ON lh.letter_id    = ol.id
WHERE lh.stage_type = 'APPROVAL'
  AND lh.to_status  IS NULL
ORDER BY lh.created_at DESC;

-- 2. Cek apakah APPROVAL stage terkonfigurasi
SELECT
  dt.name AS document_type,
  ws.stage_name,
  ws.stage_type,
  ws.sequence,
  ws.assignees,
  ws.is_active
FROM document_workflow_stages ws
JOIN document_types dt ON ws.document_type_id = dt.id
WHERE ws.stage_type = 'APPROVAL'
ORDER BY dt.id, ws.sequence;

-- 3. Lihat seluruh history untuk surat terbaru
SELECT
  lh.id,
  lh.action_type,
  lh.stage_type,
  lh.from_status,
  lh.to_status,
  lh.assigned_to_id,
  u.nama AS assigned_nama,
  lh.notes,
  lh.created_at
FROM letter_histories lh
LEFT JOIN users u ON lh.assigned_to_id = u.id
WHERE lh.letter_id = (
  SELECT id FROM outgoing_letters ORDER BY updated_at DESC LIMIT 1
)
ORDER BY lh.created_at;

*/
