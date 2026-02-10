-- RPC Function for Testing: Generate Document Number
-- Format: XXX/INST/KAT/MM/YYYY
-- Example: 001/MMG/SPH/02/2025

CREATE OR REPLACE FUNCTION generate_test_document_number()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  sequence_num TEXT;
  inst_code TEXT := 'TST'; -- Test code
  doc_code TEXT := 'DOC';  -- Generic document code
  month_str TEXT;
  year_str TEXT;
BEGIN
  -- Get current month and year
  month_str := TO_CHAR(CURRENT_DATE, 'MM');
  year_str := TO_CHAR(CURRENT_DATE, 'YYYY');
  
  -- Generate random sequence for testing (001-999)
  sequence_num := LPAD(FLOOR(RANDOM() * 999 + 1)::TEXT, 3, '0');
  
  -- Return formatted document number
  RETURN sequence_num || '/' || inst_code || '/' || doc_code || '/' || month_str || '/' || year_str;
END;
$$;

COMMENT ON FUNCTION generate_test_document_number() IS 'Testing RPC: Generates random document number. Replace with proper sequence logic per document type later.';
