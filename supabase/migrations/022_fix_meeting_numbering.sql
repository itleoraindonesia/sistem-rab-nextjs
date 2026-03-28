-- Migration: Fix Meeting Number Generation
-- Date: 2026-03-28
-- Changes:
--   1. Create helper function get_roman_month for month conversion
--   2. Create generate_meeting_number function with monthly counter reset
--   3. Create trigger to auto-set meeting_number on insert
--   4. Fix existing NULL meeting_number values

-- ============================================
-- 1. HELPER FUNCTION: Konversi bulan ke angka Romawi
-- ============================================

CREATE OR REPLACE FUNCTION get_roman_month(month_int INT)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RETURN CASE month_int
        WHEN 1 THEN 'I'
        WHEN 2 THEN 'II'
        WHEN 3 THEN 'III'
        WHEN 4 THEN 'IV'
        WHEN 5 THEN 'V'
        WHEN 6 THEN 'VI'
        WHEN 7 THEN 'VII'
        WHEN 8 THEN 'VIII'
        WHEN 9 THEN 'IX'
        WHEN 10 THEN 'X'
        WHEN 11 THEN 'XI'
        WHEN 12 THEN 'XII'
        ELSE ''
    END;
END;
$$;

COMMENT ON FUNCTION get_roman_month(INT) IS 'Mengkonversi bulan (1-12) ke angka Romawi';

-- ============================================
-- 2. MAIN FUNCTION: Generate Meeting Number
-- ============================================
-- Format: XXX/MOM/MM/YYYY
-- XXX  = sequence 3 digit, reset per bulan
-- MOM  = prefix MoM (Minutes of Meeting)
-- MM   = bulan dalam angka Romawi
-- YYYY = tahun 4 digit
-- Contoh: 001/MOM/III/2026, 002/MOM/III/2026

CREATE OR REPLACE FUNCTION generate_meeting_number()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_sequence     INT;
    v_roman_month  TEXT;
    v_year         TEXT;
    v_meeting_number TEXT;
    v_current_month INT;
    v_current_year  INT;
BEGIN
    -- Get current month/year in Asia/Jakarta timezone
    v_current_month := EXTRACT(MONTH FROM CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Jakarta')::INT;
    v_current_year := EXTRACT(YEAR FROM CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Jakarta')::INT;
    
    -- Get current month in Roman numerals
    v_roman_month := get_roman_month(v_current_month);
    
    -- Get current year
    v_year := v_current_year::TEXT;
    
    -- Get next sequence number based on MAX existing sequence + 1
    -- Using timezone-aware comparison with Asia/Jakarta
    SELECT COALESCE(
        MAX(CAST(SUBSTRING(meeting_number FROM '^([0-9]+)') AS INTEGER)),
        0
    ) + 1 INTO v_sequence
    FROM mom_meetings
    WHERE DATE_TRUNC('month', created_at AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Jakarta') = 
          DATE_TRUNC('month', CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Jakarta');
    
    -- Format: 001/MOM/III/2026
    v_meeting_number := LPAD(v_sequence::TEXT, 3, '0')
        || '/MOM/'
        || v_roman_month
        || '/'
        || v_year;
    
    RETURN v_meeting_number;
END;
$$;

COMMENT ON FUNCTION generate_meeting_number() IS 
  'Generate nomor meeting format XXX/MOM/MM/YYYY. Counter reset otomatis tiap bulan baru.';

-- ============================================
-- 3. TRIGGER: Auto-set meeting_number on insert
-- ============================================

CREATE OR REPLACE FUNCTION trg_set_meeting_number()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- Only set meeting_number if it's NULL or empty
    IF NEW.meeting_number IS NULL OR NEW.meeting_number = '' THEN
        NEW.meeting_number := generate_meeting_number();
    END IF;
    
    RETURN NEW;
END;
$$;

COMMENT ON FUNCTION trg_set_meeting_number() IS 
  'Trigger function untuk otomatis set meeting_number saat insert';

-- Drop existing trigger if exists (for idempotency)
DROP TRIGGER IF EXISTS trg_set_meeting_number ON mom_meetings;

-- Create trigger
CREATE TRIGGER trg_set_meeting_number
    BEFORE INSERT ON mom_meetings
    FOR EACH ROW
    EXECUTE FUNCTION trg_set_meeting_number();

COMMENT ON TRIGGER trg_set_meeting_number ON mom_meetings IS 
  'Trigger untuk otomatis generate meeting_number sebelum insert';

-- ============================================
-- 4. FIX EXISTING NULL meeting_number VALUES
-- ============================================
-- Note: Fix existing meetings with NULL meeting_number
-- Assign sequential numbers within each month based on created_at

DO $$
DECLARE
    rec RECORD;
    v_sequence INT;
    v_current_month INT;
    v_current_year INT;
    v_last_month INT := 0;
    v_last_year INT := 0;
BEGIN
    FOR rec IN 
        SELECT id, 
               created_at,
               EXTRACT(MONTH FROM created_at AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Jakarta')::INT as mt_month,
               EXTRACT(YEAR FROM created_at AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Jakarta')::INT as mt_year
        FROM mom_meetings 
        WHERE meeting_number IS NULL OR meeting_number = ''
        ORDER BY created_at AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Jakarta'
    LOOP
        -- Reset counter when month/year changes
        IF rec.mt_month != v_last_month OR rec.mt_year != v_last_year THEN
            v_sequence := 1;
            v_last_month := rec.mt_month;
            v_last_year := rec.mt_year;
        ELSE
            v_sequence := v_sequence + 1;
        END IF;
        
        UPDATE mom_meetings
        SET meeting_number = LPAD(v_sequence::TEXT, 3, '0') 
            || '/MOM/' 
            || get_roman_month(rec.mt_month)
            || '/'
            || rec.mt_year::TEXT
        WHERE id = rec.id;
    END LOOP;
    
    RAISE NOTICE 'Fixed existing meetings with NULL meeting_number';
END;
$$;

-- ============================================
-- 5. UPDATE RPC FUNCTION UNTUK PREVIEW (OPTIONAL)
-- ============================================
-- Update fungsi yang sudah ada untuk konsistensi

CREATE OR REPLACE FUNCTION get_generated_meeting_number_preview()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RETURN generate_meeting_number();
END;
$$;

COMMENT ON FUNCTION get_generated_meeting_number_preview() IS 
  'Preview nomor meeting yang akan digenerate (untuk UI). Note: Ini adalah preview, nomor asli digenerate saat insert.';
