-- ============================================
-- Migration: Simplify Letter Database
-- ============================================
-- Purpose: 
-- 1. Merge letter_workflow_trackings into letter_histories
-- 2. Drop document_workflow_configs (replaced by document_workflow_stages)
-- 3. Drop letter_workflow_trackings
-- 
-- Date: 2026-02-11
-- Author: AI Assistant
-- ============================================

-- ============================================
-- STEP 1: Backup existing data
-- ============================================

-- Create backup tables
CREATE TABLE IF NOT EXISTS letter_workflow_trackings_backup AS 
SELECT * FROM letter_workflow_trackings;

CREATE TABLE IF NOT EXISTS document_workflow_configs_backup AS 
SELECT * FROM document_workflow_configs;

-- ============================================
-- STEP 2: Alter letter_histories table
-- ============================================

-- Add new columns to letter_histories
ALTER TABLE letter_histories 
ADD COLUMN IF NOT EXISTS stage_type VARCHAR(50),
ADD COLUMN IF NOT EXISTS sequence INTEGER,
ADD COLUMN IF NOT EXISTS assigned_to_id UUID REFERENCES users(id);

-- Add comment for documentation
COMMENT ON COLUMN letter_histories.stage_type IS 'Stage type: REVIEW or APPROVAL';
COMMENT ON COLUMN letter_histories.sequence IS 'Stage sequence number';
COMMENT ON COLUMN letter_histories.assigned_to_id IS 'User assigned to this stage (for tracking pending reviews)';

-- ============================================
-- STEP 3: Migrate data from letter_workflow_trackings to letter_histories
-- ============================================

-- Insert tracking records as history entries
INSERT INTO letter_histories (
    letter_id,
    action_by_id,
    action_type,
    from_status,
    to_status,
    stage_type,
    sequence,
    assigned_to_id,
    notes,
    created_at
)
SELECT 
    letter_id,
    assigned_to_id as action_by_id,
    CASE 
        WHEN status = 'PENDING' THEN 'SUBMITTED'
        WHEN status = 'APPROVED' THEN 'APPROVED_REVIEW'
        WHEN status = 'REJECTED' THEN 'REJECTED'
        WHEN status = 'COMPLETED' THEN 'COMPLETED_STAGE'
        ELSE status
    END as action_type,
    NULL as from_status, -- We don't have previous status in trackings
    status as to_status,
    stage_type,
    sequence,
    assigned_to_id,
    notes,
    COALESCE(action_at, created_at) as created_at
FROM letter_workflow_trackings
WHERE NOT EXISTS (
    -- Avoid duplicates if this migration is run multiple times
    SELECT 1 FROM letter_histories lh 
    WHERE lh.letter_id = letter_workflow_trackings.letter_id
    AND lh.created_at = COALESCE(letter_workflow_trackings.action_at, letter_workflow_trackings.created_at)
);

-- ============================================
-- STEP 4: Create index for better query performance
-- ============================================

CREATE INDEX IF NOT EXISTS idx_letter_histories_stage_type 
ON letter_histories(stage_type) 
WHERE stage_type IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_letter_histories_assigned_to_id 
ON letter_histories(assigned_to_id) 
WHERE assigned_to_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_letter_histories_sequence 
ON letter_histories(sequence) 
WHERE sequence IS NOT NULL;

-- ============================================
-- STEP 5: Create helper function for workflow tracking
-- ============================================

CREATE OR REPLACE FUNCTION get_letter_current_stage(p_letter_id UUID)
RETURNS TABLE (
    stage_type VARCHAR,
    sequence INTEGER,
    assigned_to_id UUID,
    status VARCHAR,
    action_at TIMESTAMPTZ
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        lh.stage_type,
        lh.sequence,
        lh.assigned_to_id,
        lh.to_status as status,
        lh.created_at as action_at
    FROM letter_histories lh
    WHERE lh.letter_id = p_letter_id
    AND lh.stage_type IS NOT NULL
    ORDER BY lh.sequence DESC, lh.created_at DESC
    LIMIT 1;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- STEP 6: Create view for pending reviews (replacement for letter_workflow_trackings queries)
-- ============================================

CREATE OR REPLACE VIEW v_pending_reviews AS
SELECT 
    lh.id as history_id,
    lh.letter_id,
    lh.assigned_to_id,
    lh.stage_type,
    lh.sequence,
    lh.to_status as status,
    lh.notes,
    lh.created_at,
    ol.subject as letter_subject,
    ol.status as letter_status,
    dt.name as document_type_name,
    u.nama as assigned_to_name,
    creator.nama as created_by_name
FROM letter_histories lh
JOIN outgoing_letters ol ON lh.letter_id = ol.id
JOIN document_types dt ON ol.document_type_id = dt.id
LEFT JOIN users u ON lh.assigned_to_id = u.id
LEFT JOIN users creator ON ol.created_by_id = creator.id
WHERE lh.stage_type = 'REVIEW'
AND lh.to_status = 'PENDING'
AND lh.id = (
    -- Get the latest history entry for this letter and sequence
    SELECT MAX(id) 
    FROM letter_histories lh2 
    WHERE lh2.letter_id = lh.letter_id 
    AND lh2.sequence = lh.sequence
);

-- ============================================
-- STEP 7: Create view for pending approvals
-- ============================================

CREATE OR REPLACE VIEW v_pending_approvals AS
SELECT 
    lh.id as history_id,
    lh.letter_id,
    lh.assigned_to_id,
    lh.stage_type,
    lh.sequence,
    lh.to_status as status,
    lh.notes,
    lh.created_at,
    ol.subject as letter_subject,
    ol.status as letter_status,
    dt.name as document_type_name,
    u.nama as assigned_to_name,
    creator.nama as created_by_name
FROM letter_histories lh
JOIN outgoing_letters ol ON lh.letter_id = ol.id
JOIN document_types dt ON ol.document_type_id = dt.id
LEFT JOIN users u ON lh.assigned_to_id = u.id
LEFT JOIN users creator ON ol.created_by_id = creator.id
WHERE lh.stage_type = 'APPROVAL'
AND lh.to_status = 'PENDING'
AND lh.id = (
    SELECT MAX(id) 
    FROM letter_histories lh2 
    WHERE lh2.letter_id = lh.letter_id 
    AND lh2.sequence = lh.sequence
);

-- ============================================
-- STEP 8: Drop old tables
-- ============================================

-- Drop letter_workflow_trackings (data already migrated)
DROP TABLE IF EXISTS letter_workflow_trackings CASCADE;

-- Drop document_workflow_configs (replaced by document_workflow_stages)
DROP TABLE IF EXISTS document_workflow_configs CASCADE;

-- ============================================
-- STEP 9: Verification
-- ============================================

-- Check letter_histories has new columns
SELECT 'letter_histories columns added' as check_item,
       CASE 
           WHEN EXISTS (
               SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'letter_histories' 
               AND column_name IN ('stage_type', 'sequence', 'assigned_to_id')
           ) 
           THEN '✅ PASS' 
           ELSE '❌ FAIL' 
       END as status;

-- Check old tables are dropped
SELECT 'letter_workflow_trackings dropped' as check_item,
       CASE 
           WHEN NOT EXISTS (
               SELECT 1 FROM information_schema.tables 
               WHERE table_name = 'letter_workflow_trackings'
           ) 
           THEN '✅ PASS' 
           ELSE '❌ FAIL' 
       END as status;

SELECT 'document_workflow_configs dropped' as check_item,
       CASE 
           WHEN NOT EXISTS (
               SELECT 1 FROM information_schema.tables 
               WHERE table_name = 'document_workflow_configs'
           ) 
           THEN '✅ PASS' 
           ELSE '❌ FAIL' 
       END as status;

-- ============================================
-- END OF MIGRATION
-- ============================================

/*
ROLLBACK SCRIPT (if needed):

-- Restore from backup
INSERT INTO letter_workflow_trackings SELECT * FROM letter_workflow_trackings_backup;
INSERT INTO document_workflow_configs SELECT * FROM document_workflow_configs_backup;

-- Drop views and functions
DROP VIEW IF EXISTS v_pending_reviews;
DROP VIEW IF EXISTS v_pending_approvals;
DROP FUNCTION IF EXISTS get_letter_current_stage(UUID);

-- Remove columns from letter_histories
ALTER TABLE letter_histories 
DROP COLUMN IF EXISTS stage_type,
DROP COLUMN IF EXISTS sequence,
DROP COLUMN IF EXISTS assigned_to_id;

-- Restore indexes
DROP INDEX IF EXISTS idx_letter_histories_stage_type;
DROP INDEX IF EXISTS idx_letter_histories_assigned_to_id;
DROP INDEX IF EXISTS idx_letter_histories_sequence;

-- Note: letter_workflow_trackings and document_workflow_configs tables
-- need to be recreated manually if you want full rollback
*/
