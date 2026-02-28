-- Migration: Add Tahu Beton to enum types
-- Date: 2026-02-28
-- Changes:
--   1. Add 'Tahu Beton' to produk_type enum
--   2. Add 'Tahu Beton' to kebutuhan_type enum

-- Add 'Tahu Beton' to produk_type enum (products)
ALTER TYPE produk_type ADD VALUE IF NOT EXISTS 'Tahu Beton';

-- Add 'Tahu Beton' to kebutuhan_type enum (needs/requirements)
ALTER TYPE kebutuhan_type ADD VALUE IF NOT EXISTS 'Tahu Beton';
