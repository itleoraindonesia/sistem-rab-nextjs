-- Buat enum kebutuhan_type
CREATE TYPE kebutuhan_type AS ENUM (
  'Pagar',
  'Gudang',
  'Kos/Kontrakan',
  'Toko/Ruko',
  'Rumah',
  'Villa',
  'Hotel',
  'Rumah Sakit',
  'Panel Saja',
  'U-Ditch',
  'Plastik Board'
);

-- Alter kolom kebutuhan ke enum
ALTER TABLE clients 
ALTER COLUMN kebutuhan TYPE kebutuhan_type 
USING kebutuhan::kebutuhan_type;

-- Drop constraint lama (jika ada)
ALTER TABLE clients DROP CONSTRAINT IF EXISTS clients_kebutuhan_check;
