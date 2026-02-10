-- ============================================================================
-- Add 2 More Dummy Letters
-- ============================================================================
-- 1 letter in REVIEW phase (PENDING)
-- 1 letter in APPROVAL phase (PENDING)
-- ============================================================================

DO $$
DECLARE
  v_letter_id_review UUID := gen_random_uuid();
  v_letter_id_approval UUID := gen_random_uuid();
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
  
  RAISE NOTICE 'Creating 2 more dummy letters...';
  RAISE NOTICE 'Document Type ID: %', v_doc_type_id;
  RAISE NOTICE 'Instansi ID: %', v_instansi_id;
  
  -- ========================================
  -- Letter 4: SUBMITTED_TO_REVIEW (PENDING REVIEW)
  -- ========================================
  INSERT INTO outgoing_letters (
    id, document_type_id, company_id, created_by_id, sender_id,
    sender_name, sender_email, sender_department, letter_date,
    subject, opening, body, closing,
    recipient_company, recipient_name, recipient_whatsapp, recipient_email, recipient_address,
    status, has_attachments, attachments, created_at, updated_at
  ) VALUES (
    v_letter_id_review, v_doc_type_id, v_instansi_id, v_creator_id, v_creator_id,
    'approver', 'approver@test.com', 'Finance', CURRENT_DATE,
    '[DUMMY] Permohonan Anggaran Proyek',
    'Dengan hormat,',
    '<p>Bersama ini kami mengajukan permohonan anggaran untuk proyek instalasi panel surya di kawasan industri.</p><p>Total anggaran yang dibutuhkan: Rp 750.000.000,-</p><p>Durasi proyek: 8 bulan</p>',
    'Demikian permohonan ini kami sampaikan. Atas perhatian dan persetujuannya kami ucapkan terima kasih.',
    'PT Industri Maju', 'Direktur Keuangan', '+628111222333', 'finance@industrimaju.co.id',
    'Jl. Industri Raya No. 45, Bekasi',
    'SUBMITTED_TO_REVIEW', true,
    '[{"id":"1","name":"Proposal_Proyek.pdf","size":"4.5 MB"},{"id":"2","name":"RAB_Detail.xlsx","size":"1.2 MB"}]'::jsonb,
    NOW() - INTERVAL '3 hours', NOW() - INTERVAL '3 hours'
  );
  
  -- Create PENDING review tracking
  INSERT INTO letter_workflow_trackings (
    letter_id, assigned_to_id, stage_type, sequence, status, created_at
  ) VALUES (
    v_letter_id_review, v_reviewer_id, 'REVIEW', 1, 'PENDING', NOW() - INTERVAL '3 hours'
  );
  
  -- Histories
  INSERT INTO letter_histories (letter_id, action_by_id, action_type, from_status, to_status, created_at)
  VALUES 
    (v_letter_id_review, v_creator_id, 'CREATED', NULL, 'DRAFT', NOW() - INTERVAL '3 hours'),
    (v_letter_id_review, v_creator_id, 'SUBMITTED', 'DRAFT', 'SUBMITTED_TO_REVIEW', NOW() - INTERVAL '3 hours' + INTERVAL '30 minutes');
  
  RAISE NOTICE 'Created Letter 4 (SUBMITTED_TO_REVIEW): %', v_letter_id_review;
  
  -- ========================================
  -- Letter 5: REVIEWED (PENDING APPROVAL)
  -- ========================================
  INSERT INTO outgoing_letters (
    id, document_type_id, company_id, created_by_id, sender_id,
    sender_name, sender_email, sender_department, letter_date,
    subject, opening, body, closing,
    recipient_company, recipient_name, recipient_whatsapp, recipient_email, recipient_address,
    status, has_attachments, attachments, created_at, updated_at
  ) VALUES (
    v_letter_id_approval, v_doc_type_id, v_instansi_id, v_creator_id, v_creator_id,
    'approver', 'approver@test.com', 'Procurement', CURRENT_DATE - INTERVAL '2 days',
    '[DUMMY] Surat Pesanan Pembelian',
    'Dengan hormat,',
    '<p>Bersama ini kami menyampaikan surat pesanan pembelian untuk:</p><ul><li>Panel Surya 500Wp - 200 unit</li><li>Inverter 10KW - 10 unit</li><li>Mounting System - 1 set</li></ul><p>Total nilai: Rp 450.000.000,-</p>',
    'Demikian surat pesanan ini kami sampaikan. Mohon segera diproses.',
    'PT Solar Energy Indonesia', 'Manager Penjualan', '+628999888777', 'sales@solarenergy.co.id',
    'Jl. Energi Baru No. 88, Tangerang',
    'REVIEWED', true,
    '[{"id":"1","name":"Spesifikasi_Produk.pdf","size":"3.8 MB"}]'::jsonb,
    NOW() - INTERVAL '2 days', NOW() - INTERVAL '4 hours'
  );
  
  -- Create APPROVED review tracking
  INSERT INTO letter_workflow_trackings (
    letter_id, assigned_to_id, stage_type, sequence, status, action_at, created_at
  ) VALUES (
    v_letter_id_approval, v_reviewer_id, 'REVIEW', 1, 'APPROVED', NOW() - INTERVAL '4 hours', NOW() - INTERVAL '2 days'
  );
  
  -- Create PENDING approval tracking
  INSERT INTO letter_workflow_trackings (
    letter_id, assigned_to_id, stage_type, sequence, status, created_at
  ) VALUES (
    v_letter_id_approval, v_approver_id, 'APPROVAL', 2, 'PENDING', NOW() - INTERVAL '4 hours'
  );
  
  -- Histories
  INSERT INTO letter_histories (letter_id, action_by_id, action_type, from_status, to_status, created_at)
  VALUES 
    (v_letter_id_approval, v_creator_id, 'CREATED', NULL, 'DRAFT', NOW() - INTERVAL '2 days'),
    (v_letter_id_approval, v_creator_id, 'SUBMITTED', 'DRAFT', 'SUBMITTED_TO_REVIEW', NOW() - INTERVAL '2 days' + INTERVAL '1 hour'),
    (v_letter_id_approval, v_reviewer_id, 'APPROVED_REVIEW', 'SUBMITTED_TO_REVIEW', 'REVIEWED', NOW() - INTERVAL '4 hours');
  
  RAISE NOTICE 'Created Letter 5 (REVIEWED - pending approval): %', v_letter_id_approval;
  
  RAISE NOTICE '===========================================';
  RAISE NOTICE '2 more dummy letters created successfully!';
  RAISE NOTICE '===========================================';
END $$;

-- Verify all dummy data
SELECT 
  '=== ALL DUMMY LETTERS ===' as section,
  ol.subject,
  ol.status,
  ol.created_at::date as date,
  u.nama as created_by
FROM outgoing_letters ol
JOIN users u ON ol.created_by_id = u.id
WHERE ol.subject LIKE '%[DUMMY]%'
ORDER BY ol.created_at DESC;

-- Show all pending reviews (should show 2 letters for reviewer1)
SELECT 
  '=== ALL PENDING REVIEWS ===' as section,
  ol.subject,
  u.nama as assigned_to,
  lwt.status,
  lwt.created_at::date as assigned_date
FROM letter_workflow_trackings lwt
JOIN outgoing_letters ol ON lwt.letter_id = ol.id
JOIN users u ON lwt.assigned_to_id = u.id
WHERE lwt.status = 'PENDING' AND lwt.stage_type = 'REVIEW'
  AND ol.subject LIKE '%[DUMMY]%'
ORDER BY lwt.created_at DESC;

-- Show all pending approvals (should show 2 letters for approver)
SELECT 
  '=== ALL PENDING APPROVALS ===' as section,
  ol.subject,
  u.nama as assigned_to,
  lwt.status,
  lwt.created_at::date as assigned_date
FROM letter_workflow_trackings lwt
JOIN outgoing_letters ol ON lwt.letter_id = ol.id
JOIN users u ON lwt.assigned_to_id = u.id
WHERE lwt.status = 'PENDING' AND lwt.stage_type = 'APPROVAL'
  AND ol.subject LIKE '%[DUMMY]%'
ORDER BY lwt.created_at DESC;
