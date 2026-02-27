-- Migration: Schema improvements for outgoing letters
-- Date: 2026-02-27
-- Changes:
--   1. Add `code` field to instansi (untuk format nomor surat: 001/MMG/SPH/02/2025)
--   2. Add tracking columns to outgoing_letters (submitted_at, reviewed_at, revision_count)
--   3. Fix company_id NOT NULL constraint
--   4. Create proper generate_document_number RPC (ganti generate_test_document_number)
--   5. Update submit_letter_for_review & resubmit_revision to set submitted_at
--   6. Update review_letter to set reviewed_at
--   7. Update resubmit_revision to increment revision_count

-- ============================================
-- 1. TAMBAH FIELD code DI instansi
-- ============================================

ALTER TABLE instansi
  ADD COLUMN IF NOT EXISTS code VARCHAR(10);

-- Update existing instansi dengan code dari nama (ambil 3 huruf kapital pertama)
-- Bisa di-override manual setelah migration
UPDATE instansi
SET code = UPPER(LEFT(REGEXP_REPLACE(nama, '[^a-zA-Z]', '', 'g'), 3))
WHERE code IS NULL;

COMMENT ON COLUMN instansi.code IS 'Kode singkat instansi untuk nomor surat, contoh: MMG, LKI. Maks 10 karakter.';

-- ============================================
-- 2. TAMBAH TRACKING COLUMNS DI outgoing_letters
-- ============================================

ALTER TABLE outgoing_letters
  ADD COLUMN IF NOT EXISTS submitted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS revision_count INT NOT NULL DEFAULT 0;

-- Backfill submitted_at dari letter_histories yang ada
UPDATE outgoing_letters ol
SET submitted_at = (
  SELECT MIN(lh.created_at)
  FROM letter_histories lh
  WHERE lh.letter_id = ol.id
    AND lh.action_type = 'SUBMITTED'
    AND lh.assigned_to_id IS NULL -- entry status change, bukan pending task
)
WHERE submitted_at IS NULL;

-- Backfill reviewed_at dari letter_histories yang ada
UPDATE outgoing_letters ol
SET reviewed_at = (
  SELECT MAX(lh.created_at)
  FROM letter_histories lh
  WHERE lh.letter_id = ol.id
    AND lh.to_status = 'REVIEWED'
)
WHERE reviewed_at IS NULL;

-- Backfill revision_count dari letter_histories yang ada
UPDATE outgoing_letters ol
SET revision_count = (
  SELECT COUNT(*)
  FROM letter_histories lh
  WHERE lh.letter_id = ol.id
    AND lh.action_type = 'REVISION_REQUESTED'
)
WHERE revision_count = 0;

COMMENT ON COLUMN outgoing_letters.submitted_at IS 'Waktu pertama kali surat disubmit untuk review';
COMMENT ON COLUMN outgoing_letters.reviewed_at IS 'Waktu surat selesai di-review (semua reviewer approve)';
COMMENT ON COLUMN outgoing_letters.revision_count IS 'Jumlah berapa kali surat diminta revisi';

-- ============================================
-- 3. FIX company_id NOT NULL
-- ============================================

-- Cek dulu apakah ada data yang company_id-nya NULL sebelum set NOT NULL
-- Jika ada, set ke instansi pertama yang tersedia sebagai fallback
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM outgoing_letters WHERE company_id IS NULL) THEN
    UPDATE outgoing_letters
    SET company_id = (SELECT id FROM instansi ORDER BY created_at LIMIT 1)
    WHERE company_id IS NULL;
  END IF;
END $$;

ALTER TABLE outgoing_letters
  ALTER COLUMN company_id SET NOT NULL;

-- ============================================
-- 4. RPC: generate_document_number (proper, ganti generate_test_document_number)
-- ============================================
-- Format: XXX/INST/KAT/MM/YYYY
-- XXX  = sequence 3 digit, reset per bulan per instansi per document type
-- INST = instansi.code (contoh: MMG)
-- KAT  = document_types.code (contoh: SPH)
-- MM   = bulan 2 digit
-- YYYY = tahun 4 digit

CREATE OR REPLACE FUNCTION generate_document_number(
  p_letter_id UUID
)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_letter        outgoing_letters%ROWTYPE;
  v_instansi_code TEXT;
  v_doc_type_code TEXT;
  v_month         TEXT;
  v_year          TEXT;
  v_sequence      INT;
  v_doc_number    TEXT;
BEGIN
  -- Get letter data
  SELECT * INTO v_letter
  FROM outgoing_letters
  WHERE id = p_letter_id;

  IF v_letter.id IS NULL THEN
    RAISE EXCEPTION 'Letter not found: %', p_letter_id;
  END IF;

  -- Get instansi code
  SELECT COALESCE(code, UPPER(LEFT(REGEXP_REPLACE(nama, '[^a-zA-Z]', '', 'g'), 3)))
  INTO v_instansi_code
  FROM instansi
  WHERE id = v_letter.company_id;

  IF v_instansi_code IS NULL THEN
    RAISE EXCEPTION 'Instansi not found or has no code for letter: %', p_letter_id;
  END IF;

  -- Get document type code
  SELECT code INTO v_doc_type_code
  FROM document_types
  WHERE id = v_letter.document_type_id;

  IF v_doc_type_code IS NULL THEN
    RAISE EXCEPTION 'Document type not found for letter: %', p_letter_id;
  END IF;

  -- Get current month and year
  v_month := TO_CHAR(NOW(), 'MM');
  v_year  := TO_CHAR(NOW(), 'YYYY');

  -- Get next sequence: hitung approved letters bulan ini, instansi ini, doc type ini
  SELECT COUNT(*) + 1 INTO v_sequence
  FROM outgoing_letters ol
  JOIN instansi i ON ol.company_id = i.id
  JOIN document_types dt ON ol.document_type_id = dt.id
  WHERE ol.status = 'APPROVED'
    AND COALESCE(i.code, UPPER(LEFT(REGEXP_REPLACE(i.nama, '[^a-zA-Z]', '', 'g'), 3))) = v_instansi_code
    AND dt.code = v_doc_type_code
    AND TO_CHAR(ol.approved_at, 'MM') = v_month
    AND TO_CHAR(ol.approved_at, 'YYYY') = v_year
    AND ol.id != p_letter_id; -- exclude surat ini sendiri

  -- Format: 001/MMG/SPH/02/2025
  v_doc_number := LPAD(v_sequence::TEXT, 3, '0')
    || '/' || v_instansi_code
    || '/' || v_doc_type_code
    || '/' || v_month
    || '/' || v_year;

  RETURN v_doc_number;
END;
$$;

COMMENT ON FUNCTION generate_document_number(UUID) IS
  'Generate nomor surat format XXX/INST/KAT/MM/YYYY. Dipanggil saat approval final.';

-- ============================================
-- 5. UPDATE review_letter RPC
--    - Tambah set reviewed_at saat status jadi REVIEWED
--    - Tambah set submitted_at saat submit (via submit_letter_for_review)
--    - Gunakan generate_document_number (bukan generate_test_document_number)
-- ============================================

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
          notes = p_notes
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
          notes = p_notes
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

COMMENT ON FUNCTION review_letter(TEXT, UUID, UUID, TEXT) IS
  'Handle review dan approval surat. Actions: APPROVE, REQUEST_REVISION (reviewer), APPROVED_FINAL, REJECT (approver).';

-- ============================================
-- 6. UPDATE submit_letter_for_review
--    - Tambah set submitted_at
-- ============================================

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
BEGIN
  SELECT * INTO v_letter FROM outgoing_letters WHERE id = p_letter_id;

  IF v_letter.id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Letter not found');
  END IF;

  IF v_letter.status != 'DRAFT' THEN
    RETURN jsonb_build_object('success', false, 'error', 'Only draft letters can be submitted for review');
  END IF;

  v_document_type_id := v_letter.document_type_id;

  -- Update status + set submitted_at (pertama kali submit)
  UPDATE outgoing_letters
  SET status = 'SUBMITTED_TO_REVIEW',
      submitted_at = COALESCE(submitted_at, now()),
      updated_at = now()
  WHERE id = p_letter_id;

  -- Insert status change history
  INSERT INTO letter_histories (letter_id, action_by_id, action_type, from_status, to_status, notes, created_at)
  VALUES (p_letter_id, p_user_id, 'SUBMITTED', 'DRAFT', 'SUBMITTED_TO_REVIEW', 'Letter submitted for review', now());

  -- Create pending review tasks
  INSERT INTO letter_histories (
    letter_id, action_by_id, assigned_to_id, action_type,
    from_status, to_status, stage_type, sequence, notes, created_at
  )
  SELECT
    p_letter_id,
    p_user_id,
    (elem->>'user_id')::uuid,
    'SUBMITTED',
    NULL,
    NULL,
    'REVIEW',
    ws.sequence,
    'Review task assigned - Stage: ' || ws.stage_name,
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

-- ============================================
-- 7. UPDATE resubmit_revision
--    - Tambah increment revision_count + set submitted_at
-- ============================================

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
BEGIN
  SELECT * INTO v_letter FROM outgoing_letters WHERE id = p_letter_id;

  IF v_letter.id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Letter not found');
  END IF;

  IF v_letter.status != 'REVISION_REQUESTED' THEN
    RETURN jsonb_build_object('success', false, 'error', 'Only letters in revision can be resubmitted');
  END IF;

  v_document_type_id := v_letter.document_type_id;

  -- Hapus pending review entries lama (to_status IS NULL)
  DELETE FROM letter_histories
  WHERE letter_id = p_letter_id
    AND stage_type = 'REVIEW'
    AND to_status IS NULL;

  -- Update letter status + set submitted_at
  UPDATE outgoing_letters
  SET status = 'SUBMITTED_TO_REVIEW',
      submitted_at = COALESCE(submitted_at, now()),
      updated_at = now()
  WHERE id = p_letter_id;

  -- Insert history REVISED + SUBMITTED
  INSERT INTO letter_histories (letter_id, action_by_id, action_type, from_status, to_status, notes, created_at)
  VALUES
    (p_letter_id, p_user_id, 'REVISED', 'REVISION_REQUESTED', NULL, 'Letter revised by creator', now()),
    (p_letter_id, p_user_id, 'SUBMITTED', 'REVISION_REQUESTED', 'SUBMITTED_TO_REVIEW', 'Letter resubmitted after revision', now() + interval '1 millisecond');

  -- Buat ulang pending review tasks
  INSERT INTO letter_histories (
    letter_id, action_by_id, assigned_to_id, action_type,
    from_status, to_status, stage_type, sequence, notes, created_at
  )
  SELECT
    p_letter_id,
    p_user_id,
    (elem->>'user_id')::uuid,
    'SUBMITTED',
    NULL,
    NULL,
    'REVIEW',
    ws.sequence,
    'Review task reassigned - Stage: ' || ws.stage_name,
    now() + interval '2 milliseconds'
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

COMMENT ON FUNCTION resubmit_revision(UUID, UUID) IS
  'Resubmit surat setelah revisi. Reset workflow review dari awal.';
