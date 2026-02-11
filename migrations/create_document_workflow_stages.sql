-- ============================================
-- Migration: Simplify Workflow Configuration
-- ============================================
-- Purpose: Replace document_workflow_configs with simplified document_workflow_stages
-- that supports multiple assignees per stage

-- Step 1: Create new simplified table
CREATE TABLE IF NOT EXISTS document_workflow_stages (
  id SERIAL PRIMARY KEY,
  document_type_id INTEGER NOT NULL REFERENCES document_types(id) ON DELETE CASCADE,
  
  -- Stage info
  stage_type TEXT NOT NULL CHECK (stage_type IN ('REVIEW', 'APPROVAL')),
  stage_name TEXT NOT NULL,
  sequence INTEGER NOT NULL,
  
  -- Multiple assignees support (JSON array)
  assignees JSONB NOT NULL DEFAULT '[]'::jsonb,
  -- Example: [
  --   {"user_id": "uuid-1", "user_name": "Ahmad", "user_role": "reviewer", "is_primary": true},
  --   {"user_id": "uuid-2", "user_name": "Budi", "user_role": "reviewer", "is_primary": false}
  -- ]
  
  -- Completion rules
  completion_rule TEXT NOT NULL DEFAULT 'ALL' 
    CHECK (completion_rule IN ('ALL', 'ANY_ONE', 'MAJORITY')),
  
  -- Flags
  is_required BOOLEAN NOT NULL DEFAULT true,
  is_active BOOLEAN NOT NULL DEFAULT true,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Constraints
  UNIQUE(document_type_id, sequence),
  CHECK (jsonb_typeof(assignees) = 'array')
);

-- Step 2: Add indexes for performance
CREATE INDEX idx_workflow_stages_document_type 
  ON document_workflow_stages(document_type_id);

CREATE INDEX idx_workflow_stages_active 
  ON document_workflow_stages(is_active) 
  WHERE is_active = true;

CREATE INDEX idx_workflow_stages_assignees 
  ON document_workflow_stages USING gin(assignees);

-- Step 3: Add updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_document_workflow_stages_updated_at
  BEFORE UPDATE ON document_workflow_stages
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Step 4: Migrate existing data from document_workflow_configs
-- Group by document_type_id and sequence to combine multiple users into one stage
INSERT INTO document_workflow_stages (
  document_type_id,
  stage_type,
  stage_name,
  sequence,
  assignees,
  completion_rule,
  is_required,
  is_active
)
SELECT 
  dwc.document_type_id,
  dwc.stage_type,
  dwc.stage_type || ' Stage ' || dwc.sequence AS stage_name,
  dwc.sequence,
  jsonb_agg(
    jsonb_build_object(
      'user_id', dwc.user_id,
      'user_name', COALESCE(u.nama, 'Unknown User'),
      'user_role', COALESCE(u.role::text, 'user'),
      'is_primary', true
    ) ORDER BY dwc.id
  ) AS assignees,
  COALESCE(dwc.completion_rule, 'ALL') AS completion_rule,
  COALESCE(dwc.is_required, true) AS is_required,
  COALESCE(dwc.is_active, true) AS is_active
FROM document_workflow_configs dwc
LEFT JOIN users u ON u.id = dwc.user_id
WHERE dwc.is_active = true
GROUP BY 
  dwc.document_type_id, 
  dwc.stage_type, 
  dwc.sequence,
  dwc.completion_rule,
  dwc.is_required,
  dwc.is_active
ORDER BY dwc.document_type_id, dwc.sequence;

-- Step 5: Add stage_id to letter_workflow_trackings for new reference
ALTER TABLE letter_workflow_trackings 
ADD COLUMN IF NOT EXISTS stage_id INTEGER REFERENCES document_workflow_stages(id);

-- Step 6: Create view for easy querying
CREATE OR REPLACE VIEW v_document_workflow_summary AS
SELECT 
  dt.id as document_type_id,
  dt.name as document_type_name,
  dt.code as document_type_code,
  dws.id as stage_id,
  dws.stage_type,
  dws.stage_name,
  dws.sequence,
  dws.assignees,
  dws.completion_rule,
  dws.is_required,
  dws.is_active,
  jsonb_array_length(dws.assignees) as assignee_count
FROM document_types dt
LEFT JOIN document_workflow_stages dws ON dws.document_type_id = dt.id
WHERE dt.is_active = true
ORDER BY dt.id, dws.sequence;

-- Step 7: Add helpful comments
COMMENT ON TABLE document_workflow_stages IS 'Simplified workflow configuration supporting multiple assignees per stage';
COMMENT ON COLUMN document_workflow_stages.assignees IS 'JSON array of assignees with user_id, user_name, user_role, is_primary';
COMMENT ON COLUMN document_workflow_stages.completion_rule IS 'ALL=all must approve, ANY_ONE=any one can approve, MAJORITY=>50% must approve';

-- Verification query
-- SELECT * FROM v_document_workflow_summary;
