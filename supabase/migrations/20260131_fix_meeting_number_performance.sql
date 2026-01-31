-- Fix performance issue in meeting number preview function
-- and allow meeting_number to be nullable for auto-generation

-- 1. Make meeting_number nullable (if not already)
ALTER TABLE mom_meetings ALTER COLUMN meeting_number DROP NOT NULL;

-- 2. Update the preview function to use sequence instead of COUNT(*)
CREATE OR REPLACE FUNCTION get_generated_meeting_number_preview()
RETURNS TEXT AS $$
DECLARE
    seq_val INTEGER;
    roman_month TEXT;
    year_val TEXT;
    formatted_number TEXT;
    current_ts TIMESTAMP := NOW();
BEGIN
    -- Use the sequence's current value + 1 for preview (much faster than COUNT)
    -- This doesn't increment the sequence, just peeks at what the next value would be
    BEGIN
        seq_val := currval('mom_meeting_number_seq') + 1;
    EXCEPTION
        WHEN OBJECT_NOT_IN_PREREQUISITE_STATE THEN
            -- Sequence hasn't been used yet, start at 1
            seq_val := 1;
    END;
    
    year_val := to_char(current_ts, 'YYYY');
    
    roman_month := CASE to_char(current_ts, 'MM')
        WHEN '01' THEN 'I'
        WHEN '02' THEN 'II'
        WHEN '03' THEN 'III'
        WHEN '04' THEN 'IV'
        WHEN '05' THEN 'V'
        WHEN '06' THEN 'VI'
        WHEN '07' THEN 'VII'
        WHEN '08' THEN 'VIII'
        WHEN '09' THEN 'IX'
        WHEN '10' THEN 'X'
        WHEN '11' THEN 'XI'
        WHEN '12' THEN 'XII'
    END;

    formatted_number := lpad(seq_val::text, 3, '0') || '/MOM/' || roman_month || '/' || year_val;
    
    RETURN formatted_number;
END;
$$ LANGUAGE plpgsql;
