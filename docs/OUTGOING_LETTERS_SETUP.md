# Surat Keluar - Database Migration Context

## Overview
Database surat keluar sudah dimigrate dari status string biasa ke enum-based dengan workflow stages. Backend sekarang handle semua business logic, frontend cuma konsumsi API.

## Database Changes

### New Enums
```sql
-- Status surat
letter_status: 
  'DRAFT' | 'SUBMITTED_TO_REVIEW' | 'REVIEWED' | 'APPROVED' | 'REJECTED' | 'REVISION_REQUESTED'

-- Action types untuk history
letter_action_type:
  'CREATED' | 'SUBMITTED' | 'APPROVED_REVIEW' | 'APPROVED_FINAL' | 'REJECTED' | 'REVISION_REQUESTED' | 'REVISED'
```

### Table Changes
```typescript
// outgoing_letters - new/changed fields
{
  status: letter_status (enum, not string anymore)
  current_stage_id: number | null (FK to document_workflow_stages)
}

// letter_histories - typed fields
{
  action_type: letter_action_type (enum)
  from_status: letter_status (enum)
  to_status: letter_status (enum)
}
```

## New Database Functions

### 1. submit_letter_for_review(letter_id, user_id)
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

### 2. review_letter(action, letter_id, user_id, notes?)
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

## Workflow Flow
```
DRAFT 
  → submit_letter_for_review() 
  → SUBMITTED_TO_REVIEW (stage 1)
    → review_letter('APPROVED_REVIEW') 
    → REVIEWED (stage 2)
      → review_letter('APPROVED_FINAL')
      → APPROVED (no stage)

// Alternate paths:
- review_letter('REJECTED') → REJECTED
- review_letter('REVISION_REQUESTED') → REVISION_REQUESTED → user edit → DRAFT
```

## Frontend Refactor Requirements

### Must Do:
1. **Generate types** - `npx supabase gen types typescript` untuk dapat enum types
2. **Import enums** dari generated types, jangan hardcode strings
3. **Remove business logic** - jangan validasi status/permission di frontend
4. **Use RPC calls** - panggil function via `.rpc()`, bukan manual update
5. **Handle responses** - backend return success/error, tampilkan ke user

### Don't Do:
- ❌ Hardcode status strings ('draft', 'approved', etc)
- ❌ Manual UPDATE outgoing_letters SET status
- ❌ Validasi "boleh approve/ngga" di frontend
- ❌ Complex workflow logic di frontend

### Example Usage
```typescript
// ❌ OLD WAY - JANGAN
await supabase
  .from('outgoing_letters')
  .update({ status: 'submitted' })
  .eq('id', letterId)

// ✅ NEW WAY
const { data, error } = await supabase.rpc('submit_letter_for_review', {
  p_letter_id: letterId,
  p_user_id: userId
})

if (data?.success) {
  // handle success
} else {
  // show error: data.message
}
```
```typescript
// ❌ OLD WAY
if (userRole === 'reviewer' && letter.status === 'submitted') {
  showApproveButton = true
}

// ✅ NEW WAY - backend decide, frontend just call
const { data } = await supabase.rpc('review_letter', {
  p_action: 'APPROVED_REVIEW',
  p_letter_id: letterId,
  p_user_id: userId,
  p_notes: 'LGTM'
})
// Backend handle authorization, return error if not allowed
```

## Refactor Priority

1. **Form create/edit** - ganti status ke enum, test save draft
2. **List page** - status badge pake enum values
3. **Detail + submit** - integrate submit_letter_for_review()
4. **Review/approve page** - integrate review_letter()
5. **History timeline** - display letter_histories

## Key Principles

- Backend = source of truth untuk workflow & permissions
- Frontend = UI rendering & API calls only
- Enum-based = type safety, no typos
- Function-based = atomic operations dengan validation
- History = automatic audit trail

## Testing Checklist

- [ ] Create draft letter
- [ ] Submit letter (DRAFT → SUBMITTED_TO_REVIEW)
- [ ] Review as assigned reviewer (SUBMITTED → REVIEWED)
- [ ] Approve as assigned approver (REVIEWED → APPROVED)
- [ ] Reject letter
- [ ] Request revision
- [ ] Try actions as unauthorized user (should fail)
- [ ] Check letter_histories populated correctly