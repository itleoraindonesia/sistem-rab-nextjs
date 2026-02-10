-- ============================================================================
-- Quick Insert Dummy Letters with Existing Users
-- ============================================================================
-- This script creates dummy letters using your existing reviewer and approver users
-- Run this directly in Supabase SQL Editor
-- ============================================================================

-- Clean up existing dummy data if any
DELETE FROM letter_histories WHERE letter_id IN (
  SELECT id FROM outgoing_letters WHERE subject LIKE '%[DUMMY]%'
);
DELETE FROM letter_workflow_trackings WHERE letter_id IN (
  SELECT id FROM outgoing_letters WHERE subject LIKE '%[DUMMY]%'
);
DELETE FROM outgoing_letters WHERE subject LIKE '%[DUMMY]%';

-- Insert dummy letters
DO $$
DECLARE
  v_letter_id_1 UUID := gen_random_uuid();
  v_letter_id_2 UUID := gen_random_uuid();
  v_letter_id_3 UUID := gen_random_uuid();
  v_doc_type_id INT;
  v_instansi_id UUID;
  v_creator_id UUID := '9539f526-e60a-4397-a0df-ba5d7c5c9346'; -- approver as creator
  v_reviewer_id UUID := '2f05da18-d6c6-45c1-a86a-700cb51255f0'; -- reviewer1
  v_approver_id UUID := '9539f526-e60a-4397-a0df-ba5d7c5c9346'; -- approver
BEGIN
  -- Get first active document type
  SELECT id INTO v_doc_type_id FROM document_types WHERE is_active = true LIMIT 1;
  
  -- Get first instansi
  SELECT id INTO v_instansi_id FROM instansi LIMIT 1;
  
  -- If no instansi, create one
  IF v_instansi_id IS NULL THEN
    INSERT INTO instansi (nama, alamat, email, telepon)
    VALUES ('PT Leora Indonesia', 'Jl. Raya Industri No. 456, Jakarta Selatan', 'info@leora.co.id', '(021) 1234-5678')
    RETURNING id INTO v_instansi_id;
  END IF;
  
  RAISE NOTICE 'Using document_type_id: %', v_doc_type_id;
  RAISE NOTICE 'Using instansi_id: %', v_instansi_id;
  RAISE NOTICE 'Creator: %', v_creator_id;
  RAISE NOTICE 'Reviewer: %', v_reviewer_id;
  RAISE NOTICE 'Approver: %', v_approver_id;
  
  -- ========================================
  -- Letter 1: DRAFT
  -- ========================================
  INSERT INTO outgoing_letters (
    id, document_type_id, company_id, created_by_id, sender_id,
    sender_name, sender_email, sender_department, letter_date,
    subject, opening, body, closing,
    recipient_company, recipient_name, recipient_whatsapp, recipient_email, recipient_address,
    status, created_at, updated_at
  ) VALUES (
    v_letter_id_1, v_doc_type_id, v_instansi_id, v_creator_id, v_creator_id,
    'approver', 'approver@test.com', 'Marketing', CURRENT_DATE,
    '[DUMMY] Penawaran Harga Panel Surya',
    'Dengan hormat,',
    '<p>Bersama ini kami sampaikan penawaran harga untuk kebutuhan panel surya proyek Anda.</p>',
    'Demikian penawaran ini kami sampaikan.',
    'PT Maju Jaya', 'Budi Santoso', '+628123456789', 'budi@majujaya.co.id',
    'Jl. Sudirman No. 123, Jakarta',
    'DRAFT', NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days'
  );
  
  INSERT INTO letter_histories (letter_id, action_by_id, action_type, from_status, to_status, created_at)
  VALUES (v_letter_id_1, v_creator_id, 'CREATED', NULL, 'DRAFT', NOW() - INTERVAL '2 days');
  
  RAISE NOTICE 'Created Letter 1 (DRAFT): %', v_letter_id_1;
  
  -- ========================================
  -- Letter 2: SUBMITTED_TO_REVIEW (PENDING REVIEW)
  -- ========================================
  INSERT INTO outgoing_letters (
    id, document_type_id, company_id, created_by_id, sender_id,
    sender_name, sender_email, sender_department, letter_date,
    subject, opening, body, closing,
    recipient_company, recipient_name, recipient_whatsapp, recipient_email, recipient_address,
    status, created_at, updated_at
  ) VALUES (
    v_letter_id_2, v_doc_type_id, v_instansi_id, v_creator_id, v_creator_id,
    'approver', 'approver@test.com', 'HRD', CURRENT_DATE - INTERVAL '1 day',
    '[DUMMY] Surat Keterangan Kerja',
    'Dengan hormat,',
    '<p>Yang bertanda tangan di bawah ini menerangkan bahwa Ahmad Rizki adalah karyawan aktif.</p>',
    'Demikian surat keterangan ini dibuat.',
    'Bank Mandiri', 'Customer Service', '+628234567890', 'cs@bankmandiri.co.id',
    'Jl. Thamrin No. 5, Jakarta',
    'SUBMITTED_TO_REVIEW', NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day'
  );
  
  -- Create PENDING review tracking
  INSERT INTO letter_workflow_trackings (
    letter_id, assigned_to_id, stage_type, sequence, status, created_at
  ) VALUES (
    v_letter_id_2, v_reviewer_id, 'REVIEW', 1, 'PENDING', NOW() - INTERVAL '1 day'
  );
  
  INSERT INTO letter_histories (letter_id, action_by_id, action_type, from_status, to_status, created_at)
  VALUES 
    (v_letter_id_2, v_creator_id, 'CREATED', NULL, 'DRAFT', NOW() - INTERVAL '1 day'),
    (v_letter_id_2, v_creator_id, 'SUBMITTED', 'DRAFT', 'SUBMITTED_TO_REVIEW', NOW() - INTERVAL '1 day' + INTERVAL '1 hour');
  
  RAISE NOTICE 'Created Letter 2 (SUBMITTED_TO_REVIEW): %', v_letter_id_2;
  
  -- ========================================
  -- Letter 3: REVIEWED (PENDING APPROVAL)
  -- ========================================
  INSERT INTO outgoing_letters (
    id, document_type_id, company_id, created_by_id, sender_id,
    sender_name, sender_email, sender_department, letter_date,
    subject, opening, body, closing,
    recipient_company, recipient_name, recipient_whatsapp, recipient_email, recipient_address,
    status, created_at, updated_at
  ) VALUES (
    v_letter_id_3, v_doc_type_id, v_instansi_id, v_creator_id, v_creator_id,
    'approver', 'approver@test.com', 'Legal', CURRENT_DATE - INTERVAL '3 days',
    '[DUMMY] Perjanjian Kerjasama',
    'Dengan hormat,',
    '<p>Telah disepakati perjanjian kerjasama untuk proyek instalasi panel surya senilai Rp 500.000.000,-</p>',
    'Demikian perjanjian ini dibuat.',
    'PT Mitra Sejahtera', 'Ir. Bambang Wijaya', '+628345678901', 'bambang@mitra.co.id',
    'Jl. Gatot Subroto No. 88, Jakarta',
    'REVIEWED', NOW() - INTERVAL '3 days', NOW() - INTERVAL '6 hours'
  );
  
  -- Create APPROVED review tracking
  INSERT INTO letter_workflow_trackings (
    letter_id, assigned_to_id, stage_type, sequence, status, action_at, created_at
  ) VALUES (
    v_letter_id_3, v_reviewer_id, 'REVIEW', 1, 'APPROVED', NOW() - INTERVAL '6 hours', NOW() - INTERVAL '3 days'
  );
  
  -- Create PENDING approval tracking
  INSERT INTO letter_workflow_trackings (
    letter_id, assigned_to_id, stage_type, sequence, status, created_at
  ) VALUES (
    v_letter_id_3, v_approver_id, 'APPROVAL', 2, 'PENDING', NOW() - INTERVAL '6 hours'
  );
  
  INSERT INTO letter_histories (letter_id, action_by_id, action_type, from_status, to_status, created_at)
  VALUES 
    (v_letter_id_3, v_creator_id, 'CREATED', NULL, 'DRAFT', NOW() - INTERVAL '3 days'),
    (v_letter_id_3, v_creator_id, 'SUBMITTED', 'DRAFT', 'SUBMITTED_TO_REVIEW', NOW() - INTERVAL '3 days' + INTERVAL '1 hour'),
    (v_letter_id_3, v_reviewer_id, 'APPROVED_REVIEW', 'SUBMITTED_TO_REVIEW', 'REVIEWED', NOW() - INTERVAL '6 hours');
  
  RAISE NOTICE 'Created Letter 3 (REVIEWED - pending approval): %', v_letter_id_3;
  
  RAISE NOTICE '===========================================';
  RAISE NOTICE 'Dummy data created successfully!';
  RAISE NOTICE '===========================================';
END $$;

-- Verify the data
SELECT 
  '=== LETTERS ===' as section,
  ol.subject,
  ol.status,
  u.nama as created_by
FROM outgoing_letters ol
JOIN users u ON ol.created_by_id = u.id
WHERE ol.subject LIKE '%[DUMMY]%'
ORDER BY ol.created_at DESC;

-- Show pending reviews (should show 1 letter for reviewer1)
SELECT 
  '=== PENDING REVIEWS ===' as section,
  ol.subject,
  u.nama as assigned_to,
  lwt.status,
  lwt.stage_type
FROM letter_workflow_trackings lwt
JOIN outgoing_letters ol ON lwt.letter_id = ol.id
JOIN users u ON lwt.assigned_to_id = u.id
WHERE lwt.status = 'PENDING' AND lwt.stage_type = 'REVIEW'
  AND ol.subject LIKE '%[DUMMY]%';

-- Show pending approvals (should show 1 letter for approver)
SELECT 
  '=== PENDING APPROVALS ===' as section,
  ol.subject,
  u.nama as assigned_to,
  lwt.status,
  lwt.stage_type
FROM letter_workflow_trackings lwt
JOIN outgoing_letters ol ON lwt.letter_id = ol.id
JOIN users u ON lwt.assigned_to_id = u.id
WHERE lwt.status = 'PENDING' AND lwt.stage_type = 'APPROVAL'
  AND ol.subject LIKE '%[DUMMY]%';
