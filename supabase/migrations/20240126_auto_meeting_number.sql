-- 1. Create a sequence for the meeting number
CREATE SEQUENCE IF NOT EXISTS mom_meeting_number_seq;

-- 2. Create the function to generate the formatted number
CREATE OR REPLACE FUNCTION generate_mom_number()
RETURNS TRIGGER AS $$
DECLARE
    seq_val INTEGER;
    roman_month TEXT;
    year_val TEXT;
    formatted_number TEXT;
BEGIN
    -- Only generate if meeting_number is null
    IF NEW.meeting_number IS NULL THEN
        -- Get next value from sequence
        seq_val := nextval('mom_meeting_number_seq');
        
        -- Get current year
        year_val := to_char(NEW.meeting_date, 'YYYY');
        
        -- Get Roman numeral for month
        roman_month := CASE to_char(NEW.meeting_date, 'MM')
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

        -- Format: 001/MOM/I/2026
        formatted_number := lpad(seq_val::text, 3, '0') || '/MOM/' || roman_month || '/' || year_val;
        
        NEW.meeting_number := formatted_number;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 3. Create the trigger
DROP TRIGGER IF EXISTS set_mom_number_trigger ON mom_meetings;

CREATE TRIGGER set_mom_number_trigger
BEFORE INSERT ON mom_meetings
FOR EACH ROW
EXECUTE FUNCTION generate_mom_number();

-- 4. Create RPC specific for frontend preview (Optional but requested by frontend code)
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
