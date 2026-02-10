-- ============================================
-- SEED DOCUMENT TYPES
-- ============================================
-- Purpose: Create initial document types for letter workflow
-- These will be used in the form dropdown
-- ============================================

INSERT INTO document_types (code, name, description, category, is_active, created_at, updated_at)
VALUES
  -- Commercial Documents
  ('SPH', 'Surat Penawaran Harga', 'Dokumen penawaran harga untuk proyek atau pekerjaan', 'Commercial', true, NOW(), NOW()),
  ('PO', 'Purchase Order', 'Dokumen pemesanan barang atau jasa ke vendor', 'Commercial', true, NOW(), NOW()),
  ('INV', 'Invoice', 'Dokumen tagihan pembayaran kepada klien', 'Commercial', true, NOW(), NOW()),
  
  -- Legal Documents
  ('SKT', 'Surat Kontrak', 'Dokumen kontrak kerjasama atau perjanjian', 'Legal', true, NOW(), NOW()),
  ('MOU', 'Memorandum of Understanding', 'Dokumen kesepakatan awal kerjasama', 'Legal', true, NOW(), NOW()),
  
  -- Internal Documents
  ('MEMO', 'Memo Internal', 'Dokumen komunikasi internal antar departemen', 'Internal', true, NOW(), NOW()),
  ('EDM', 'Edaran', 'Dokumen pengumuman atau instruksi resmi', 'Internal', true, NOW(), NOW()),
  
  -- Other Documents
  ('SPK', 'Surat Perintah Kerja', 'Dokumen instruksi pelaksanaan pekerjaan', 'Operation', true, NOW(), NOW()),
  ('SR', 'Surat Referensi', 'Dokumen referensi atau rekomendasi', 'Support', true, NOW(), NOW());

-- ============================================
-- VERIFY DOCUMENT TYPES CREATED
-- ============================================

SELECT 
  id,
  code,
  name,
  description,
  category,
  is_active
FROM document_types
ORDER BY category, name;

-- ============================================
-- DOCUMENT TYPES SUMMARY
-- ============================================
-- Total: 10 document types
-- Commercial: SPH, PO, INV
-- Legal: SKT, MOU
-- Internal: MEMO, EDM
-- Operation: SPK
-- Support: SR
-- ============================================