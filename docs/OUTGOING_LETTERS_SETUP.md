# Outgoing Letters Setup Guide

## 📋 Ringkasan

Berdasarkan analisis `database.ts` dan struktur aplikasi, berikut adalah checklist lengkap untuk membuat fitur **Outgoing Letters** berfungsi dengan baik.

---

## ✅ Yang Sudah Ada

### 1. **Database Schema** ✓
- ✅ `outgoing_letters` table
- ✅ `document_types` table
- ✅ `document_workflow_configs` table
- ✅ `letter_workflow_trackings` table
- ✅ `letter_histories` table
- ✅ `letter_versions` table (optional)
- ✅ `instansi` table (untuk company)
- ✅ `users` table (untuk creator, sender, reviewer, approver)

### 2. **UI Pages** ✓
- ✅ List page: `/documents/outgoing-letter/page.tsx`
- ✅ Create page: `/documents/outgoing-letter/baru/page.tsx`
- ✅ Detail page: `/documents/outgoing-letter/[id]/page.tsx`
- ✅ Edit page: `/documents/outgoing-letter/[id]/edit/page.tsx`
- ✅ Review page: `/documents/review/[id]/page.tsx`
- ✅ Approval page: `/documents/approval/[id]/page.tsx`

### 3. **Hooks** ✓
- ✅ `useLetters()` - fetch all letters
- ✅ `useLetter(id)` - fetch single letter
- ✅ `useCreateLetter()` - create new letter
- ✅ `useUpdateLetter()` - update letter
- ✅ `useSubmitForReview()` - submit to review
- ✅ `useReviewLetter()` - review action
- ✅ `useApproveLetter()` - approve action
- ✅ `useRejectLetter()` - reject action
- ✅ `usePendingReviews()` - get pending reviews
- ✅ `usePendingApprovals()` - get pending approvals
- ✅ `useDocumentTypes()` - get document types
- ✅ `useInstansiList()` - get companies
- ✅ `useUsersList()` - get users

---

## ⚠️ Yang Perlu Ditambahkan/Diperbaiki

### 1. **Master Data (CRITICAL)** 🔴

Anda perlu memastikan ada data di tabel-tabel berikut:

#### a. **Document Types**
```sql
-- Sudah ada di migration: 004_seed_document_types.sql
-- Pastikan sudah dijalankan!
SELECT * FROM document_types;
```

Jika belum ada, jalankan:
```bash
supabase db reset  # atau
supabase migration up
```

#### b. **Workflow Configs**
```sql
-- Sudah ada di migration: 005_seed_workflow_configs.sql
-- Pastikan sudah dijalankan!
SELECT * FROM document_workflow_configs;
```

#### c. **Instansi (Companies)**
```sql
-- Cek apakah ada data
SELECT * FROM instansi;

-- Jika kosong, tambahkan minimal 1:
INSERT INTO instansi (nama, alamat, email, telepon)
VALUES 
  ('PT Leora Indonesia', 'Jl. Raya Industri No. 456, Jakarta Selatan', 'info@leora.co.id', '(021) 1234-5678'),
  ('PT Multi Media Graha', 'Jl. Gatot Subroto No. 88, Jakarta', 'contact@mmg.co.id', '(021) 8765-4321');
```

#### d. **Users dengan Role yang Tepat**
```sql
-- Cek users dengan role reviewer dan approver
SELECT id, nama, email, role FROM users WHERE role IN ('reviewer', 'approver', 'admin');

-- Jika tidak ada, update beberapa user:
UPDATE users SET role = 'reviewer' WHERE email = 'reviewer@example.com';
UPDATE users SET role = 'approver' WHERE email = 'approver@example.com';
UPDATE users SET role = 'admin' WHERE email = 'admin@example.com';
```

### 2. **Dummy Data untuk Testing** 🟡

Saya sudah membuat file migration: `006_seed_outgoing_letters_dummy.sql`

File ini berisi:
- ✅ 5 sample letters dengan berbagai status:
  - DRAFT
  - SUBMITTED_TO_REVIEW
  - REVIEWED
  - APPROVED (dengan document number)
  - NEEDS_REVISION
- ✅ Workflow trackings
- ✅ Letter histories

**Cara menjalankan:**
```bash
# Jalankan migration
supabase migration up

# Atau manual via Supabase Dashboard:
# 1. Buka Supabase Dashboard
# 2. SQL Editor
# 3. Copy-paste isi file 006_seed_outgoing_letters_dummy.sql
# 4. Run
```

### 3. **Database Functions** 🟡

Pastikan function `submit_for_review` sudah ada dan berfungsi:

```sql
-- Cek function
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_name = 'submit_for_review';
```

Jika belum ada, function ini seharusnya ada di migration `optimize_submit_review_v3.sql`.

### 4. **RLS Policies** 🟡

Pastikan Row Level Security policies sudah di-setup dengan benar:

```sql
-- Cek policies untuk outgoing_letters
SELECT * FROM pg_policies WHERE tablename = 'outgoing_letters';
```

Minimal policies yang diperlukan:
- ✅ Users can view their own letters
- ✅ Users can view letters they need to review
- ✅ Users can view letters they need to approve
- ✅ Users can create letters
- ✅ Users can update their own draft letters

---

## 🚀 Langkah-Langkah Setup

### Step 1: Verifikasi Database Schema
```bash
# Jalankan semua migrations
cd supabase
supabase migration up
```

### Step 2: Seed Master Data
```sql
-- Pastikan ada document types
SELECT COUNT(*) FROM document_types;  -- Harus > 0

-- Pastikan ada workflow configs
SELECT COUNT(*) FROM document_workflow_configs;  -- Harus > 0

-- Pastikan ada instansi
SELECT COUNT(*) FROM instansi;  -- Harus > 0

-- Pastikan ada users dengan role yang tepat
SELECT COUNT(*) FROM users WHERE role IN ('reviewer', 'approver');  -- Harus > 0
```

### Step 3: Tambahkan Dummy Data
```bash
# Jalankan migration dummy data
supabase migration up

# Atau manual via SQL Editor di Supabase Dashboard
```

### Step 4: Test di UI
1. Buka `/documents/outgoing-letter`
2. Seharusnya muncul list surat (dari dummy data)
3. Klik "Buat Surat Baru" untuk test create
4. Klik "Detail" untuk test detail view
5. Test workflow: Submit → Review → Approve

---

## 🐛 Troubleshooting

### Problem: "No letters found" atau list kosong

**Solusi:**
1. Cek apakah dummy data sudah ter-insert:
   ```sql
   SELECT COUNT(*) FROM outgoing_letters;
   ```
2. Cek RLS policies - mungkin user tidak punya akses
3. Cek di browser console untuk error

### Problem: "Cannot create letter" - dropdown kosong

**Solusi:**
1. Pastikan ada data di `document_types`:
   ```sql
   SELECT * FROM document_types WHERE is_active = true;
   ```
2. Pastikan ada data di `instansi`:
   ```sql
   SELECT * FROM instansi;
   ```
3. Pastikan ada users:
   ```sql
   SELECT * FROM users WHERE is_active = true;
   ```

### Problem: "Submit for review failed"

**Solusi:**
1. Cek apakah ada workflow config untuk document type tersebut:
   ```sql
   SELECT * FROM document_workflow_configs 
   WHERE document_type_id = <your_doc_type_id> 
   AND is_active = true;
   ```
2. Cek apakah function `submit_for_review` ada dan berfungsi
3. Cek logs di Supabase Dashboard → Database → Logs

### Problem: "Review/Approval page shows nothing"

**Solusi:**
1. Pastikan user yang login punya role `reviewer` atau `approver`
2. Cek apakah ada pending items:
   ```sql
   -- For reviewer
   SELECT * FROM letter_workflow_trackings 
   WHERE assigned_to_id = '<user_id>' 
   AND stage_type = 'REVIEW' 
   AND status = 'PENDING';
   
   -- For approver
   SELECT * FROM letter_workflow_trackings 
   WHERE assigned_to_id = '<user_id>' 
   AND stage_type = 'APPROVAL' 
   AND status = 'PENDING';
   ```

---

## 📝 Checklist Lengkap

- [ ] Semua migrations sudah dijalankan
- [ ] Ada minimal 1 document type (SPH, SKT, dll)
- [ ] Ada minimal 1 instansi
- [ ] Ada minimal 1 user dengan role `reviewer`
- [ ] Ada minimal 1 user dengan role `approver`
- [ ] Ada workflow configs untuk setiap document type
- [ ] Function `submit_for_review` sudah ada
- [ ] RLS policies sudah di-setup
- [ ] Dummy data sudah di-insert (opsional, untuk testing)
- [ ] UI bisa menampilkan list letters
- [ ] UI bisa create new letter
- [ ] UI bisa submit for review
- [ ] Review page berfungsi
- [ ] Approval page berfungsi

---

## 🎯 Next Steps

Setelah semua checklist di atas selesai:

1. **Test Complete Workflow:**
   - Create letter → Submit → Review → Approve
   - Verify document number generated
   - Check history tracking

2. **Test Edge Cases:**
   - Request revision flow
   - Reject flow
   - Multiple reviewers (parallel review)

3. **Add More Features (Optional):**
   - PDF export
   - Email notifications
   - File attachments (real upload, bukan mock)
   - Advanced search/filter

---

## 📚 References

- Database Schema: `src/types/database.ts`
- Documentation: `docs/LETTERS.md`
- Migrations: `supabase/migrations/`
- Hooks: `src/hooks/useLetters.ts`
