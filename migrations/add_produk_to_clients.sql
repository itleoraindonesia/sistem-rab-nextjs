-- Migration: Add produk column to clients table
-- Date: 2026-01-14
-- Description: Add product/service type field to track what clients are interested in

-- Add produk column
ALTER TABLE clients 
ADD COLUMN IF NOT EXISTS produk TEXT;

-- Add check constraint for valid produk values
ALTER TABLE clients
ADD CONSTRAINT clients_produk_check 
CHECK (produk IN (
  'Panel Beton',
  'Pagar Beton',
  'Sandwich Panel',
  'Panel Surya',
  'Plastik Board',
  'Ponton Terapung',
  'Jasa Konstruksi',
  'Jasa Renovasi',
  'Jasa RAB / Gambar'
));

-- Add comment
COMMENT ON COLUMN clients.produk IS 'Product/service type the client is interested in';
