# Flow Surat Keluar - Halaman & Relasi

## 📋 Overview
Dokumen ini menjelaskan semua halaman yang memiliki relasi/keterkaitan dengan fitur **Surat Keluar** (Outgoing Letters), termasuk flow workflow, komponen, hooks, dan database yang digunakan.

---

## 🗺️ Peta Halaman & Navigasi

### 1. **Sidebar Navigation**
**File:** `src/components/layout/AppSidebar.tsx`

Menu **Administrasi** di sidebar memiliki badge notifikasi yang menampilkan total pending reviews + approvals:

```typescript
// Line 366-369
let totalAdminBadge = 0
if (item.name === "Administrasi") {
  totalAdminBadge = (pendingReviews?.length || 0) + (pendingApprovals?.length || 0)
}
```

**Sub-menu Administrasi:**
- `/documents/dashboard` - Dashboard Administrasi
- `/documents/outgoing-letter` - **Surat Keluar** (List)
- `/documents/memo` - Internal Memo
- `/documents/review` - Review Queue (dengan badge count)
- `/documents/approval` - Approval Queue (dengan badge count)

---

## 📄 Halaman-Halaman Surat Keluar

### 1. **Dashboard Administrasi**
**Path:** `/documents/dashboard`  
**File:** `src/app/(protected)/documents/dashboard/page.tsx`

**Fungsi:**
- Menampilkan ringkasan statistik dokumen
- Quick actions untuk membuat surat baru
- Daftar dokumen terbaru
- Alert untuk pending reviews/approvals

**Data yang ditampilkan:**
- Total Surat Keluar: 127
- Memo Internal: 34
- Menunggu Review: 23
- Disetujui Bulan Ini: 89

---

### 2. **List Surat Keluar** ⭐
**Path:** `/documents/outgoing-letter`  
**File:** `src/app/(protected)/documents/outgoing-letter/page.tsx`

**Fungsi:**
- Menampilkan tabel semua surat keluar
- Filter berdasarkan status
- Export ke Excel
- Tombol "Buat Surat Baru"

**Kolom Tabel:**
- No Ref (document_number)
- Instansi (company)
- Kategori (document_type)
- Perihal (subject)
- Penerima (recipient_company)
- Status (DRAFT, SUBMITTED_TO_REVIEW, REVIEWED, APPROVED, NEEDS_REVISION)
- Tanggal (letter_date)
- Aksi (Detail button)

**Hooks yang digunakan:**
```typescript
const { data: letters, isLoading, error } = useLetters()
```

---

### 3. **Buat Surat Baru** ⭐
**Path:** `/documents/outgoing-letter/baru`  
**File:** `src/app/(protected)/documents/outgoing-letter/baru/page.tsx`

**Fungsi:**
- Form untuk membuat surat keluar baru
- 5 Section form dengan validasi Zod
- Simpan sebagai Draft atau Submit untuk Review

**5 Section Form:**
1. **Identitas Surat**
   - Nomor Surat (auto-generated)
   - Instansi (company_id)
   - Kategori Surat (document_type_id)
   - Tanggal (letter_date)

2. **Konten Surat**
   - Perihal (subject) - max 4 kata
   - Pembuka (opening)
   - Isi Utama (body) - Rich Text Editor
   - Penutup (closing)

3. **Pengirim**
   - Pilih pengirim dari users list (sender_id)
   - Auto-fill: nama, email, departemen

4. **Penerima**
   - Nama Instansi (recipient_company)
   - Nama Penerima (recipient_name)
   - WhatsApp (recipient_whatsapp)
   - Email (recipient_email)
   - Alamat (recipient_address)

5. **Lampiran & Tanda Tangan**
   - Checkbox has_attachments
   - Upload files (attachments)
   - Signatories (array of signatures)

**Hooks yang digunakan:**
```typescript
const { data: documentTypes } = useDocumentTypes()
const { data: instansiList } = useInstansiList()
const { data: usersList } = useUsersList()
const createLetter = useCreateLetter()
const submitForReview = useSubmitForReview()
```

**Validasi:**
- Schema: `src/schemas/outgoing-letter.schema.ts`
- React Hook Form + Zod resolver

**Actions:**
- **Simpan Draft** → Status: DRAFT
- **Submit untuk Review** → Status: SUBMITTED_TO_REVIEW

---

### 4. **Detail Surat** ⭐
**Path:** `/documents/outgoing-letter/[id]`  
**File:** `src/app/(protected)/documents/outgoing-letter/[id]/page.tsx`

**Fungsi:**
- Preview surat dalam format A4
- Audit trail / timeline workflow
- Informasi dokumen
- Lampiran files

**Komponen:**
- **Letter Preview** - Format surat resmi dengan header/footer
- **Audit Trail** - Timeline dari letter_histories
- **Document Metadata** - Status, nomor surat, created_by, approved_by
- **Attachments** - List file lampiran

**Actions (jika status = DRAFT):**
- **Edit** → Redirect ke `/documents/outgoing-letter/[id]/edit`
- **Submit untuk Review** → Call `submitForReview()`

**Hooks yang digunakan:**
```typescript
const { data: letter, isLoading, error } = useLetter(id)
const submitMutation = useSubmitForReview()
```

**Audit Trail:**
- Menampilkan semua history dari `letter.histories`
- Sorted by created_at ascending
- Color coding: green (approved), red (rejected/revision)

---

### 5. **Edit Surat**
**Path:** `/documents/outgoing-letter/[id]/edit`  
**File:** `src/app/(protected)/documents/outgoing-letter/[id]/edit/page.tsx`

**Fungsi:**
- Edit surat yang masih berstatus DRAFT
- Form sama dengan halaman "Buat Surat Baru"
- Pre-filled dengan data existing

**Hooks yang digunakan:**
```typescript
const { data: letter } = useLetter(id)
const updateLetter = useUpdateLetter()
```

---

### 6. **Review Queue** ⭐
**Path:** `/documents/review`  
**File:** `src/app/(protected)/documents/review/page.tsx`

**Fungsi:**
- Menampilkan surat yang menunggu review dari user yang login
- Modal untuk review detail surat
- Approve atau Request Revision

**Data yang ditampilkan:**
- List surat dari `letter_histories` dengan:
  - `assigned_to_id = userId`
  - `to_status = 'PENDING'`
  - `stage_type = 'REVIEW'`

**Modal Review:**
- Detail surat lengkap
- Form catatan (notes)
- Actions:
  - **Minta Revisi** → `reviewLetter(letterId, 'REQUEST_REVISION', notes)`
  - **Setujui** → `reviewLetter(letterId, 'APPROVE', notes)`

**Hooks yang digunakan:**
```typescript
const { data: pendingReviews, isLoading } = usePendingReviews(user?.id)
const reviewLetter = useReviewLetter()
```

**Badge di Sidebar:**
- Count: `pendingReviews?.length || 0`

---

### 7. **Approval Queue** ⭐
**Path:** `/documents/approval`  
**File:** `src/app/(protected)/documents/approval/page.tsx`

**Fungsi:**
- Menampilkan surat yang menunggu approval dari user yang login
- Modal untuk approval detail surat
- Approve (generate nomor surat) atau Reject

**Data yang ditampilkan:**
- List surat dari `letter_histories` dengan:
  - `assigned_to_id = userId`
  - `to_status = 'PENDING'`
  - `stage_type = 'APPROVAL'`

**Modal Approval:**
- Detail surat lengkap
- Status reviewer (siapa saja yang sudah approve)
- Form catatan (notes)
- Actions:
  - **Tolak** → `rejectLetter(letterId, notes)`
  - **Setujui** → `approveLetter(letterId)` → Generate document_number

**Hooks yang digunakan:**
```typescript
const { data: pendingApprovals, isLoading } = usePendingApprovals(user?.id)
const approveLetter = useApproveLetter()
const rejectLetter = useRejectLetter()
```

**Badge di Sidebar:**
- Count: `pendingApprovals?.length || 0`

---

### 8. **Detail Review/Approval**
**Path:** `/documents/review/[id]` dan `/documents/approval/[id]`  
**File:** 
- `src/app/(protected)/documents/review/[id]/page.tsx`
- `src/app/(protected)/documents/approval/[id]/page.tsx`

**Fungsi:**
- Halaman detail untuk review/approval individual
- Sama seperti modal, tapi dalam halaman terpisah

---

## 🔧 Komponen & Hooks

### **Hooks** (`src/hooks/useLetters.ts`)

#### Query Hooks:
```typescript
// Get all letters
useLetters(filters?: { status, document_type_id, created_by_id, limit, offset })

// Get single letter with relations
useLetter(letterId: string)

// Get pending reviews for user
usePendingReviews(userId?: string)

// Get pending approvals for user
usePendingApprovals(userId?: string)

// Get document types
useDocumentTypes()

// Get instansi list
useInstansiList()

// Get users list
useUsersList()
```

#### Mutation Hooks:
```typescript
// Create letter
useCreateLetter()

// Update letter
useUpdateLetter()

// Delete letter
useDeleteLetter()

// Submit for review
useSubmitForReview()

// Review letter
useReviewLetter()

// Approve letter
useApproveLetter()

// Reject letter
useRejectLetter()

// Revise and resubmit
useReviseAndResubmit()
```

#### Combined Hooks:
```typescript
// Get workflow info for a letter
useLetterWorkflow(letterId: string, userId?: string)
// Returns: { letter, histories, myHistory, canReview, canApprove, canRevise, canSubmit }
```

---

### **Service Layer** (`src/lib/supabase/letters.ts`)

#### CRUD Operations:
```typescript
createLetter(data: OutgoingLetterInsert)
getLetter(letterId: string)
getLetters(filters?: {...})
updateLetter(letterId: string, updates: Partial<OutgoingLetterInsert>)
deleteLetter(letterId: string)
```

#### Workflow Operations:
```typescript
// Submit letter for review (uses RPC or fallback)
submitForReview(letterId: string, userId: string)

// Reviewer reviews a letter
reviewLetter(letterId: string, userId: string, action: 'APPROVE' | 'REQUEST_REVISION', notes?: string)

// Approver approves a letter
approveLetter(letterId: string, userId: string)

// Approver rejects a letter
rejectLetter(letterId: string, userId: string, notes?: string)

// Creator revises and resubmits
reviseAndResubmit(letterId: string, userId: string)
```

#### Query Helpers:
```typescript
getPendingReviews(userId: string)
getPendingApprovals(userId: string)
getWorkflowStages(documentTypeId: number)
```

---

## 🗄️ Database Tables

### 1. **outgoing_letters**
**Tabel utama surat keluar**

Kolom penting:
- `id` (uuid, PK)
- `document_number` (string, auto-generated saat approved)
- `status` (letter_status enum)
- `current_stage_id` (FK to document_workflow_stages)
- `document_type_id` (FK to document_types)
- `company_id` (FK to instansi)
- `sender_id` (FK to users)
- `created_by_id` (FK to users)
- `subject`, `opening`, `body`, `closing`
- `recipient_company`, `recipient_name`, `recipient_whatsapp`, `recipient_email`, `recipient_address`
- `letter_date`, `approved_at`, `rejected_at`
- `attachments` (jsonb)
- `signatories` (jsonb)

### 2. **letter_histories**
**Tabel audit trail / workflow tracking**

Kolom penting:
- `id` (bigint, PK)
- `letter_id` (FK to outgoing_letters)
- `action_by_id` (FK to users) - yang melakukan action
- `assigned_to_id` (FK to users) - yang ditugaskan (untuk review/approval)
- `action_type` (letter_action_type enum)
- `from_status` (letter_status enum)
- `to_status` (letter_status enum)
- `stage_type` (stage_type enum: REVIEW | APPROVAL)
- `sequence` (int) - urutan stage
- `notes` (text)
- `created_at`

**Digunakan untuk:**
- Audit trail di halaman detail
- Query pending reviews: `assigned_to_id = userId AND to_status = 'PENDING' AND stage_type = 'REVIEW'`
- Query pending approvals: `assigned_to_id = userId AND to_status = 'PENDING' AND stage_type = 'APPROVAL'`

### 3. **document_workflow_stages**
**Tabel konfigurasi workflow**

Kolom penting:
- `id` (bigint, PK)
- `document_type_id` (FK to document_types)
- `stage_name` (string)
- `stage_type` (stage_type enum: REVIEW | APPROVAL)
- `sequence` (int) - urutan stage
- `assignees` (jsonb) - array of { user_id, user_name }
- `is_active` (boolean)

**Digunakan untuk:**
- Menentukan siapa saja yang harus review/approve
- Urutan workflow stages
- Auto-create history entries saat submit

### 4. **document_types**
**Tabel kategori dokumen**

Kolom penting:
- `id` (bigint, PK)
- `name` (string) - "Surat Penawaran", "Surat Kontrak", dll
- `code` (string)
- `description` (text)
- `category` (string)
- `is_active` (boolean)

### 5. **users**
**Tabel user**

Digunakan untuk:
- Sender selection
- Reviewer/Approver assignment
- Created by tracking

### 6. **instansi**
**Tabel instansi/perusahaan**

Digunakan untuk:
- Company selection di form

---

## 🔄 Workflow Flow

### **Status Enum:**
```sql
letter_status:
  'DRAFT' | 'SUBMITTED_TO_REVIEW' | 'REVIEWED' | 'APPROVED' | 'REJECTED' | 'REVISION_REQUESTED'
```

### **Action Type Enum:**
```sql
letter_action_type:
  'CREATED' | 'SUBMITTED' | 'APPROVED_REVIEW' | 'APPROVED_FINAL' | 'REJECTED' | 'REVISION_REQUESTED' | 'REVISED'
```

### **Flow Diagram:**

```
┌─────────┐
│  DRAFT  │ ← User creates letter
└────┬────┘
     │ submitForReview()
     ▼
┌──────────────────────┐
│ SUBMITTED_TO_REVIEW  │ ← Waiting for reviewers
└──────────┬───────────┘
           │
           ├─ reviewLetter('APPROVE') → All reviewers approved?
           │                             ├─ Yes → REVIEWED
           │                             └─ No  → Still SUBMITTED_TO_REVIEW
           │
           └─ reviewLetter('REQUEST_REVISION') → REVISION_REQUESTED
                                                  └─ User edits → DRAFT

┌──────────┐
│ REVIEWED │ ← All reviewers approved, waiting for approver
└────┬─────┘
     │
     ├─ approveLetter() → APPROVED (generate document_number)
     │
     └─ rejectLetter() → REJECTED

┌──────────┐
│ APPROVED │ ← Final state, surat siap dikirim
└──────────┘

┌──────────┐
│ REJECTED │ ← Final state, surat ditolak
└──────────┘
```

---

## 🔐 Database Functions (RPC)

### 1. **submit_letter_for_review(letter_id, user_id)**
**Purpose:** Submit draft letter ke workflow pertama

**Logic:**
- Validasi status = DRAFT
- Get first workflow stage dari document_workflow_stages
- Update status → SUBMITTED_TO_REVIEW
- Set current_stage_id
- Insert history

**Returns:** `{ success: boolean, message: string }`

### 2. **review_letter(action, letter_id, user_id, notes?)**
**Purpose:** Review/approve/reject surat

**Logic:**
- Check user ada di assignees current stage
- Validate action (APPROVED_REVIEW | APPROVED_FINAL | REJECTED | REVISION_REQUESTED)
- Kalau APPROVED_REVIEW → move ke next stage atau final approve
- Update status & current_stage_id
- Insert history dengan notes

**Returns:** `{ success: boolean, message: string, new_status: letter_status }`

---

## 📊 Data Flow

### **Create Letter:**
```
User fills form
  ↓
useCreateLetter.mutate(data)
  ↓
createLetter(data) in letters.ts
  ↓
INSERT into outgoing_letters (status = 'DRAFT')
  ↓
INSERT into letter_histories (action_type = 'CREATED')
  ↓
Redirect to /documents/outgoing-letter/[id]
```

### **Submit for Review:**
```
User clicks "Submit untuk Review"
  ↓
useSubmitForReview.mutate(letterId)
  ↓
submitForReview(letterId, userId) in letters.ts
  ↓
Try RPC: submit_letter_for_review(letterId, userId)
  ├─ Success → Return
  └─ Fail → Fallback to client-side logic
      ↓
      Get workflow stages (REVIEW)
      ↓
      For each stage assignee:
        INSERT into letter_histories (assigned_to_id, to_status = 'PENDING', stage_type = 'REVIEW')
      ↓
      UPDATE outgoing_letters SET status = 'SUBMITTED_TO_REVIEW'
  ↓
Invalidate queries: ['letter', letterId], ['letters'], ['pending-reviews']
```

### **Review Letter:**
```
Reviewer opens /documents/review
  ↓
usePendingReviews(userId) fetches pending reviews
  ↓
Reviewer clicks "Detail" → Modal opens
  ↓
Reviewer fills notes and clicks "Setujui" or "Minta Revisi"
  ↓
useReviewLetter.mutate({ letterId, action, notes })
  ↓
reviewLetter(letterId, userId, action, notes) in letters.ts
  ↓
Try RPC: review_letter(letterId, userId, action, notes)
  ├─ Success → Return
  └─ Fail → Fallback to client-side logic
      ↓
      If action = 'REQUEST_REVISION':
        UPDATE outgoing_letters SET status = 'NEEDS_REVISION'
        INSERT into letter_histories (action_type = 'REVISION_REQUESTED')
      ↓
      If action = 'APPROVE':
        INSERT into letter_histories (action_type = 'APPROVED_REVIEW', to_status = 'APPROVED')
        Check if all reviewers approved
        ├─ Yes → UPDATE status = 'REVIEWED'
        │        Create approval stage entries
        └─ No  → Keep status = 'SUBMITTED_TO_REVIEW'
  ↓
Invalidate queries: ['letter', letterId], ['pending-reviews'], ['pending-approvals']
```

### **Approve Letter:**
```
Approver opens /documents/approval
  ↓
usePendingApprovals(userId) fetches pending approvals
  ↓
Approver clicks "Detail" → Modal opens
  ↓
Approver clicks "Setujui"
  ↓
useApproveLetter.mutate(letterId)
  ↓
approveLetter(letterId, userId) in letters.ts
  ↓
Generate document_number via RPC: generate_test_document_number()
  ↓
UPDATE outgoing_letters SET status = 'APPROVED', document_number = ..., approved_at = now()
  ↓
INSERT into letter_histories (action_type = 'APPROVED_FINAL', to_status = 'APPROVED')
  ↓
Invalidate queries: ['letter', letterId], ['letters'], ['pending-approvals']
```

---

## 🎯 Key Features

### **1. Badge Notifications**
- Sidebar "Administrasi" badge: Total pending reviews + approvals
- "Review" submenu badge: Pending reviews count
- "Approval" submenu badge: Pending approvals count

### **2. Optimized RPC Calls**
- Primary: Server-side RPC functions (faster, atomic)
- Fallback: Client-side logic (jika RPC gagal)

### **3. Real-time Updates**
- React Query invalidation setelah mutations
- Auto-refresh pending counts

### **4. Audit Trail**
- Semua action tercatat di `letter_histories`
- Timeline display di halaman detail
- Color coding untuk status

### **5. Permission-based Access**
- Review queue: Hanya user yang assigned
- Approval queue: Hanya approver yang assigned
- Edit: Hanya creator dan status DRAFT

---

## 🔍 Troubleshooting

### **Issue: Badge tidak update**
**Solution:** Check React Query invalidation di mutation hooks

### **Issue: RPC error**
**Solution:** Fallback logic akan handle, check console logs

### **Issue: Workflow tidak jalan**
**Solution:** Check `document_workflow_stages` configuration

### **Issue: User tidak bisa review/approve**
**Solution:** Check `assignees` di workflow stages

---

## 📝 TODO / Improvements

1. ✅ Implement RPC functions untuk performance
2. ✅ Add badge notifications di sidebar
3. ✅ Audit trail display
4. ⏳ File upload functionality (currently mock)
5. ⏳ PDF export/download
6. ⏳ Email notifications
7. ⏳ WhatsApp integration untuk notifikasi
8. ⏳ Advanced filtering di list page
9. ⏳ Bulk actions (approve multiple, etc)
10. ⏳ Document templates

---

## 📚 Related Documentation

- [OUTGOING_LETTERS_SETUP.md](./OUTGOING_LETTERS_SETUP.md) - Database migration context
- [Database Schema](../src/types/database.ts) - Generated types
- [Letter Types](../src/types/letter.ts) - TypeScript types
- [Workflow Hooks](../src/hooks/useWorkflow.ts) - Workflow management

---

**Last Updated:** 2026-02-11  
**Maintainer:** Development Team
