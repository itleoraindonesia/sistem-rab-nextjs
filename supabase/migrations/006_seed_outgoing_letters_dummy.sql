-- ============================================================================
-- Dummy Data for Outgoing Letters Testing - IMPROVED
-- ============================================================================
-- This migration adds sample data for testing the outgoing letters feature
-- Includes proper workflow trackings for review and approval
-- Run this AFTER all letter setup migrations are complete
-- ============================================================================

-- First, let's check if we have the necessary master data
DO $$
DECLARE
  doc_type_count INT;
  instansi_count INT;
  reviewer_count INT;
  approver_count INT;
BEGIN
  SELECT COUNT(*) INTO doc_type_count FROM document_types WHERE is_active = true;
  SELECT COUNT(*) INTO instansi_count FROM instansi;
  SELECT COUNT(*) INTO reviewer_count FROM users WHERE role = 'reviewer' AND is_active = true;
  SELECT COUNT(*) INTO approver_count FROM users WHERE role = 'approver' AND is_active = true;
  
  IF doc_type_count = 0 THEN
    RAISE EXCEPTION 'No active document types found. Please run migration 004_seed_document_types.sql first.';
  END IF;
  
  IF instansi_count = 0 THEN
    RAISE WARNING 'No instansi found. Creating default instansi...';
    INSERT INTO instansi (nama, alamat, email, telepon)
    VALUES ('PT Leora Indonesia', 'Jl. Raya Industri No. 456, Jakarta Selatan', 'info@leora.co.id', '(021) 1234-5678');
  END IF;
  
  IF reviewer_count = 0 THEN
    RAISE WARNING 'No reviewers found. Please assign reviewer role to at least one user.';
  END IF;
  
  IF approver_count = 0 THEN
    RAISE WARNING 'No approvers found. Please assign approver role to at least one user.';
  END IF;
END $$;

-- Clean up existing dummy data if any
DELETE FROM letter_histories WHERE letter_id IN (
  SELECT id FROM outgoing_letters WHERE subject LIKE '%[DUMMY]%'
);
DELETE FROM letter_workflow_trackings WHERE letter_id IN (
  SELECT id FROM outgoing_letters WHERE subject LIKE '%[DUMMY]%'
);
DELETE FROM outgoing_letters WHERE subject LIKE '%[DUMMY]%';

-- Insert sample outgoing letters with different statuses
DO $$
DECLARE
  v_letter_id_1 UUID;
  v_letter_id_2 UUID;
  v_letter_id_3 UUID;
  v_letter_id_4 UUID;
  v_letter_id_5 UUID;
  v_doc_type_id INT;
  v_instansi_id UUID;
  v_creator_id UUID;
  v_reviewer_id UUID;
  v_approver_id UUID;
BEGIN
  -- Get IDs we need
  SELECT id INTO v_doc_type_id FROM document_types WHERE is_active = true LIMIT 1;
  SELECT id INTO v_instansi_id FROM instansi LIMIT 1;
  SELECT id INTO v_creator_id FROM users WHERE role IN ('admin', 'manager') AND is_active = true LIMIT 1;
  SELECT id INTO v_reviewer_id FROM users WHERE role = 'reviewer' AND is_active = true LIMIT 1;
  SELECT id INTO v_approver_id FROM users WHERE role = 'approver' AND is_active = true LIMIT 1;
  
  -- If no creator found, use any active user
  IF v_creator_id IS NULL THEN
    SELECT id INTO v_creator_id FROM users WHERE is_active = true LIMIT 1;
  END IF;
  
  -- Generate UUIDs for letters
  v_letter_id_1 := gen_random_uuid();
  v_letter_id_2 := gen_random_uuid();
  v_letter_id_3 := gen_random_uuid();
  v_letter_id_4 := gen_random_uuid();
  v_letter_id_5 := gen_random_uuid();
  
  -- Letter 1: DRAFT status
  INSERT INTO outgoing_letters (
    id, document_type_id, company_id, created_by_id, sender_id,
    sender_name, sender_email, sender_department, letter_date,
    subject, opening, body, closing,
    recipient_company, recipient_name, recipient_whatsapp, recipient_email, recipient_address,
    status, has_attachments, attachments, signatories, document_number,
    created_at, updated_at
  ) VALUES (
    v_letter_id_1, v_doc_type_id, v_instansi_id, v_creator_id, v_creator_id,
    (SELECT nama FROM users WHERE id = v_creator_id),
    (SELECT email FROM users WHERE id = v_creator_id),
    'Marketing', CURRENT_DATE,
    '[DUMMY] Penawaran Harga Panel Surya',
    'Dengan hormat,',
    '<p>Bersama ini kami sampaikan penawaran harga untuk kebutuhan panel surya proyek Anda.</p><p>Kami menawarkan panel surya berkualitas tinggi dengan harga kompetitif dan garansi 25 tahun.</p>',
    'Demikian penawaran ini kami sampaikan. Atas perhatian dan kerjasamanya kami ucapkan terima kasih.',
    'PT Maju Jaya Konstruksi', 'Budi Santoso', '+628123456789', 'budi@majujaya.co.id',
    'Jl. Sudirman No. 123, Jakarta Pusat',
    'DRAFT', false, NULL,
    '[{"id":"1","name":"John Doe","position":"Direktur","order":1,"pihak":"Pihak Pertama"}]'::jsonb,
    NULL, NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days'
  );
  
  -- History for Letter 1
  INSERT INTO letter_histories (letter_id, action_by_id, action_type, from_status, to_status, created_at)
  VALUES (v_letter_id_1, v_creator_id, 'CREATED', NULL, 'DRAFT', NOW() - INTERVAL '2 days');
  
  -- Letter 2: SUBMITTED_TO_REVIEW status (WITH PENDING REVIEW TRACKING)
  IF v_reviewer_id IS NOT NULL THEN
    INSERT INTO outgoing_letters (
      id, document_type_id, company_id, created_by_id, sender_id,
      sender_name, sender_email, sender_department, letter_date,
      subject, opening, body, closing,
      recipient_company, recipient_name, recipient_whatsapp, recipient_email, recipient_address,
      status, has_attachments, attachments, signatories, document_number,
      created_at, updated_at
    ) VALUES (
      v_letter_id_2, v_doc_type_id, v_instansi_id, v_creator_id, v_creator_id,
      (SELECT nama FROM users WHERE id = v_creator_id),
      (SELECT email FROM users WHERE id = v_creator_id),
      'HRD', CURRENT_DATE - INTERVAL '1 day',
      '[DUMMY] Keterangan Kerja Karyawan',
      'Dengan hormat,',
      '<p>Yang bertanda tangan di bawah ini menerangkan bahwa:</p><p>Nama: Ahmad Rizki<br/>Jabatan: Staff Marketing<br/>NIK: 12345678</p><p>Adalah benar karyawan PT Leora Indonesia yang masih aktif bekerja.</p>',
      'Demikian surat keterangan ini dibuat untuk dapat dipergunakan sebagaimana mestinya.',
      'Bank Mandiri', 'Customer Service', '+628234567890', 'cs@bankmandiri.co.id',
      'Jl. Thamrin No. 5, Jakarta Pusat',
      'SUBMITTED_TO_REVIEW', true,
      '[{"id":"1","name":"KTP.pdf","size":"2.3 MB"}]'::jsonb,
      '[{"id":"1","name":"Jane Smith","position":"Manager HRD","order":1,"pihak":"Pihak Pertama"}]'::jsonb,
      NULL, NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day'
    );
    
    -- Create PENDING review tracking for Letter 2
    INSERT INTO letter_workflow_trackings (
      letter_id, assigned_to_id, stage_type, sequence, status, created_at
    ) VALUES (
      v_letter_id_2, v_reviewer_id, 'REVIEW', 1, 'PENDING', NOW() - INTERVAL '1 day'
    );
    
    -- Histories for Letter 2
    INSERT INTO letter_histories (letter_id, action_by_id, action_type, from_status, to_status, created_at)
    VALUES 
      (v_letter_id_2, v_creator_id, 'CREATED', NULL, 'DRAFT', NOW() - INTERVAL '1 day'),
      (v_letter_id_2, v_creator_id, 'SUBMITTED', 'DRAFT', 'SUBMITTED_TO_REVIEW', NOW() - INTERVAL '1 day' + INTERVAL '1 hour');
  END IF;
  
  -- Letter 3: REVIEWED status (WITH PENDING APPROVAL TRACKING)
  IF v_reviewer_id IS NOT NULL AND v_approver_id IS NOT NULL THEN
    INSERT INTO outgoing_letters (
      id, document_type_id, company_id, created_by_id, sender_id,
      sender_name, sender_email, sender_department, letter_date,
      subject, opening, body, closing,
      recipient_company, recipient_name, recipient_whatsapp, recipient_email, recipient_address,
      status, has_attachments, attachments, signatories, document_number,
      created_at, updated_at
    ) VALUES (
      v_letter_id_3, v_doc_type_id, v_instansi_id, v_creator_id, v_creator_id,
      (SELECT nama FROM users WHERE id = v_creator_id),
      (SELECT email FROM users WHERE id = v_creator_id),
      'Legal', CURRENT_DATE - INTERVAL '3 days',
      '[DUMMY] Perjanjian Kerjasama Proyek',
      'Dengan hormat,',
      '<p>Pada hari ini telah disepakati perjanjian kerjasama antara PT Leora Indonesia dengan PT Mitra Sejahtera untuk proyek instalasi panel surya.</p><p>Nilai kontrak: Rp 500.000.000,-<br/>Durasi: 6 bulan<br/>Lokasi: Jakarta dan sekitarnya</p>',
      'Demikian perjanjian ini dibuat dalam rangkap 2 (dua) bermaterai cukup dan mempunyai kekuatan hukum yang sama.',
      'PT Mitra Sejahtera', 'Ir. Bambang Wijaya', '+628345678901', 'bambang@mitrasejahtera.co.id',
      'Jl. Gatot Subroto No. 88, Jakarta Selatan',
      'REVIEWED', true,
      '[{"id":"1","name":"Draft_Kontrak.pdf","size":"5.1 MB"},{"id":"2","name":"TOR.pdf","size":"3.2 MB"}]'::jsonb,
      '[{"id":"1","name":"Director","position":"Direktur Utama","order":1,"pihak":"Pihak Pertama"}]'::jsonb,
      NULL, NOW() - INTERVAL '3 days', NOW() - INTERVAL '6 hours'
    );
    
    -- Create APPROVED review tracking (already done)
    INSERT INTO letter_workflow_trackings (
      letter_id, assigned_to_id, stage_type, sequence, status, action_at, created_at
    ) VALUES (
      v_letter_id_3, v_reviewer_id, 'REVIEW', 1, 'APPROVED', NOW() - INTERVAL '6 hours', NOW() - INTERVAL '3 days'
    );
    
    -- Create PENDING approval tracking for Letter 3
    INSERT INTO letter_workflow_trackings (
      letter_id, assigned_to_id, stage_type, sequence, status, created_at
    ) VALUES (
      v_letter_id_3, v_approver_id, 'APPROVAL', 2, 'PENDING', NOW() - INTERVAL '6 hours'
    );
    
    -- Histories for Letter 3
    INSERT INTO letter_histories (letter_id, action_by_id, action_type, from_status, to_status, created_at)
    VALUES 
      (v_letter_id_3, v_creator_id, 'CREATED', NULL, 'DRAFT', NOW() - INTERVAL '3 days'),
      (v_letter_id_3, v_creator_id, 'SUBMITTED', 'DRAFT', 'SUBMITTED_TO_REVIEW', NOW() - INTERVAL '3 days' + INTERVAL '1 hour'),
      (v_letter_id_3, v_reviewer_id, 'APPROVED_REVIEW', 'SUBMITTED_TO_REVIEW', 'REVIEWED', NOW() - INTERVAL '6 hours');
  END IF;
  
  -- Letter 4: APPROVED status (complete workflow)
  IF v_reviewer_id IS NOT NULL AND v_approver_id IS NOT NULL THEN
    INSERT INTO outgoing_letters (
      id, document_type_id, company_id, created_by_id, sender_id,
      sender_name, sender_email, sender_department, letter_date,
      subject, opening, body, closing,
      recipient_company, recipient_name, recipient_whatsapp, recipient_email, recipient_address,
      status, has_attachments, attachments, signatories, document_number,
      approved_at, created_at, updated_at
    ) VALUES (
      v_letter_id_4, v_doc_type_id, v_instansi_id, v_creator_id, v_creator_id,
      (SELECT nama FROM users WHERE id = v_creator_id),
      (SELECT email FROM users WHERE id = v_creator_id),
      'Sales', CURRENT_DATE - INTERVAL '7 days',
      '[DUMMY] Penawaran Panel Lantai Beton',
      'Dengan hormat,',
      '<p>Terima kasih atas kepercayaan Anda kepada PT Leora Indonesia.</p><p>Berikut kami sampaikan penawaran harga untuk panel lantai beton precast:</p><ul><li>Panel Lantai 12cm: Rp 350.000/m²</li><li>Panel Lantai 15cm: Rp 425.000/m²</li><li>Termasuk instalasi dan garansi 10 tahun</li></ul>',
      'Demikian penawaran ini kami sampaikan. Kami siap melayani kebutuhan Anda dengan sepenuh hati.',
      'CV Bangun Sentosa', 'Pak Hendra', '+628456789012', 'hendra@bangunsentosa.com',
      'Jl. Raya Bogor KM 25, Cibinong',
      'APPROVED', false, NULL,
      '[{"id":"1","name":"Sales Manager","position":"Manager Penjualan","order":1,"pihak":"Pihak Pertama"}]'::jsonb,
      '001/LRI/SPH/02/2026',
      NOW() - INTERVAL '5 days', NOW() - INTERVAL '7 days', NOW() - INTERVAL '5 days'
    );
    
    -- Create complete workflow trackings for Letter 4
    INSERT INTO letter_workflow_trackings (
      letter_id, assigned_to_id, stage_type, sequence, status, action_at, created_at
    ) VALUES 
      (v_letter_id_4, v_reviewer_id, 'REVIEW', 1, 'APPROVED', NOW() - INTERVAL '6 days', NOW() - INTERVAL '7 days'),
      (v_letter_id_4, v_approver_id, 'APPROVAL', 2, 'APPROVED', NOW() - INTERVAL '5 days', NOW() - INTERVAL '6 days');
    
    -- Histories for Letter 4
    INSERT INTO letter_histories (letter_id, action_by_id, action_type, from_status, to_status, created_at)
    VALUES 
      (v_letter_id_4, v_creator_id, 'CREATED', NULL, 'DRAFT', NOW() - INTERVAL '7 days'),
      (v_letter_id_4, v_creator_id, 'SUBMITTED', 'DRAFT', 'SUBMITTED_TO_REVIEW', NOW() - INTERVAL '7 days' + INTERVAL '1 hour'),
      (v_letter_id_4, v_reviewer_id, 'APPROVED_REVIEW', 'SUBMITTED_TO_REVIEW', 'REVIEWED', NOW() - INTERVAL '6 days'),
      (v_letter_id_4, v_approver_id, 'APPROVED_FINAL', 'REVIEWED', 'APPROVED', NOW() - INTERVAL '5 days');
  END IF;
  
  -- Letter 5: NEEDS_REVISION status
  IF v_reviewer_id IS NOT NULL THEN
    INSERT INTO outgoing_letters (
      id, document_type_id, company_id, created_by_id, sender_id,
      sender_name, sender_email, sender_department, letter_date,
      subject, opening, body, closing,
      recipient_company, recipient_name, recipient_whatsapp, recipient_email, recipient_address,
      status, has_attachments, attachments, signatories, document_number,
      created_at, updated_at
    ) VALUES (
      v_letter_id_5, v_doc_type_id, v_instansi_id, v_creator_id, v_creator_id,
      (SELECT nama FROM users WHERE id = v_creator_id),
      (SELECT email FROM users WHERE id = v_creator_id),
      'Corporate Secretary', CURRENT_DATE + INTERVAL '5 days',
      '[DUMMY] Undangan Rapat Tahunan',
      'Dengan hormat,',
      '<p>Sehubungan dengan akan diadakannya Rapat Umum Pemegang Saham Tahunan, dengan ini kami mengundang Bapak/Ibu untuk hadir pada:</p><p>Hari/Tanggal: Senin, 17 Februari 2026<br/>Waktu: 09.00 WIB - Selesai<br/>Tempat: Ruang Rapat Utama, Kantor Pusat PT Leora Indonesia</p>',
      'Demikian undangan ini kami sampaikan. Atas perhatian dan kehadirannya kami ucapkan terima kasih.',
      'Para Pemegang Saham', 'Dewan Komisaris', '+628567890123', 'sekretaris@leora.co.id',
      'Jl. Raya Industri No. 456, Jakarta Selatan',
      'NEEDS_REVISION', false, NULL,
      '[{"id":"1","name":"Corporate Secretary","position":"Sekretaris Perusahaan","order":1,"pihak":"Pihak Pertama"}]'::jsonb,
      NULL, NOW() - INTERVAL '2 days', NOW() - INTERVAL '1 day'
    );
    
    -- Create review tracking with REQUESTED_REVISION status
    INSERT INTO letter_workflow_trackings (
      letter_id, assigned_to_id, stage_type, sequence, status, notes, action_at, created_at
    ) VALUES (
      v_letter_id_5, v_reviewer_id, 'REVIEW', 1, 'REQUESTED_REVISION',
      'Mohon perbaiki format tanggal dan tambahkan detail agenda rapat.',
      NOW() - INTERVAL '1 day', NOW() - INTERVAL '2 days'
    );
    
    -- Histories for Letter 5
    INSERT INTO letter_histories (letter_id, action_by_id, action_type, from_status, to_status, notes, created_at)
    VALUES 
      (v_letter_id_5, v_creator_id, 'CREATED', NULL, 'DRAFT', NULL, NOW() - INTERVAL '2 days'),
      (v_letter_id_5, v_creator_id, 'SUBMITTED', 'DRAFT', 'SUBMITTED_TO_REVIEW', NULL, NOW() - INTERVAL '2 days' + INTERVAL '1 hour'),
      (v_letter_id_5, v_reviewer_id, 'REVISION_REQUESTED', 'SUBMITTED_TO_REVIEW', 'NEEDS_REVISION',
       'Mohon perbaiki format tanggal dan tambahkan detail agenda rapat.', NOW() - INTERVAL '1 day');
  END IF;
  
  RAISE NOTICE 'Dummy data created successfully!';
  RAISE NOTICE 'Letter 1 (DRAFT): %', v_letter_id_1;
  RAISE NOTICE 'Letter 2 (SUBMITTED_TO_REVIEW): %', v_letter_id_2;
  RAISE NOTICE 'Letter 3 (REVIEWED - pending approval): %', v_letter_id_3;
  RAISE NOTICE 'Letter 4 (APPROVED): %', v_letter_id_4;
  RAISE NOTICE 'Letter 5 (NEEDS_REVISION): %', v_letter_id_5;
END $$;

-- Verify the data
SELECT 
  ol.id,
  ol.subject,
  ol.status,
  ol.document_number,
  dt.name as document_type,
  u.nama as created_by,
  ol.created_at,
  (SELECT COUNT(*) FROM letter_workflow_trackings WHERE letter_id = ol.id) as tracking_count,
  (SELECT COUNT(*) FROM letter_histories WHERE letter_id = ol.id) as history_count
FROM outgoing_letters ol
JOIN document_types dt ON ol.document_type_id = dt.id
JOIN users u ON ol.created_by_id = u.id
WHERE ol.subject LIKE '%[DUMMY]%'
ORDER BY ol.created_at DESC;

-- Show pending reviews
SELECT 
  'PENDING REVIEWS' as type,
  lwt.id,
  ol.subject,
  u.nama as assigned_to,
  lwt.status,
  lwt.stage_type
FROM letter_workflow_trackings lwt
JOIN outgoing_letters ol ON lwt.letter_id = ol.id
JOIN users u ON lwt.assigned_to_id = u.id
WHERE lwt.status = 'PENDING' AND lwt.stage_type = 'REVIEW'
  AND ol.subject LIKE '%[DUMMY]%';

-- Show pending approvals
SELECT 
  'PENDING APPROVALS' as type,
  lwt.id,
  ol.subject,
  u.nama as assigned_to,
  lwt.status,
  lwt.stage_type
FROM letter_workflow_trackings lwt
JOIN outgoing_letters ol ON lwt.letter_id = ol.id
JOIN users u ON lwt.assigned_to_id = u.id
WHERE lwt.status = 'PENDING' AND lwt.stage_type = 'APPROVAL'
  AND ol.subject LIKE '%[DUMMY]%';
