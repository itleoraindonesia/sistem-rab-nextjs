-- Buat enum produk_type (jika belum ada)
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'produk_type') THEN
    CREATE TYPE produk_type AS ENUM (
      'Panel Beton',
      'Pagar Beton',
      'Sandwich Panel',
      'Panel Surya',
      'Plastik Board',
      'Ponton Terapung',
      'Jasa Konstruksi',
      'Jasa Renovasi',
      'Jasa RAB/Gambar',
      'U-Ditch'
    );
  END IF;
END $$;

-- Update null/empty values to null explicitly
UPDATE clients SET produk = NULL WHERE produk IS NULL OR produk = '' OR produk = '-';

-- Drop constraint lama
ALTER TABLE clients DROP CONSTRAINT IF EXISTS clients_produk_check;

-- Alter kolom produk ke enum (nullable)
ALTER TABLE clients 
ALTER COLUMN produk TYPE produk_type 
USING produk::text::produk_type;
