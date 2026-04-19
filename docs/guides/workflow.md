# Workflow Management Guide

## Overview
Panduan implementasi sistem workflow management untuk approval dokumen. Sistem menggunakan parallel review dengan configurable stages dan completion rules.

## Phase 1: Critical Fixes

### ConfirmDialog Component
Reusable confirmation dialog dengan variant styling:
- **Danger**: Red styling for destructive actions
- **Warning**: Yellow styling for caution actions
- **Info**: Blue styling for informational actions

**Features:**
- Loading states with spinner
- Keyboard navigation support
- Backdrop click to close
- Customizable button text

### Edit Workflow Page Improvements
**Core Fixes:**
- **Stage Reordering**: Drag-and-drop stage sequence management
- **Primary Assignee**: Designate primary reviewer per stage
- **Unsaved Changes Warning**: Browser beforeunload protection
- **Delete Confirmation**: Safe stage deletion with undo option

**State Management:**
- Local state for optimistic updates
- Server sync on save
- Conflict resolution for concurrent edits

### Soft Delete Implementation
**Benefits:**
- Maintain audit trail integrity
- Allow data recovery if needed
- Preserve historical references
- Clean UI without permanent deletion

**Implementation:**
- `is_active` flag instead of hard delete
- Filtered queries exclude inactive records
- Admin recovery capabilities

## Phase 2: UX Improvements

### Delete Document Type
Safe deletion dengan confirmation dialog:
- Soft delete (mark inactive)
- Clear user feedback
- Audit trail preservation
- No cascading data loss

### Enhanced Form Validation
**Client-side Validation:**
- Real-time field validation
- Dependency-based field visibility
- Cross-field validation rules
- User-friendly error messages

**Server-side Validation:**
- Database constraint enforcement
- Business rule validation
- Atomic transaction guarantees
- Comprehensive error reporting

## Phase 3: Backend Enhancements

### Audit Logging System
**Database Table:**
```sql
CREATE TABLE workflow_audit_logs (
  id UUID PRIMARY KEY,
  document_type_id INTEGER NOT NULL,
  stage_id INTEGER,
  action VARCHAR(20) NOT NULL, -- CREATE, UPDATE, DELETE, REORDER
  details TEXT NOT NULL,
  changed_by_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Automatic Logging:**
- Database triggers capture all changes
- User attribution tracking
- Detailed change descriptions
- Historical timeline reconstruction

### Unique Constraints
**Sequence Uniqueness:**
```sql
ALTER TABLE document_workflow_stages
ADD CONSTRAINT unique_doc_type_sequence
UNIQUE (document_type_id, sequence);
```

**Benefits:**
- Prevent duplicate sequences
- Maintain workflow integrity
- Clear error messages
- Data consistency guarantees

### Row Level Security
**Audit Log Security:**
```sql
ALTER TABLE workflow_audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view workflow audit logs"
ON workflow_audit_logs FOR SELECT USING (auth.uid() IS NOT NULL);
```

**Access Control:**
- Read access for authenticated users
- Write access via system triggers only
- No direct user modifications
- Secure audit trail integrity

## Database Migration Strategy

### Migration File Structure
```sql
-- workflow_audit_logs.sql
-- 1. Create audit log table
-- 2. Add unique constraints
-- 3. Create audit triggers
-- 4. Set up RLS policies
-- 5. Add performance indexes
-- 6. Create cleanup functions
```

### Trigger Implementation
**Change Detection:**
```sql
CREATE OR REPLACE FUNCTION log_workflow_change()
RETURNS TRIGGER AS $$
DECLARE
  v_action TEXT;
  v_details TEXT;
  v_user_id UUID;
BEGIN
  SELECT id INTO v_user_id FROM auth.users WHERE id = auth.uid();

  IF TG_OP = 'INSERT' THEN
    v_action := 'CREATE';
    v_details := 'Created stage: ' || NEW.stage_name;
  ELSIF TG_OP = 'UPDATE' THEN
    v_action := 'UPDATE';
    v_details := 'Updated stage: ' || NEW.stage_name;
    -- Detect specific field changes
  ELSIF TG_OP = 'DELETE' THEN
    v_action := 'DELETE';
    v_details := 'Deleted stage: ' || OLD.stage_name;
  END IF;

  INSERT INTO workflow_audit_logs (
    document_type_id, stage_id, action, details, changed_by_id
  ) VALUES (
    COALESCE(NEW.document_type_id, OLD.document_type_id),
    NEW.id,
    v_action, v_details, v_user_id
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### Performance Indexes
```sql
-- Query optimization
CREATE INDEX idx_workflow_audit_logs_document_type_id
  ON workflow_audit_logs(document_type_id);

CREATE INDEX idx_workflow_audit_logs_created_at
  ON workflow_audit_logs(created_at DESC);

CREATE INDEX idx_workflow_audit_logs_changed_by
  ON workflow_audit_logs(changed_by_id);
```

## Implementation Workflow

### 1. Database Setup
- Run migration scripts in order
- Verify table creation and constraints
- Test trigger functionality
- Confirm RLS policies active

### 2. Frontend Integration
- Update useWorkflow hooks for audit logs
- Implement ConfirmDialog in workflow pages
- Add soft delete functionality
- Test reordering and primary assignee features

### 3. Testing & Validation
- Unit tests for workflow logic
- Integration tests for audit logging
- E2E tests for complete workflows
- Performance testing for large datasets

### 4. Deployment & Monitoring
- Gradual rollout with feature flags
- Monitor audit log growth
- Set up cleanup schedules
- Track user adoption metrics

## Best Practices

### Workflow Design
**Stage Configuration:**
- Clear stage names and purposes
- Logical sequence progression
- Appropriate completion rules
- Balanced assignee workloads

**Assignee Management:**
- Primary assignee designation
- Backup assignee coverage
- Role-based assignments
- Notification preferences

### Error Handling
**Validation Errors:**
- Clear, actionable error messages
- Field-level error indicators
- Form-level validation summaries
- Recovery action suggestions

**System Errors:**
- Graceful degradation
- Automatic retry mechanisms
- User-friendly error pages
- Support contact information

### Performance Optimization
**Database Queries:**
- Efficient index usage
- Query result caching
- Connection pooling
- Query plan analysis

**Frontend Performance:**
- Lazy loading of workflow components
- Optimistic UI updates
- Background data synchronization
- Memory usage monitoring

## Troubleshooting

### Common Issues

#### Sequence Constraint Violations
**Symptoms:** Cannot save workflow with duplicate sequences
**Solution:** Verify unique constraints, renumber stages sequentially

#### Trigger Not Firing
**Symptoms:** Audit logs not created
**Solution:** Check trigger existence, verify function permissions

#### Permission Denied
**Symptoms:** Cannot access audit logs
**Solution:** Verify RLS policies, check user authentication

#### Performance Degradation
**Symptoms:** Slow workflow loading
**Solution:** Check indexes, optimize queries, implement caching

### Debug Procedures

#### Audit Log Investigation
```sql
-- Check recent audit activity
SELECT * FROM workflow_audit_logs
WHERE document_type_id = ?
ORDER BY created_at DESC
LIMIT 10;

-- Verify trigger functionality
SELECT * FROM pg_trigger
WHERE tgname = 'trigger_log_workflow_change';
```

#### Performance Analysis
```sql
-- Check slow queries
SELECT * FROM pg_stat_statements
WHERE query LIKE '%workflow%'
ORDER BY total_time DESC;

-- Analyze table statistics
ANALYZE workflow_audit_logs;
```

## Future Enhancements

### Advanced Features
- **Workflow Templates**: Pre-configured workflow patterns
- **Conditional Branching**: Dynamic workflow paths
- **SLA Management**: Time-based escalation rules
- **Bulk Operations**: Mass approval capabilities

### Integration Capabilities
- **Email Notifications**: Automated workflow alerts
- **Calendar Integration**: Deadline scheduling
- **Document Management**: File attachment workflows
- **External API**: Third-party system integration

### Analytics & Reporting
- **Workflow Metrics**: Completion time analysis
- **Bottleneck Identification**: Process improvement insights
- **User Performance**: Individual productivity tracking
- **Compliance Reporting**: Audit trail analysis

---

*Last Updated: 2026-04-04*
*Status: Implementation Complete*