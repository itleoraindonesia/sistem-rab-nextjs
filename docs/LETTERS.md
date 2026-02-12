# Outgoing Letters (Surat Keluar) - AI Documentation

## Database Tables

### Core Tables (5 wajib + 1 opsional)
1. **document_types** - Master jenis surat (SPH, SKT, dll)
2. **document_workflow_configs** - Config reviewer/approver per jenis surat
3. **outgoing_letters** - Data surat actual
4. **letter_workflow_trackings** - Track progress review/approval
5. **letter_histories** - Audit trail semua aktivitas
6. **letter_versions** (optional) - Version control content

### Key Foreign Keys
- All tables use **UUID** for user references (link to `public.users`)
- `outgoing_letters.company_id` → `public.instansi(id)`
- `outgoing_letters.document_type_id` → `document_types(id)`
- **NO relation** to `public.clients` (recipient standalone)

---

## Status Flow

```
DRAFT → SUBMITTED_TO_REVIEW → REVIEWED → APPROVED
                  ↓                ↓
            NEEDS_REVISION    REJECTED
```

**6 Status:**
- `DRAFT` - Pembuat edit/delete
- `SUBMITTED_TO_REVIEW` - Parallel review active
- `NEEDS_REVISION` - Kembali ke pembuat
- `REVIEWED` - Lolos review, tunggu approval
- `APPROVED` - Final + auto-generate nomor surat
- `REJECTED` - Surat mati (hanya approver bisa reject)

---

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

---

## Workflow Logic (Parallel Review)

### Review Stage (completion_rule = 'ALL')
- Semua reviewer dapat notif **bersamaan**
- **Reviewer actions:** Approve | Request Revision (NO reject)
- Jika **semua approve** → status = `REVIEWED`
- Jika **ada 1 request revision** → status = `NEEDS_REVISION`

### Approval Stage
- **Approver actions:** Approve | Request Revision | Reject
- Jika **approve** → generate document_number + status = `APPROVED`
- Jika **reject** → status = `REJECTED` (permanent)

### Revision Flow
- Pembuat edit & resubmit
- **Reset workflow** (delete + recreate `letter_workflow_trackings`)
- Semua reviewer review ulang dari awal

---

## Document Number Format

**Auto-generate saat approved:**
```
XXX/INST/KAT/MM/YYYY
001/MMG/SPH/02/2025

XXX  = Sequence (reset per bulan)
INST = Instansi code (MMG, LKI)
KAT  = Document type code
MM   = Month
YYYY = Year
```

---

## Permissions (Existing RBAC)

**Gunakan permissions yang sudah ada:**
- `dokumen.create` / `dokumen.create.own`
- `dokumen.submit`
- `dokumen.review`
- `dokumen.approve`

**Role capabilities:**
- `reviewer` - Create, Submit, Review (NO reject)
- `approver` - Create, Submit, Approve, Reject
- `manager` - Depends on department
- `admin` - Full access

---

## Critical Rules

1. **Reviewer TIDAK bisa reject** - hanya approve atau request revision
2. **Approver bisa reject** - surat jadi permanent rejected
3. **Parallel review = ALL must approve** (completion_rule: 'ALL')
   - **PENTING:** Approver TIDAK dapat akses dokumen sampai SEMUA reviewer approve
   - Approval stage trackings hanya dibuat setelah semua reviewer selesai
4. **Revision resets workflow** - semua reviewer review ulang
5. **Document number hanya generated saat approved** (not before)
6. **Recipient data standalone** - tidak link ke clients table
7. **All IDs use UUID** - match existing users table
8. **Gunakan RPC functions** - jangan manual update database
9. **Import enums** dari generated types, jangan hardcode strings

---

## History Tracking

**Setiap action insert ke `letter_histories`:**
- CREATED, SUBMITTED, APPROVED_REVIEW, REVISION_REQUESTED
- REVISED, APPROVED_FINAL, REJECTED

**Fields:** action_by_id, action_type, from_status, to_status, notes, timestamp

---

## Key Queries Pattern

### Get pending reviews untuk user
```typescript
FROM letter_workflow_trackings
WHERE assigned_to_id = currentUserId
  AND status = 'PENDING'
JOIN outgoing_letters ON letter_id
```

### Check if all reviewers approved
```typescript
COUNT(*) WHERE status = 'APPROVED' AND sequence = X
=== 
COUNT(*) WHERE sequence = X
```

### Get letter with relations
```typescript
SELECT * FROM outgoing_letters
JOIN document_types
JOIN instansi
JOIN users (created_by, sender)
LEFT JOIN letter_workflow_trackings
LEFT JOIN letter_histories
```

---

## Form Structure (5 Sections)

1. **Identitas** - Company, date, document type
2. **Konten** - Subject (max 4 words), opening, body, closing
3. **Pengirim** - Sender user, dept, name, email
4. **Penerima** - Company, name, whatsapp, email, address (manual input)
5. **Lampiran** - Files (JSONB), Signatories (JSONB)

---

## Important Notes for AI

- **Status transitions follow strict flow** - don't skip steps
- **Always insert history** when status changes
- **Check completion_rule** before advancing stage
- **Generate document_number ONLY when status = APPROVED**
- **Reset workflow_trackings** on resubmit after revision
- **Reviewer ≠ Approver** - different permissions
- Use **existing users, instansi tables** - already have UUIDs
- **Use RPC calls** - panggil function via `.rpc()`, bukan manual update
- **Handle responses** - backend return success/error, tampilkan ke user
- **Import enums** dari generated types, jangan hardcode strings
