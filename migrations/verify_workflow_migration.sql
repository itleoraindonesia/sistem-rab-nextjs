-- ============================================
-- Verification Script: Workflow Migration
-- ============================================
-- Purpose: Verify that document_workflow_stages table
-- was created and data was migrated correctly from document_workflow_configs

-- ============================================
-- 1. VERIFY TABLE STRUCTURE
-- ============================================

-- Verify column definitions match expected schema
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'document_workflow_stages'
ORDER BY ordinal_position;

-- Verify table exists
SELECT 
    table_name,
    table_schema
FROM information_schema.tables
WHERE table_name = 'document_workflow_stages';

-- Verify constraints
SELECT 
    con.conname AS constraint_name,
    con.contype AS constraint_type,
    pg_get_constraintdef(con.oid) AS constraint_definition
FROM pg_constraint con
JOIN pg_class cl ON con.conrelid = cl.oid
JOIN pg_namespace ns ON cl.relnamespace = ns.oid
WHERE cl.relname = 'document_workflow_stages'
    AND ns.nspname = 'public'
ORDER BY con.conname;

-- Verify indexes
SELECT 
    indexname AS index_name,
    indexdef AS index_definition
FROM pg_indexes
WHERE tablename = 'document_workflow_stages'
ORDER BY indexname;

-- ============================================
-- 2. VERIFY DATA MIGRATION
-- ============================================

-- Count records in old table (document_workflow_configs)
SELECT 'Old table (document_workflow_configs) count' AS description, COUNT(*) AS count
FROM document_workflow_configs;

-- Count records in new table (document_workflow_stages)
SELECT 'New table (document_workflow_stages) count' AS description, COUNT(*) AS count
FROM document_workflow_stages;

-- Count active records in new table
SELECT 'Active stages count' AS description, COUNT(*) AS count
FROM document_workflow_stages
WHERE is_active = true;

-- Show sample data from new table
SELECT 
    id,
    document_type_id,
    stage_type,
    stage_name,
    sequence,
    completion_rule,
    is_required,
    is_active,
    jsonb_array_length(assignees) AS assignee_count,
    created_at
FROM document_workflow_stages
ORDER BY document_type_id, sequence
LIMIT 10;

-- Compare: Show how old data was grouped into new stages
SELECT 
    dwc.document_type_id,
    dwc.stage_type,
    dwc.sequence,
    COUNT(dwc.id) AS old_records_count,
    dws.id AS new_stage_id,
    dws.stage_name,
    jsonb_array_length(dws.assignees) AS assignees_in_stage,
    dws.completion_rule
FROM document_workflow_configs dwc
LEFT JOIN document_workflow_stages dws ON 
    dws.document_type_id = dwc.document_type_id AND 
    dws.stage_type = dwc.stage_type AND 
    dws.sequence = dwc.sequence
WHERE dwc.is_active = true
GROUP BY 
    dwc.document_type_id, 
    dwc.stage_type, 
    dwc.sequence,
    dws.id,
    dws.stage_name,
    dws.completion_rule
ORDER BY dwc.document_type_id, dwc.sequence;

-- Verify assignees JSON format is correct
SELECT 
    id,
    stage_name,
    assignees
FROM document_workflow_stages
WHERE 
    NOT (assignees IS NULL OR 
         jsonb_typeof(assignees) = 'array')
LIMIT 10;

-- Show assignees details for a sample stage
SELECT 
    id,
    stage_name,
    sequence,
    jsonb_pretty(assignees) AS assignees_details
FROM document_workflow_stages
ORDER BY document_type_id, sequence
LIMIT 3;

-- ============================================
-- 3. VERIFY VIEW
-- ============================================

-- Check if view exists
SELECT 
    table_name,
    table_schema
FROM information_schema.views
WHERE table_name = 'v_document_workflow_summary';

-- Show view definition
SELECT 
    viewname AS view_name,
    definition AS view_definition
FROM pg_views
WHERE viewname = 'v_document_workflow_summary';

-- Query the view to see sample data
SELECT 
    document_type_id,
    document_type_name,
    document_type_code,
    stage_id,
    stage_type,
    stage_name,
    sequence,
    assignee_count,
    completion_rule,
    is_required,
    is_active
FROM v_document_workflow_summary
ORDER BY document_type_id, sequence
LIMIT 20;

-- ============================================
-- 4. VERIFY REFERENCES IN letter_workflow_trackings
-- ============================================

-- Check if stage_id column exists in letter_workflow_trackings
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'letter_workflow_trackings'
    AND column_name = 'stage_id';

-- Show sample letter_workflow_trackings with stage_id
SELECT 
    id,
    letter_id,
    sequence,
    stage_type,
    stage_id,
    assigned_to_id,
    status
FROM letter_workflow_trackings
WHERE stage_id IS NOT NULL
ORDER BY created_at DESC
LIMIT 10;

-- Check for orphaned stage_ids (stage_id that doesn't exist in document_workflow_stages)
SELECT 
    lwt.id AS tracking_id,
    lwt.stage_id,
    lwt.letter_id
FROM letter_workflow_trackings lwt
LEFT JOIN document_workflow_stages dws ON lwt.stage_id = dws.id
WHERE lwt.stage_id IS NOT NULL 
    AND dws.id IS NULL;

-- ============================================
-- 5. AGGREGATE STATISTICS
-- ============================================

-- Summary statistics
SELECT 
    'Total Document Types' AS metric,
    (SELECT COUNT(*) FROM document_types WHERE is_active = true) AS value
UNION ALL
SELECT 
    'Document Types with Workflow' AS metric,
    (SELECT COUNT(DISTINCT document_type_id) FROM document_workflow_stages WHERE is_active = true) AS value
UNION ALL
SELECT 
    'Total Workflow Stages' AS metric,
    (SELECT COUNT(*) FROM document_workflow_stages WHERE is_active = true) AS value
UNION ALL
SELECT 
    'Total Assignees in All Stages' AS metric,
    (SELECT SUM(jsonb_array_length(assignees)) FROM document_workflow_stages WHERE is_active = true) AS value
UNION ALL
SELECT 
    'Stages with ALL completion rule' AS metric,
    (SELECT COUNT(*) FROM document_workflow_stages WHERE completion_rule = 'ALL' AND is_active = true) AS value
UNION ALL
SELECT 
    'Stages with ANY_ONE completion rule' AS metric,
    (SELECT COUNT(*) FROM document_workflow_stages WHERE completion_rule = 'ANY_ONE' AND is_active = true) AS value
UNION ALL
SELECT 
    'Stages with MAJORITY completion rule' AS metric,
    (SELECT COUNT(*) FROM document_workflow_stages WHERE completion_rule = 'MAJORITY' AND is_active = true) AS value
UNION ALL
SELECT 
    'Stages with REVIEW type' AS metric,
    (SELECT COUNT(*) FROM document_workflow_stages WHERE stage_type = 'REVIEW' AND is_active = true) AS value
UNION ALL
SELECT 
    'Stages with APPROVAL type' AS metric,
    (SELECT COUNT(*) FROM document_workflow_stages WHERE stage_type = 'APPROVAL' AND is_active = true) AS value;

-- ============================================
-- 6. DETAILED WORKFLOW PER DOCUMENT TYPE
-- ============================================

-- Show complete workflow for each document type
SELECT 
    dt.id AS document_type_id,
    dt.name AS document_type_name,
    dt.code AS document_type_code,
    dws.id AS stage_id,
    dws.sequence,
    dws.stage_type,
    dws.stage_name,
    dws.completion_rule,
    dws.is_required,
    jsonb_array_length(dws.assignees) AS assignee_count,
    CASE 
        WHEN jsonb_array_length(dws.assignees) = 0 THEN '⚠️ NO ASSIGNEES'
        WHEN jsonb_array_length(dws.assignees) = 1 THEN '✅'
        ELSE '✅✅'
    END AS assignee_status
FROM document_types dt
LEFT JOIN document_workflow_stages dws ON dws.document_type_id = dt.id AND dws.is_active = true
WHERE dt.is_active = true
ORDER BY dt.id, dws.sequence;

-- ============================================
-- 7. POTENTIAL ISSUES CHECK
-- ============================================

-- Check for stages without assignees
SELECT 
    id,
    document_type_id,
    stage_name,
    sequence,
    'No assignees' AS issue
FROM document_workflow_stages
WHERE is_active = true
    AND (assignees IS NULL OR jsonb_array_length(assignees) = 0);

-- Check for invalid stage_type values
SELECT 
    id,
    stage_name,
    stage_type,
    'Invalid stage_type' AS issue
FROM document_workflow_stages
WHERE stage_type NOT IN ('REVIEW', 'APPROVAL');

-- Check for invalid completion_rule values
SELECT 
    id,
    stage_name,
    completion_rule,
    'Invalid completion_rule' AS issue
FROM document_workflow_stages
WHERE completion_rule NOT IN ('ALL', 'ANY_ONE', 'MAJORITY');

-- Check for duplicate sequences within same document_type
SELECT 
    document_type_id,
    sequence,
    COUNT(*) AS duplicate_count,
    'Duplicate sequence' AS issue
FROM document_workflow_stages
WHERE is_active = true
GROUP BY document_type_id, sequence
HAVING COUNT(*) > 1;

-- ============================================
-- 8. VERIFICATION SUMMARY
-- ============================================

-- Final verification checklist
SELECT '✅ Table exists' AS check_item, 
       CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'document_workflow_stages') 
            THEN 'PASS' ELSE 'FAIL' END AS status
UNION ALL
SELECT '✅ View exists', 
       CASE WHEN EXISTS (SELECT 1 FROM information_schema.views WHERE viewname = 'v_document_workflow_summary') 
            THEN 'PASS' ELSE 'FAIL' END
UNION ALL
SELECT '✅ stage_id column in letter_workflow_trackings', 
       CASE WHEN EXISTS (SELECT 1 FROM information_schema.columns 
                         WHERE table_name = 'letter_workflow_trackings' AND column_name = 'stage_id') 
            THEN 'PASS' ELSE 'FAIL' END
UNION ALL
SELECT '✅ Active stages exist', 
       CASE WHEN (SELECT COUNT(*) FROM document_workflow_stages WHERE is_active = true) > 0 
            THEN 'PASS' ELSE 'FAIL' END
UNION ALL
SELECT '✅ No orphaned stage_ids', 
       CASE WHEN (SELECT COUNT(*) FROM letter_workflow_trackings lwt 
                  LEFT JOIN document_workflow_stages dws ON lwt.stage_id = dws.id
                  WHERE lwt.stage_id IS NOT NULL AND dws.id IS NULL) = 0 
            THEN 'PASS' ELSE 'FAIL' END
UNION ALL
SELECT '✅ No stages without assignees', 
       CASE WHEN (SELECT COUNT(*) FROM document_workflow_stages 
                  WHERE is_active = true AND (assignees IS NULL OR jsonb_array_length(assignees) = 0)) = 0 
            THEN 'PASS' ELSE 'FAIL' END;

-- ============================================
-- END OF VERIFICATION SCRIPT
-- ============================================