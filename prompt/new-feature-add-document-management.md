# 🚀 New Feature: Document Management System

## 📋 Overview
Menambahkan sistem manajemen dokumen terintegrasi ke dalam Sistem RAB Leora dengan fitur workflow approval, multi-level user permissions, dan notifikasi real-time.

## 🎯 Fitur Utama

### 1. Header/Footer Template Management
**Purpose:** Mengelola template header dan footer untuk branding dokumen konsisten

**Fitur:**
- Template header perusahaan (logo, alamat, kontak)
- Template footer (signature, date, page numbers)
- Custom templates per document type
- Preview sebelum generate PDF
- Version control untuk templates
- Admin-only management

### 2. Pengajuan Surat Keluar (Outgoing Letter Submission)
**Workflow:** Draft → Submit → Review → Approval → Sign → Send

**Fitur:**
- Template surat standar dengan header/footer perusahaan
- Auto-generated nomor surat setelah approval
- Lampiran file opsional
- Digital signature workflow
- Status tracking real-time
- PDF export dengan branding lengkap

### 3. Pengajuan Internal Memo (Internal Memo Submission)
**Workflow:** Draft → Submit → Review → Approval → Publish

**Fitur:**
- Template memo internal dengan header/footer
- Distribution list (multi-recipient)
- Priority levels (Low/Normal/High/Urgent)
- Auto-archive setelah publish
- Search & filter functionality
- PDF export dengan format perusahaan

### 4. Multi-Level User System
**Roles & Permissions:**

#### Pengaju (Submitter)
- ✅ Create new documents
- ✅ Edit draft documents
- ✅ Submit documents for review
- ✅ Upload attachments
- ❌ Review/approve documents

#### Reviewer
- ✅ Review assigned documents
- ✅ Provide feedback/revisions
- ✅ Approve/Reject at review stage
- ✅ Request additional information
- ❌ Final approval authority

#### Approver
- ✅ Final approval/rejection
- ✅ Digital signature authority
- ✅ Override review decisions
- ✅ Document number assignment
- ✅ Send/finalize documents

#### Admin
- ✅ Full system access
- ✅ User management
- ✅ Workflow configuration
- ✅ System monitoring
- ✅ Audit trail access

## 🔄 Workflow System

### Document States
```javascript
const DOCUMENT_STATES = {
  'draft': 'Draft - Being created',
  'submitted': 'Submitted - Waiting for review',
  'review': 'Under Review - Reviewer assigned',
  'revision': 'Revision Required - Changes needed',
  'approved': 'Approved - Ready for final approval',
  'rejected': 'Rejected - Document denied',
  'signed': 'Signed - Digital signature applied',
  'sent': 'Sent - Document dispatched',
  'published': 'Published - Available to recipients',
  'archived': 'Archived - Stored for reference'
}
```

### Notification System
**Triggers:**
- Document submitted for review
- Revision requested
- Document approved/rejected
- Final signature required
- Document published/sent

**Notification Types:**
- In-app notifications
- Email alerts (future)
- Dashboard status updates

## 🗄️ Database Requirements (Must-Have Tables)

### **Users & Authentication:**
- **`users`** - Enhanced user table
  - `role_level`: pengaju, reviewer, approver, admin
  - `department`: user department
  - `position`: user position
  - `is_active`: account status

### **Document Management (5 tables):**
- **`outgoing_letters`** - Surat keluar documents
- **`internal_memos`** - Memo internal documents
- **`document_templates`** - Header/footer templates
- **`document_approvals`** - Approval workflow tracking
- **`notifications`** - User notifications

### **Existing Tables (Keep):**
- **`rab_documents`** - RAB documents (existing)
- **`master_panel`** - Panel catalog (existing)
- **`master_ongkir`** - Shipping costs (existing)

**Total: 8 tables** (5 new + 3 existing)
```

## 🎨 UI/UX Requirements

### Navigation Updates
```
📂 Dokumen
  ├── 📄 Surat Keluar
  │   ├── Buat Surat Baru
  │   ├── Daftar Surat
  │   └── Arsip Surat
  ├── 📋 Internal Memo
  │   ├── Buat Memo Baru
  │   ├── Daftar Memo
  │   └── Memo Saya
  └── 📝 MoM Meeting
      ├── Buat MoM Baru
      ├── Daftar Meeting
      └── Arsip MoM
```

### Dashboard Cards
- **My Documents**: Documents I created
- **Pending Review**: Documents waiting my review
- **Pending Approval**: Documents waiting my approval
- **Recent Activity**: Latest document actions

### Status Indicators
- 🟡 Draft - Yellow
- 🔵 Submitted - Blue
- 🟠 Review - Orange
- 🔴 Revision - Red
- 🟢 Approved - Green
- ⚫ Rejected - Gray
- 📋 Published - Blue
- 📁 Archived - Gray

## 🔐 Security & Permissions

### Row Level Security (RLS)
```sql
-- Users can only see documents they created or are assigned to
CREATE POLICY "Document access policy" ON outgoing_letters
  FOR SELECT USING (
    auth.uid() = created_by OR
    auth.uid() = approved_by OR
    auth.uid() = signed_by OR
    EXISTS (
      SELECT 1 FROM document_workflow_participants
      WHERE document_type = 'outgoing_letter'
      AND document_id = outgoing_letters.id
      AND participant_id = auth.uid()
    )
  );
```

### File Upload Security
- File type validation
- File size limits
- Secure storage in Supabase Storage
- Access control based on document permissions

## 📱 Mobile Responsiveness

### Priority Screens
1. **Document List** - Optimized for mobile scrolling
2. **Document Detail** - Readable on small screens
3. **Create/Edit Form** - Touch-friendly inputs
4. **Approval Actions** - Large, accessible buttons

### PWA Features
- Offline document viewing
- Push notifications for approvals
- Camera integration for document scanning

## 🧪 Testing Requirements

### Unit Tests
- Document creation workflows
- Permission validation
- Status transitions
- Notification triggers

### Integration Tests
- Full document approval flow
- Multi-user scenarios
- File upload/download
- Email notifications

### E2E Tests
- Complete user journeys
- Cross-device compatibility
- Performance under load

## 📊 Success Metrics

### Functional Metrics
- Average document processing time
- User adoption rate per role
- Error rates in workflows
- Notification delivery success

### Quality Metrics
- System uptime > 99.5%
- Response time < 2 seconds
- Mobile compatibility score > 95
- Accessibility compliance WCAG 2.1 AA

## 🚀 Implementation Phases

### Phase 1: Core Infrastructure (2 weeks)
- [ ] Database schema migration (users, documents, templates)
- [ ] User role system updates (multi-level permissions)
- [ ] Header/Footer template management system
- [ ] Basic permission middleware
- [ ] File upload infrastructure

### Phase 2: Surat Keluar (3 weeks)
- [ ] UI components and forms with template integration
- [ ] Basic workflow implementation (draft → submit → review → approve)
- [ ] PDF generation with header/footer branding
- [ ] Notification system for approvals
- [ ] Testing and QA

### Phase 3: Internal Memo (2 weeks)
- [ ] Memo-specific templates and header/footer
- [ ] Distribution system (multi-recipient)
- [ ] Publishing workflow with notifications
- [ ] Search and archive functionality

### Phase 4: Advanced Features (3 weeks)
- [ ] Enhanced notifications (email integration)
- [ ] Bulk operations for document management
- [ ] Advanced search and filtering
- [ ] Analytics dashboard for document metrics

### Phase 5: MoM Meeting (Future - 2 weeks)
- [ ] Meeting minutes templates
- [ ] Action item tracking system
- [ ] Archive system with search
- [ ] Integration with document workflow

## 📋 Acceptance Criteria

### Functional Requirements
- [ ] Users can create all document types
- [ ] Workflow follows defined stages
- [ ] Notifications work for all roles
- [ ] File attachments function properly
- [ ] Search and filter work across documents
- [ ] Mobile experience is optimized

### Non-Functional Requirements
- [ ] System handles 100+ concurrent users
- [ ] Documents load within 2 seconds
- [ ] 99.5% uptime maintained
- [ ] All major browsers supported
- [ ] WCAG 2.1 AA compliance achieved

## 🔗 Dependencies

### External Services
- **Supabase**: Database, Storage, Auth
- **Email Service**: For notifications (future)

### Internal Dependencies
- **Auth System**: Enhanced user roles
- **File System**: Upload/download capabilities
- **Notification System**: Real-time updates

---

**Document Version**: 1.0
**Last Updated**: January 2026
**Status**: Ready for Development
