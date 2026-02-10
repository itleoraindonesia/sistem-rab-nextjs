-- STEP 1: LIHAT DATA USER DAN TIPE DOKUMEN
-- Silakan jalankan blok ini dulu untuk mendapatkan UUID User dan ID Document Type

SELECT id, email, nama, role FROM users ORDER BY nama;

SELECT id, name, code FROM document_types ORDER BY name;

-- STEP 2: INSERT REVIEWER CONFIG (CONTOH)
-- Ganti 'USER_UUID_DISINI' dengan ID User yang akan jadi Reviewer
-- Ganti 'DOC_TYPE_ID_DISINI' dengan ID Document Type (Angka)

/* 
INSERT INTO document_workflow_configs (
  document_type_id,
  user_id,
  stage_type,
  sequence,
  is_active,
  created_at
) VALUES 
(
  1, -- Ganti dengan ID Document Type (Misal: 1 untuk Surat Penawaran)
  'd47ac10b-58cc-4372-a567-0e02b2c3d479', -- Ganti ID User Reviewer
  'REVIEW',
  1,
  true,
  NOW()
);
*/
