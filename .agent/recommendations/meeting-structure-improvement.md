# Rekomendasi Perbaikan Struktur Meeting

## 🎯 Tujuan
Memperbaiki struktur routing dan implementasi fitur meeting agar sesuai dengan best practice RESTful dan Next.js App Router.

## 📁 Struktur Route yang Direkomendasikan

```
src/app/(protected)/meeting/
├── page.tsx                    # List semua meeting (pindah dari mom/page.tsx)
├── baru/
│   └── page.tsx               # Create new meeting ✅ (sudah ok)
├── [id]/
│   ├── page.tsx               # Detail/View meeting (READ-ONLY) ⚠️ BELUM ADA
│   └── edit/
│       └── page.tsx           # Edit meeting (pindah dari mom/[id]/edit/page.tsx)
```

## 🔄 Migration Steps

### Step 1: Buat Detail Page (View-Only)
**File:** `src/app/(protected)/meeting/[id]/page.tsx`

**Fitur:**
- View meeting details (read-only)
- Tombol "Edit" untuk masuk ke edit mode
- Tombol "Export PDF" untuk download MoM
- Display attachments jika ada
- Status badge (draft/published)

### Step 2: Pindahkan List Page
**From:** `src/app/(protected)/meeting/mom/page.tsx`
**To:** `src/app/(protected)/meeting/page.tsx`

**Update:**
- Link "Buat MoM Baru" tetap ke `/meeting/baru`
- Card/row click mengarah ke `/meeting/[id]` (detail view)
- Action button "Edit" mengarah ke `/meeting/[id]/edit`

### Step 3: Pindahkan Edit Page
**From:** `src/app/(protected)/meeting/mom/[id]/edit/page.tsx`
**To:** `src/app/(protected)/meeting/[id]/edit/page.tsx`

**Update:**
- Breadcrumb: Meeting > Detail > Edit
- Cancel button kembali ke `/meeting/[id]` (detail page)
- Success redirect ke `/meeting/[id]` (detail page)

### Step 4: Update Navigation Links
Update semua link di aplikasi:
- `/meeting/mom` → `/meeting`
- `/meeting/mom/${id}/edit` → `/meeting/${id}/edit`
- Tambahkan link baru: `/meeting/${id}` untuk detail view

## 🗄️ Database Schema (Opsional - Jika Mau Refactor)

```sql
-- Rename table (opsional, tapi lebih clean)
ALTER TABLE mom_meetings RENAME TO meetings;

-- Atau tetap pakai mom_meetings tapi update query di kode
```

## 🎨 UI/UX Improvements

### Detail Page Layout
```
┌─────────────────────────────────────────┐
│ [← Back]  Meeting Detail               │
│                                         │
│ ┌─────────────────────────────────────┐ │
│ │ Meeting Number: 001/MOM/I/2026      │ │
│ │ Status: [Published]                 │ │
│ │                                     │ │
│ │ Title: Rapat Koordinasi Q1          │ │
│ │ Type: Internal                      │ │
│ │ Date: 31 Jan 2026, 10:00           │ │
│ │ Location: Meeting Room A            │ │
│ │                                     │ │
│ │ Participants: (avatars)             │ │
│ │                                     │ │
│ │ Description:                        │ │
│ │ Lorem ipsum...                      │ │
│ │                                     │ │
│ │ Attachments:                        │ │
│ │ - file1.pdf                         │ │
│ │ - file2.docx                        │ │
│ │                                     │ │
│ │ [Edit] [Export PDF] [Delete]        │ │
│ └─────────────────────────────────────┘ │
└─────────────────────────────────────────┘
```

## 🔐 Permission & Status Logic

### View Permission
- Draft: Hanya creator dan admin
- Published: Semua user yang terdaftar

### Edit Permission
- Draft: Creator dan admin
- Published: Hanya admin (atau tidak bisa edit sama sekali)

### Status Workflow
```
Draft → [Publish] → Published → [Archive] → Archived
  ↓                     ↓
[Edit]              [Edit] (admin only)
```

## 📝 Implementation Checklist

- [ ] Buat `/meeting/[id]/page.tsx` (detail view)
- [ ] Pindahkan `/meeting/mom/page.tsx` → `/meeting/page.tsx`
- [ ] Pindahkan `/meeting/mom/[id]/edit/page.tsx` → `/meeting/[id]/edit/page.tsx`
- [ ] Update semua navigation links
- [ ] Implementasi file upload logic
- [ ] Tambahkan export PDF functionality
- [ ] Implementasi permission logic
- [ ] Update breadcrumb di semua pages
- [ ] Testing routing dan navigation flow
- [ ] Update dokumentasi

## 🚀 Priority

**High Priority:**
1. Buat detail page (`/meeting/[id]/page.tsx`)
2. Pindahkan list page ke `/meeting/page.tsx`
3. Update navigation links

**Medium Priority:**
4. Implementasi file upload
5. Export PDF functionality
6. Permission logic

**Low Priority:**
7. Rename database table (opsional)
8. Advanced features (archive, etc)

## 💡 Additional Features to Consider

1. **Search & Filter Enhancement**
   - Filter by date range
   - Filter by status
   - Filter by creator

2. **Bulk Actions**
   - Bulk export
   - Bulk delete
   - Bulk status change

3. **Calendar View**
   - Monthly calendar view
   - Upcoming meetings widget

4. **Notifications**
   - Email reminder sebelum meeting
   - Notification saat MoM dipublish

5. **Templates**
   - Meeting agenda templates
   - MoM templates by type
