# Documents Module

## Overview
Modul pengelolaan dokumen keluar dengan workflow approval paralel. Sistem mendukung pembuatan draft, submission untuk review, parallel approval, dan generate nomor surat otomatis.

## Workflow Flow

### Status Sequence
```
DRAFT → SUBMITTED_TO_REVIEW → REVIEWED → APPROVED
                   ↓                ↓
            REVISION_REQUESTED    REJECTED
```

### Status Definitions
- **DRAFT**: Creator editing, can modify/delete
- **SUBMITTED_TO_REVIEW**: Parallel reviewers active
- **REVIEWED**: All reviewers approved, waiting final approval
- **APPROVED**: Document numbered and published
- **REVISION_REQUESTED**: Needs creator revision
- **REJECTED**: Permanently rejected by approver

### Parallel Review Logic
- **Completion Rule**: ALL (all reviewers must approve)
- **Reviewer Actions**: Approve or Request Revision (no reject)
- **Escalation**: If any reviewer requests revision → status = REVISION_REQUESTED
- **Progression**: All reviewers approve → status = REVIEWED → approver review

## Database Schema

### Core Tables

#### outgoing_letters
```sql
CREATE TABLE outgoing_letters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_number VARCHAR(50),                    -- Auto-generated on approval
  status letter_status NOT NULL,                  -- ENUM status
  current_stage_id BIGINT REFERENCES document_workflow_stages(id),
  document_type_id BIGINT NOT NULL REFERENCES document_types(id),
  company_id UUID NOT NULL REFERENCES instansi(id),

  -- Content fields
  subject VARCHAR(100) NOT NULL,
  opening TEXT,
  body TEXT,
  closing TEXT,

  -- Sender info
  sender_id UUID REFERENCES users(id),
  created_by_id UUID NOT NULL REFERENCES users(id),

  -- Recipient info
  recipient_company VARCHAR(255) NOT NULL,
  recipient_name VARCHAR(255),
  recipient_whatsapp VARCHAR(20),
  recipient_email VARCHAR(255),
  recipient_address TEXT,

  -- Metadata
  letter_date DATE NOT NULL,
  approved_at TIMESTAMPTZ,
  rejected_at TIMESTAMPTZ,
  submitted_at TIMESTAMPTZ,
  reviewed_at TIMESTAMPTZ,
  revision_count INTEGER DEFAULT 0,

  -- Files
  attachments JSONB,                              -- Array of file objects
  signatories JSONB,                              -- Array of signatures

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### letter_histories (Audit Trail)
```sql
CREATE TABLE letter_histories (
  id BIGINT PRIMARY KEY DEFAULT gen_random_uuid(),
  letter_id UUID NOT NULL REFERENCES outgoing_letters(id),
  action_by_id UUID NOT NULL REFERENCES users(id),
  assigned_to_id UUID REFERENCES users(id),       -- For review/approval tasks
  action_type letter_action_type NOT NULL,        -- ENUM actions
  from_status letter_status,
  to_status letter_status,
  stage_type VARCHAR(20),                         -- REVIEW | APPROVAL
  sequence INTEGER,                               -- Stage sequence
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### document_types
```sql
CREATE TABLE document_types (
  id BIGINT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  code VARCHAR(10) NOT NULL UNIQUE,
  description TEXT,
  category VARCHAR(50),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### document_workflow_stages
```sql
CREATE TABLE document_workflow_stages (
  id BIGINT PRIMARY KEY,
  document_type_id BIGINT NOT NULL REFERENCES document_types(id),
  stage_name VARCHAR(100) NOT NULL,
  stage_type stage_type NOT NULL,                 -- REVIEW | APPROVAL
  sequence INTEGER NOT NULL,
  assignees JSONB NOT NULL,                       -- Array of user assignments
  completion_rule completion_rule DEFAULT 'ALL',  -- ALL | ANY_ONE | MAJORITY
  is_required BOOLEAN DEFAULT true,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Enums
```sql
CREATE TYPE letter_status AS ENUM (
  'DRAFT', 'SUBMITTED_TO_REVIEW', 'REVIEWED', 'APPROVED',
  'REJECTED', 'REVISION_REQUESTED'
);

CREATE TYPE letter_action_type AS ENUM (
  'CREATED', 'SUBMITTED', 'APPROVED_REVIEW', 'APPROVED_FINAL',
  'REJECTED', 'REVISION_REQUESTED', 'REVISED'
);

CREATE TYPE stage_type AS ENUM ('REVIEW', 'APPROVAL');
CREATE TYPE completion_rule AS ENUM ('ALL', 'ANY_ONE', 'MAJORITY');
```

## Document Number Generation

### Format
```
XXX/INST/KAT/MM/YYYY
001/MMG/SPH/02/2026
```

**Components:**
- **XXX**: Sequential number (reset per month per document type)
- **INST**: Institution code (from instansi.code)
- **KAT**: Document type code (from document_types.code)
- **MM/YYYY**: Month/Year

### Generation Logic
```sql
-- Count approved documents this month for this type/company
SELECT COUNT(*) + 1
FROM outgoing_letters
WHERE document_type_id = ?
  AND company_id = ?
  AND EXTRACT(MONTH FROM approved_at) = EXTRACT(MONTH FROM NOW())
  AND EXTRACT(YEAR FROM approved_at) = EXTRACT(YEAR FROM NOW())
  AND status = 'APPROVED';
```

## Permissions

### Role-Based Access
- **create**: `dokumen.create` (draft creation)
- **submit**: `dokumen.submit` (submit for review)
- **review**: `dokumen.review` (reviewer role)
- **approve**: `dokumen.approve` (final approval)

### Department-Based Access
Manager permissions vary by department:
- **Konstruksi**: Full document access
- **Finance**: Document creation + approval
- **Human Capital**: Document creation only
- **Marketing**: Limited access

## UI Components

### Page Structure

#### `/documents/dashboard`
- Document statistics overview
- Recent documents list
- Quick actions (create new)
- Pending review/approval alerts

#### `/documents/outgoing-letter`
- Documents list with filters
- Status badges and actions
- Export functionality

#### `/documents/outgoing-letter/new`
- 5-section form:
  1. **Document Identity**: Type, company, date
  2. **Content**: Subject, opening, body, closing
  3. **Sender**: User selection with auto-fill
  4. **Recipient**: Manual company/contact details
  5. **Attachments**: File upload with storage

#### `/documents/outgoing-letter/[id]`
- Document preview (A4 format)
- Audit trail timeline
- Edit/Submit actions (if DRAFT)
- Download/print options

#### `/documents/review`
- Pending reviews queue
- Modal detail view
- Approve/Request Revision actions

#### `/documents/approval`
- Pending approvals queue
- Final approval/rejection
- Document number generation

### Key Components

#### LetterPreview
- A4 formatted document display
- Header/footer with company branding
- Recipient and sender information
- Content with proper typography

#### AuditTrail
- Timeline of all workflow actions
- Color-coded status indicators
- Notes and reviewer comments
- Action timestamps

#### WorkflowStages
- Visual workflow representation
- Current stage highlighting
- Assignee information
- Completion status

## API Operations

### CRUD Operations
```typescript
// Create draft
const { data, error } = await supabase
  .from('outgoing_letters')
  .insert(letterData)
  .select()
  .single();

// Update draft
const { data, error } = await supabase
  .from('outgoing_letters')
  .update(updates)
  .eq('id', letterId)
  .eq('status', 'DRAFT'); // Only drafts can be edited

// Get with relations
const { data, error } = await supabase
  .from('outgoing_letters')
  .select(`
    *,
    document_type:document_types(*),
    company:instansi(*),
    sender:users(*),
    creator:users!created_by_id(*),
    histories:letter_histories(*, actor:users(*))
  `)
  .eq('id', letterId)
  .single();
```

### Workflow Operations
```typescript
// Submit for review (RPC function)
const { data, error } = await supabase
  .rpc('submit_letter_for_review', {
    letter_id: letterId,
    user_id: userId
  });

// Review letter (RPC function)
const { data, error } = await supabase
  .rpc('review_letter', {
    action: 'APPROVE', // or 'REQUEST_REVISION'
    letter_id: letterId,
    user_id: userId,
    notes: 'Optional notes'
  });

// Final approval (RPC function)
const { data, error } = await supabase
  .rpc('review_letter', {
    action: 'APPROVED_FINAL',
    letter_id: letterId,
    user_id: userId
  });
```

### Query Helpers
```typescript
// Get pending reviews
const { data, error } = await supabase
  .from('letter_histories')
  .select(`
    *,
    letter:outgoing_letters(*, document_type:document_types(*))
  `)
  .eq('assigned_to_id', userId)
  .is('to_status', null)
  .eq('stage_type', 'REVIEW');

// Get pending approvals
const { data, error } = await supabase
  .from('letter_histories')
  .select(`
    *,
    letter:outgoing_letters(*, document_type:document_types(*))
  `)
  .eq('assigned_to_id', userId)
  .is('to_status', null)
  .eq('stage_type', 'APPROVAL');
```

## File Structure

```
src/
├── app/(protected)/documents/
│   ├── dashboard/page.tsx
│   ├── outgoing-letter/
│   │   ├── page.tsx              # List page
│   │   ├── new/page.tsx          # Create form
│   │   └── [id]/
│   │       ├── page.tsx          # Detail view
│   │       └── edit/page.tsx     # Edit form
│   ├── review/page.tsx           # Review queue
│   └── approval/page.tsx         # Approval queue
├── components/documents/
│   ├── LetterPreview.tsx         # A4 preview
│   ├── AuditTrail.tsx            # Timeline
│   ├── WorkflowStages.tsx        # Stage visualization
│   └── LetterForm.tsx            # 5-section form
├── hooks/
│   ├── useLetters.ts             # CRUD hooks
│   └── useWorkflow.ts            # Workflow hooks
└── lib/supabase/
    ├── letters.ts                # Service functions
    └── storage.ts                # File operations
```

## Critical Rules

1. **Status Transitions**: Strict workflow - no skipping stages
2. **Parallel Review**: All reviewers must approve (completion_rule: ALL)
3. **Document Number**: Generated ONLY on APPROVED status
4. **Revision Reset**: Workflow restarts on resubmit after revision
5. **Permission Checks**: Enforced at both UI and database level
6. **Audit Logging**: Every status change recorded in letter_histories
7. **File Management**: Attachments move from temp to permanent folders
8. **Ownership**: Only creator can edit/delete drafts

## Performance Optimizations

### Caching Strategy
```typescript
// Document list - Standard caching
useQuery({
  queryKey: ['letters', filters],
  staleTime: 60 * 1000,        // 1 minute
  gcTime: 5 * 60 * 1000,       // 5 minutes
});

// Pending queues - Real-time updates
useQuery({
  queryKey: ['pending-reviews', userId],
  staleTime: 30 * 1000,        // 30 seconds
  refetchOnWindowFocus: true,
});
```

### Database Indexes
```sql
-- Performance indexes
CREATE INDEX idx_letters_status ON outgoing_letters(status);
CREATE INDEX idx_letters_document_type ON outgoing_letters(document_type_id);
CREATE INDEX idx_letters_created_by ON outgoing_letters(created_by_id);
CREATE INDEX idx_histories_assigned_to ON letter_histories(assigned_to_id);
CREATE INDEX idx_histories_letter_id ON letter_histories(letter_id);
CREATE INDEX idx_histories_pending ON letter_histories(assigned_to_id, to_status) WHERE to_status IS NULL;
```

## Error Handling

### Validation Errors
- **Form Validation**: Zod schemas for client-side validation
- **Business Rules**: Server-side checks via RPC functions
- **Permission Errors**: Clear messages for unauthorized actions
- **Concurrency**: Handle simultaneous edits gracefully

### Network Errors
- **Retry Logic**: Automatic retry for network failures
- **Offline Support**: Queue actions for later sync
- **Timeout Handling**: Reasonable timeouts with user feedback

## Security Considerations

### Access Control
- **RLS Policies**: Auth-only for documents, ownership for drafts
- **Permission Checks**: Frontend guards + server validation
- **Audit Trail**: Complete action logging
- **File Security**: Signed URLs for attachment access

### Data Protection
- **Encryption**: Sensitive data encrypted at rest
- **Access Logging**: All document access logged
- **Retention**: Configurable data retention policies
- **Backup**: Regular encrypted backups

## Integration Points

### With Other Modules
- **CRM**: Generate quotations from leads
- **Project Tracking**: Link documents to projects
- **Calculator**: Generate price proposals
- **User Management**: Dynamic assignee selection

### External Systems
- **Email**: Notification system for workflow actions
- **WhatsApp**: Send document links to recipients
- **Google Drive**: Alternative file storage
- **DocuSign**: Electronic signatures

## Future Enhancements

### Phase 2
- **PDF Generation**: Server-side PDF creation
- **Email Templates**: Customizable notification templates
- **Bulk Operations**: Mass approval/rejection
- **Advanced Search**: Full-text search capabilities
- **Version Control**: Document revision history

### Phase 3
- **Real-time Collaboration**: Live editing
- **AI Assistant**: Content suggestions
- **Mobile App**: Field document approval
- **Blockchain**: Document verification

---

*Last Updated: 2026-04-04*
*Status: Production Ready*