
SELECT 'document_workflow_configs (OLD)' as table_info, count(*) as row_count FROM document_workflow_configs
UNION ALL
SELECT 'document_workflow_stages (NEW)', count(*) FROM document_workflow_stages
UNION ALL
SELECT 'letter_workflow_trackings (OLD)', count(*) FROM letter_workflow_trackings
UNION ALL
SELECT 'letter_histories (NEW)', count(*) FROM letter_histories;
