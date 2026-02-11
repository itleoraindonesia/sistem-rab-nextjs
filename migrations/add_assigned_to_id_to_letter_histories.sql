-- Add assigned_to_id column to letter_histories table
-- This field tracks who is assigned to review/approve the letter

ALTER TABLE letter_histories 
ADD COLUMN IF NOT EXISTS assigned_to_id UUID REFERENCES users(id);

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_letter_histories_assigned_to_id 
ON letter_histories(assigned_to_id);

-- Add index for common query patterns
CREATE INDEX IF NOT EXISTS idx_letter_histories_assigned_status 
ON letter_histories(assigned_to_id, to_status, stage_type);

-- Add comment
COMMENT ON COLUMN letter_histories.assigned_to_id IS 'User ID of the person assigned to review/approve this letter (if applicable)';
