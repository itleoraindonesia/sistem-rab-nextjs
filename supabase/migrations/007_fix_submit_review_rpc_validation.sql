-- Migration: Fix submit_letter_for_review RPC - Add validation for workflow stages
-- Date: 2026-02-27
-- Issues fixed:
--   1. Jika tidak ada document_workflow_stages untuk document type, 
--      RPC dulu return success padahal tidak ada pending review tasks dibuat
--   2. Tambah error informatif jika workflow belum dikonfigurasi

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

-- Juga update resubmit_revision dengan validasi yang sama
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

COMMENT ON FUNCTION submit_letter_for_review(UUID, UUID) IS
  'Submit draft letter untuk review. Validates workflow stages exist sebelum submit.';

COMMENT ON FUNCTION resubmit_revision(UUID, UUID) IS
  'Resubmit surat setelah revisi. Reset workflow review dari awal. Validates stages exist.';

-- ============================================================================
-- DIAGNOSTIC QUERY: Cek konfigurasi workflow
-- ============================================================================
-- Jalankan ini untuk debug:
/*
SELECT
  dt.name as document_type,
  dt.id as document_type_id,
  ws.stage_name,
  ws.stage_type,
  ws.sequence,
  ws.is_active,
  ws.assignees
FROM document_types dt
LEFT JOIN document_workflow_stages ws ON dt.id = ws.document_type_id AND ws.is_active = true
ORDER BY dt.id, ws.sequence;
*/
