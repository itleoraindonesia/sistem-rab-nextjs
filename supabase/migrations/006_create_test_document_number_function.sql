-- ============================================
-- CREATE TEST DOCUMENT NUMBER GENERATOR
-- ============================================
-- Purpose: Generate sequential TEST document numbers
-- Format: TEST-1, TEST-2, TEST-3, etc.
-- Usage: Replace with real function when production ready
-- ============================================

-- Create or replace the function
CREATE OR REPLACE FUNCTION generate_test_document_number()
RETURNS TEXT AS $$
DECLARE
  v_next_number INT;
  v_document_number TEXT;
BEGIN
  -- Get the highest TEST number and increment
  SELECT COALESCE(
    MAX(CAST(SUBSTRING(document_number FROM 6) AS INT)),
    0
  ) + 1
  INTO v_next_number
  FROM outgoing_letters
  WHERE document_number LIKE 'TEST-%';
  
  -- Generate document number
  v_document_number := 'TEST-' || v_next_number;
  
  RETURN v_document_number;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- TEST THE FUNCTION
-- ============================================

-- Test the function (will return TEST-1 on first run)
SELECT generate_test_document_number() as next_document_number;

-- ============================================
-- USAGE EXAMPLE
-- ============================================

-- Example: Update a letter with document number
/*
UPDATE outgoing_letters
SET document_number = generate_test_document_number(),
    status = 'APPROVED',
    approved_at = NOW()
WHERE id = 'letter-uuid-here';
*/

-- ============================================
-- NOTES
-- ============================================
-- 1. This function generates sequential numbers: TEST-1, TEST-2, TEST-3...
-- 2. Numbers are unique per table
-- 3. Replace this function with real document number generator later
-- 4. Real format should be: XXX/INST/KAT/MM/YYYY (e.g., 001/MMG/SPH/02/2025)
-- ============================================