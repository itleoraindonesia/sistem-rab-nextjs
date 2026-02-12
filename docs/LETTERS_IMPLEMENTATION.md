# Outgoing Letters Implementation Summary

## Overview
Complete implementation of Outgoing Letters (Surat Keluar) feature with parallel review workflow using Supabase and React Query. Dokumentasi ini mencakup implementasi terbaru dengan database enum-based dan RPC functions.

## What Was Built

### 1. Database Setup (Migrations)

#### Files Created:
- `supabase/migrations/003_create_letter_test_users.sql`
  - Creates 2 reviewer users (reviewer1@test.com, reviewer2@test.com)
  - Creates 1 approver user (approver@test.com)
  - Password: `password123` for all test users

- `supabase/migrations/004_seed_document_types.sql`
  - 10 document types: SPH, PO, INV, SKT, MOU, MEMO, EDM, SPK, SR
  - Categories: Commercial, Legal, Internal, Operation, Support

- `supabase/migrations/005_seed_workflow_configs.sql`
  - Configures parallel review workflow for all document types
  - 2 parallel reviewers per document type (completion_rule: ALL)
  - 1 approver per document type

- `supabase/migrations/006_create_test_document_number_function.sql`
  - Generates TEST document numbers: TEST-1, TEST-2, TEST-3...
  - Simple sequential counter for testing
  - Replace with real format later: XXX/INST/KAT/MM/YYYY

### 2. Service Layer

#### File: `src/lib/supabase/letters.ts`

**CRUD Operations:**
- `createLetter(data)` - Create new draft
- `getLetter(id)` - Get single letter with relations
- `getLetters(filters?)` - List letters with filters
- `updateLetter(letterId, updates)` - Update letter
- `deleteLetter(letterId)` - Delete draft

**Workflow Operations:**
- `submitForReview(letterId, userId)` - Submit for parallel review
- `reviewLetter(letterId, userId, action, notes?)` - Approve/Request revision
- `approveLetter(letterId, userId)` - Final approval + generate document number
- `rejectLetter(letterId, userId, notes?)` - Permanent rejection
- `reviseAndResubmit(letterId, userId)` - Reset workflow and return to draft

**Query Helpers:**
- `getPendingReviews(userId)` - Get letters for reviewer
- `getPendingApprovals(userId)` - Get letters for approver

### 3. Custom Hooks

#### File: `src/hooks/useLetters.ts`

**Query Hooks:**
- `useLetters(filters?)` - Fetch letters list
- `useLetter(letterId)` - Fetch single letter
- `usePendingReviews(userId?)` - Get pending reviews
- `usePendingApprovals(userId?)` - Get pending approvals
- `useDocumentTypes()` - Get document types for dropdown
- `useInstansiList()` - Get instansi list
- `useUsersList()` - Get users for sender selection

**Mutation Hooks:**
- `useCreateLetter()` - Create new letter
- `useUpdateLetter()` - Update existing letter
- `useDeleteLetter()` - Delete letter
- `useSubmitForReview()` - Submit for review
- `useReviewLetter()` - Review (approve/request revision)
- `useApproveLetter()` - Final approval
- `useRejectLetter()` - Reject letter
- `useReviseAndResubmit()` - Revise and resubmit

**Combined Hooks:**
- `useLetterWorkflow(letterId, userId)` - Get workflow permissions for current user

### 4. UI Components

#### File: `src/app/(protected)/dokumen/surat-keluar/baru/page.tsx`
- **New Letter Form** - 5 sections:
  1. Identitas Surat (Instansi, Kategori, Tanggal)
  2. Konten Surat (Perihal, Pembuka, Isi, Penutup)
  3. Pengirim (Data pengirim dari users)
  4. Penerima (Data penerima manual)
  5. Lampiran & Tanda Tangan
- Connected to real Supabase data
- Form validation
- Save draft and Submit for review actions

#### File: `src/app/(protected)/dokumen/review/page.tsx`
- **Reviewer Queue Page**
- Shows all letters pending review for current user
- Detail modal with full letter content
- Approve/Request Revision actions
- Notes field for revision requests
- Real-time status updates

#### File: `src/app/(protected)/dokumen/approval/page.tsx`
- **Approver Queue Page**
- Shows all letters pending approval for current user
- Displays all reviewer statuses
- Detail modal with full letter content
- Approve/Reject actions
- Notes field for rejection
- Document number generated on approval

## Workflow Flow

```
DRAFT (Creator)
  ↓
SUBMITTED_TO_REVIEW (2 Parallel Reviewers)
  ↓ [Both approve]
REVIEWED (1 Approver)
  ↓ [Approves]
APPROVED (Document number generated)
  ↓
PUBLISHED

[Reviewer requests revision]
  ↓
NEEDS_REVISION
  ↓ [Creator edits & resubmits]
DRAFT (reset workflow)

[Approver rejects]
  ↓
REJECTED (permanent)
```

## Database Schema Updates

### New Enums
```sql
-- Status surat
letter_status: 
  'DRAFT' | 'SUBMITTED_TO_REVIEW' | 'REVIEWED' | 'APPROVED' | 'REJECTED' | 'REVISION_REQUESTED'

-- Action types untuk history
letter_action_type:
  'CREATED' | 'SUBMITTED' | 'APPROVED_REVIEW' | 'APPROVED_FINAL' | 'REJECTED' | 'REVISION_REQUESTED' | 'REVISED'
```

### New Database Functions

#### 1. submit_letter_for_review(letter_id, user_id)
**Purpose:** Submit draft letter ke workflow pertama
**Logic:**
- Validasi status = DRAFT
- Get first workflow stage dari document_workflow_stages
- Update status → SUBMITTED_TO_REVIEW
- Set current_stage_id
- Insert history

**Returns:** 
```json
{ "success": boolean, "message": string }
```

#### 2. review_letter(action, letter_id, user_id, notes?)
**Purpose:** Review/approve/reject surat
**Logic:**
- Check user ada di assignees current stage
- Validate action (APPROVED_REVIEW | APPROVED_FINAL | REJECTED | REVISION_REQUESTED)
- Kalau APPROVED_REVIEW → move ke next stage atau final approve
- Update status & current_stage_id
- Insert history dengan notes

**Returns:**
```json
{ "success": boolean, "message": string, "new_status": letter_status }
```

## Testing Instructions

### 1. Run Migrations
Run the migrations in order:
```bash
npx supabase db push
```

### 2. Login with Test Users

**For creating letters:**
- Any user with `dokumen.create` permission

**For reviewing:**
- Email: `reviewer1@test.com`
- Password: `password123`

- Email: `reviewer2@test.com`
- Password: `password123`

**For approving:**
- Email: `approver@test.com`
- Password: `password123`

### 3. Test the Workflow

1. **Create Letter**
   - Go to `/dokumen/surat-keluar/baru`
   - Fill in all 5 sections
   - Click "Submit untuk Review"

2. **Review Letter**
   - Login as reviewer1@test.com
   - Go to `/dokumen/review`
   - Review and approve
   - Login as reviewer2@test.com
   - Go to `/dokumen/review`
   - Review and approve

3. **Approve Letter**
   - Login as approver@test.com
   - Go to `/dokumen/approval`
   - Review all reviewer statuses
   - Approve or Reject

4. **Check Document Number**
   - If approved, document number will be TEST-1, TEST-2, etc.
   - Letter status becomes APPROVED

## Status Colors

- **DRAFT** - Yellow
- **SUBMITTED_TO_REVIEW** - Blue
- **NEEDS_REVISION** - Orange
- **REVIEWED** - Purple
- **APPROVED** - Green
- **REJECTED** - Red

## Important Notes

### Document Number Generation
- Currently uses `TEST-[num]` format for testing
- Real format should be: `XXX/INST/KAT/MM/YYYY`
- Example: `001/MMG/SPH/02/2025`
- Generated ONLY when letter is APPROVED

### Parallel Review
- Both reviewers must approve (completion_rule: ALL)
- If any reviewer requests revision → status = NEEDS_REVISION
- Both reviewers review simultaneously
- Reset workflow on resubmit

### Permissions
Uses existing permissions:
- `dokumen.create` - Create letter
- `dokumen.submit` - Submit for review
- `dokumen.review` - Review letters
- `dokumen.approve` - Approve/reject letters

### Frontend Integration
- **Generate types** - `npx supabase gen types typescript` untuk dapat enum types
- **Import enums** dari generated types, jangan hardcode strings
- **Use RPC calls** - panggil function via `.rpc()`, bukan manual update
- **Handle responses** - backend return success/error, tampilkan ke user

## File Structure

```
supabase/migrations/
├── 003_create_letter_test_users.sql
├── 004_seed_document_types.sql
├── 005_seed_workflow_configs.sql
└── 006_create_test_document_number_function.sql

src/
├── lib/supabase/
│   └── letters.ts
├── hooks/
│   └── useLetters.ts
└── app/(protected)/dokumen/
    ├── surat-keluar/baru/page.tsx
    ├── review/page.tsx
    └── approval/page.tsx
```

## Next Steps (Future Enhancements)

1. **Replace TEST Number Function**
   - Implement real document number generator
   - Format: XXX/INST/KAT/MM/YYYY

2. **Add Row Level Security (RLS)**
   - Define RLS policies for permissions
   - Ensure users can only access their assigned letters

3. **Real File Upload**
   - Implement actual file upload for attachments
   - Use Supabase Storage

4. **Email Notifications**
   - Send emails when:
     - Letter submitted for review
     - Review completed
     - Letter approved/rejected
     - Revision requested

5. **Version Control**
   - Use `letter_versions` table for content history
   - Track all changes

6. **Real-time Updates**
   - Use Supabase Realtime for live updates
   - Show notifications when letters need review

## Troubleshooting

### Issue: "No workflow configuration found"
**Solution:** Run migration 005 to seed workflow configs

### Issue: "You are not assigned to review this letter"
**Solution:** Check that your user ID matches reviewer IDs in workflow configs

### Issue: "Letter is not in review stage"
**Solution:** Letter must be in SUBMITTED_TO_REVIEW status

### Issue: "Cannot generate document number"
**Solution:** Check that function `generate_test_document_number()` exists

## Support

For issues or questions:
1. Check Supabase logs
2. Verify all migrations ran successfully
3. Check browser console for errors
4. Verify user permissions
