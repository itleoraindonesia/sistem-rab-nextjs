# 📋 Dokumentasi Perbaikan Halaman Revision

**Tanggal:** 2026-02-12  
**Target:** `/src/app/(protected)/documents/revision/page.tsx` dan `/src/app/(protected)/documents/outgoing-letter/[id]/edit/page.tsx`

---

## 🎯 Tujuan Perbaikan

Meningkatkan UX dan fungsionalitas halaman revision dengan menampilkan informasi yang lebih lengkap dan memperbaiki workflow edit-resubmit.

---

## 🔍 Masalah yang Ditemukan

### 1. **Tidak Ada Informasi Catatan Revisi** 🚨 CRITICAL
**Lokasi:** `/src/app/(protected)/documents/revision/page.tsx`

**Masalah:**
- User tidak bisa melihat **kenapa** surat mereka perlu direvisi
- Tidak ada informasi siapa yang meminta revisi
- Tidak ada timestamp kapan revisi diminta
- Catatan dari reviewer tidak ditampilkan

**Data yang Tersedia di Database:**
```sql
-- Table: letter_histories
-- Kolom yang relevan:
- action_type: 'REVISION_REQUESTED'
- notes: catatan dari reviewer
- action_by_id: user yang meminta revisi
- created_at: waktu revisi diminta
```

**Solusi yang Diperlukan:**
Tambahkan query untuk fetch revision notes dan tampilkan di card surat.

---

### 2. **Halaman Edit Tidak Menampilkan Catatan Revisi** 🚨 CRITICAL
**Lokasi:** `/src/app/(protected)/documents/outgoing-letter/[id]/edit/page.tsx`

**Masalah:**
- Saat user klik tombol "Revisi", mereka masuk ke halaman edit
- Tidak ada informasi apa yang harus diperbaiki
- User harus mengingat atau mencari tahu sendiri

**Solusi yang Diperlukan:**
Tambahkan Alert/Banner di bagian atas form yang menampilkan:
- Catatan revisi dari reviewer
- Nama reviewer
- Tanggal revisi diminta

---

### 3. **State Management Tidak Efisien** ⚠️ MEDIUM
**Lokasi:** `/src/app/(protected)/documents/revision/page.tsx` (line 22-24)

**Kode yang Bermasalah:**
```typescript
const [selectedLetter, setSelectedLetter] = React.useState<any>(null) // ❌ Tidak pernah digunakan
const [loading, setLoading] = React.useState<string | null>(null)      // ❌ Tidak pernah digunakan
const [error, setError] = React.useState<string | null>(null)          // ❌ Redundant dengan toast
```

**Solusi:**
Hapus state yang tidak digunakan untuk clean code.

---

### 4. **Fungsi handleResubmit Tidak Digunakan** ⚠️ MEDIUM
**Lokasi:** `/src/app/(protected)/documents/revision/page.tsx` (line 26-48)

**Masalah:**
- Fungsi `handleResubmit` ada tapi tidak pernah dipanggil
- Tombol "Revisi" langsung redirect ke `/edit` tanpa menggunakan fungsi ini

**Solusi:**
Hapus fungsi `handleResubmit` karena workflow saat ini adalah:
1. User klik "Revisi" → redirect ke halaman edit
2. User edit surat di halaman edit
3. User klik "Update & Resubmit" di halaman edit

---

### 5. **Tombol "Save Draft" Membingungkan untuk Revision** ⚠️ MEDIUM
**Lokasi:** `/src/app/(protected)/documents/outgoing-letter/[id]/edit/page.tsx` (line 721-728)

**Masalah:**
- Untuk surat dengan status `REVISION_REQUESTED`, tombol "Simpan Draft" tidak masuk akal
- Surat sudah pernah di-submit, jadi bukan draft lagi
- User bingung perbedaan "Simpan Draft" vs "Update & Resubmit"

**Solusi:**
Conditional rendering untuk tombol berdasarkan status:
- Jika `DRAFT`: tampilkan "Simpan Draft" dan "Submit to Review"
- Jika `REVISION_REQUESTED`: tampilkan "Simpan Perubahan" dan "Kirim Ulang untuk Review"

---

### 6. **Tidak Ada Validasi Perubahan** 💡 LOW
**Masalah:**
User bisa klik "Resubmit" tanpa melakukan perubahan apapun.

**Solusi (Optional):**
Track perubahan form dan tampilkan warning jika tidak ada perubahan.

---

### 7. **Tidak Ada Preview Sebelum Resubmit** 💡 LOW
**Masalah:**
User tidak bisa preview surat sebelum resubmit.

**Solusi (Optional):**
Tambahkan tombol "Preview" yang membuka modal/halaman preview.

---

## 🛠️ Implementasi yang Diperlukan

### **PRIORITY 1: Tampilkan Catatan Revisi di Halaman Revision**

**File:** `/src/app/(protected)/documents/revision/page.tsx`

**Langkah:**

1. **Buat custom hook untuk fetch revision notes:**

```typescript
// Tambahkan di dalam component atau buat hook terpisah
function useRevisionNotes(letterId: string) {
  return useQuery({
    queryKey: ['revision-notes', letterId],
    queryFn: async () => {
      const { data } = await supabase
        .from('letter_histories')
        .select(`
          *,
          action_by:users!letter_histories_action_by_id_fkey(id, nama, email)
        `)
        .eq('letter_id', letterId)
        .eq('action_type', 'REVISION_REQUESTED')
        .order('created_at', { ascending: false })
        .limit(1)
        .single()
      return data
    },
    enabled: !!letterId
  })
}
```

2. **Update UI untuk menampilkan revision notes:**

Tambahkan section di dalam Card (setelah line 140, sebelum closing div):

```tsx
{/* Revision Notes Section */}
<div className="mt-4 p-4 bg-orange-50 border border-orange-200 rounded-md">
  <div className="flex items-start gap-2">
    <AlertCircle className="h-5 w-5 text-orange-600 mt-0.5" />
    <div className="flex-1">
      <p className="text-sm font-semibold text-orange-900 mb-1">
        Catatan Revisi dari {revisionNote?.action_by?.nama}
      </p>
      <p className="text-sm text-orange-800">
        {revisionNote?.notes || 'Tidak ada catatan'}
      </p>
      <p className="text-xs text-orange-600 mt-2">
        Diminta pada: {new Date(revisionNote?.created_at).toLocaleDateString('id-ID', {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })}
      </p>
    </div>
  </div>
</div>
```

3. **Panggil hook untuk setiap letter:**

```tsx
{revisionLetters?.map((letter: any) => {
  const { data: revisionNote } = useRevisionNotes(letter.id)
  
  return (
    <Card key={letter.id}>
      {/* ... existing content ... */}
      {/* Tambahkan revision notes section di sini */}
    </Card>
  )
})}
```

**CATATAN PENTING:** 
- Import `supabase` dari `@/lib/supabase/client`
- Import `useQuery` dari `@tanstack/react-query`
- Import icon `AlertCircle` dari `lucide-react`

---

### **PRIORITY 2: Tampilkan Catatan Revisi di Halaman Edit**

**File:** `/src/app/(protected)/documents/outgoing-letter/[id]/edit/page.tsx`

**Langkah:**

1. **Tambahkan query untuk revision notes** (setelah line 50):

```typescript
// Fetch revision notes if status is REVISION_REQUESTED
const { data: revisionNote } = useQuery({
  queryKey: ['revision-note', id],
  queryFn: async () => {
    const { data } = await supabase
      .from('letter_histories')
      .select(`
        *,
        action_by:users!letter_histories_action_by_id_fkey(id, nama, email)
      `)
      .eq('letter_id', id)
      .eq('action_type', 'REVISION_REQUESTED')
      .order('created_at', { ascending: false })
      .limit(1)
      .single()
    return data
  },
  enabled: !!id && letter?.status === 'REVISION_REQUESTED'
})
```

2. **Tambahkan Alert di bagian atas form** (setelah line 304, sebelum Card):

```tsx
{/* Revision Alert - Only show if status is REVISION_REQUESTED */}
{letter?.status === 'REVISION_REQUESTED' && revisionNote && (
  <Alert className="border-orange-200 bg-orange-50">
    <AlertCircle className="h-5 w-5 text-orange-600" />
    <AlertTitle className="text-orange-900 font-semibold">
      Surat Perlu Direvisi
    </AlertTitle>
    <AlertDescription className="text-orange-800">
      <div className="space-y-2 mt-2">
        <p className="font-medium">
          Catatan dari {revisionNote.action_by?.nama}:
        </p>
        <p className="italic">
          "{revisionNote.notes || 'Tidak ada catatan spesifik'}"
        </p>
        <p className="text-sm text-orange-600">
          Diminta pada: {new Date(revisionNote.created_at).toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })}
        </p>
      </div>
    </AlertDescription>
  </Alert>
)}
```

**CATATAN PENTING:**
- Import `supabase` dari `@/lib/supabase/client`
- Import `useQuery` dari `@tanstack/react-query`
- Alert component sudah di-import di line 10

---

### **PRIORITY 3: Cleanup Unused State**

**File:** `/src/app/(protected)/documents/revision/page.tsx`

**Langkah:**

1. **Hapus state yang tidak digunakan** (line 22-24):

```typescript
// ❌ HAPUS BARIS INI:
const [selectedLetter, setSelectedLetter] = React.useState<any>(null)
const [loading, setLoading] = React.useState<string | null>(null)
const [error, setError] = React.useState<string | null>(null)
```

2. **Hapus fungsi handleResubmit** (line 26-48):

```typescript
// ❌ HAPUS SELURUH FUNGSI INI:
const handleResubmit = async (letterId: string) => {
  // ... seluruh isi fungsi
}
```

3. **Hapus error message display** (line 76-81):

```typescript
// ❌ HAPUS SECTION INI:
{error && (
  <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-md">
    <p className="text-sm font-medium">{error}</p>
  </div>
)}
```

---

### **PRIORITY 4: Perbaiki Tombol Save Draft vs Resubmit**

**File:** `/src/app/(protected)/documents/outgoing-letter/[id]/edit/page.tsx`

**Langkah:**

**Replace tombol action** (line 717-729):

```tsx
{/* Action Buttons */}
<div className="flex gap-4 justify-end pt-6 border-t">
  <Button 
    type="button" 
    variant="outline" 
    onClick={() => router.back()} 
    disabled={loading}
  >
    Batal
  </Button>
  
  {/* Conditional buttons based on letter status */}
  {letter?.status === 'REVISION_REQUESTED' ? (
    <>
      {/* For revision: Save Changes (without changing status) */}
      <Button 
        type="button" 
        variant="outline" 
        onClick={handleSaveDraft} 
        disabled={loading}
      >
        <Save className="mr-2 h-4 w-4" />
        Simpan Perubahan
      </Button>
      
      {/* Resubmit for review */}
      <Button 
        type="button" 
        onClick={handleSubmit} 
        disabled={loading}
        className="bg-orange-600 hover:bg-orange-700"
      >
        <Send className="mr-2 h-4 w-4" />
        Kirim Ulang untuk Review
      </Button>
    </>
  ) : (
    <>
      {/* For draft: Save as draft */}
      <Button 
        type="button" 
        variant="outline" 
        onClick={handleSaveDraft} 
        disabled={loading}
      >
        <Save className="mr-2 h-4 w-4" />
        Simpan Draft
      </Button>
      
      {/* Submit for review */}
      <Button 
        type="button" 
        onClick={handleSubmit} 
        disabled={loading}
      >
        <Send className="mr-2 h-4 w-4" />
        Submit untuk Review
      </Button>
    </>
  )}
</div>
```

---

## 🎨 Improvement UX Tambahan (OPTIONAL)

### **OPTIONAL 1: Tambahkan Loading State yang Lebih Baik**

**File:** `/src/app/(protected)/documents/revision/page.tsx`

**Replace loading state** (line 50-58):

```tsx
if (isLoading) {
  return (
    <div className="container mx-auto py-8">
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-primary"></div>
        <p className="text-gray-600">Memuat surat yang perlu direvisi...</p>
      </div>
    </div>
  )
}
```

---

### **OPTIONAL 2: Tambahkan Confirmation Dialog Sebelum Resubmit**

**File:** `/src/app/(protected)/documents/outgoing-letter/[id]/edit/page.tsx`

**Langkah:**

1. **Install shadcn dialog** (jika belum ada):
```bash
npx shadcn-ui@latest add dialog
```

2. **Tambahkan state untuk dialog:**
```typescript
const [showConfirmDialog, setShowConfirmDialog] = React.useState(false)
```

3. **Update handleSubmit untuk show dialog:**
```typescript
const handleSubmitClick = () => {
  if (!formRef.current?.checkValidity()) {
    formRef.current?.reportValidity()
    return
  }
  setShowConfirmDialog(true)
}

const handleConfirmSubmit = async () => {
  setShowConfirmDialog(false)
  await handleSubmit()
}
```

4. **Tambahkan Dialog component:**
```tsx
<Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Konfirmasi Pengiriman</DialogTitle>
      <DialogDescription>
        {letter?.status === 'REVISION_REQUESTED' 
          ? 'Apakah Anda yakin ingin mengirim ulang surat ini untuk review?'
          : 'Apakah Anda yakin ingin mengirim surat ini untuk review?'
        }
      </DialogDescription>
    </DialogHeader>
    <DialogFooter>
      <Button variant="outline" onClick={() => setShowConfirmDialog(false)}>
        Batal
      </Button>
      <Button onClick={handleConfirmSubmit}>
        Ya, Kirim
      </Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

---

### **OPTIONAL 3: Track Perubahan Form**

**File:** `/src/app/(protected)/documents/outgoing-letter/[id]/edit/page.tsx`

**Langkah:**

1. **Tambahkan state untuk track changes:**
```typescript
const [hasChanges, setHasChanges] = React.useState(false)
const [initialData, setInitialData] = React.useState<any>(null)
```

2. **Save initial data saat load:**
```typescript
React.useEffect(() => {
  if (letter && !initialData) {
    setInitialData({
      perihal: letter.subject,
      isiSurat: letter.body,
      pembuka: letter.opening,
      penutup: letter.closing,
      // ... field lainnya
    })
  }
}, [letter])
```

3. **Check changes saat form berubah:**
```typescript
React.useEffect(() => {
  if (initialData) {
    const changed = 
      perihal !== initialData.perihal ||
      isiSurat !== initialData.isiSurat ||
      pembuka !== initialData.pembuka ||
      penutup !== initialData.penutup
    setHasChanges(changed)
  }
}, [perihal, isiSurat, pembuka, penutup, initialData])
```

4. **Tampilkan warning jika tidak ada perubahan:**
```tsx
{letter?.status === 'REVISION_REQUESTED' && !hasChanges && (
  <Alert className="border-yellow-200 bg-yellow-50">
    <AlertCircle className="h-4 w-4 text-yellow-600" />
    <AlertDescription className="text-yellow-800">
      Anda belum melakukan perubahan apapun pada surat ini.
    </AlertDescription>
  </Alert>
)}
```

---

## 📝 Checklist Implementasi

### Priority 1 (CRITICAL - Harus Dikerjakan)
- [ ] Tambahkan query untuk fetch revision notes di halaman revision
- [ ] Tampilkan revision notes di card surat (revision page)
- [ ] Tambahkan query untuk fetch revision notes di halaman edit
- [ ] Tampilkan Alert revision notes di halaman edit

### Priority 2 (IMPORTANT - Sangat Disarankan)
- [ ] Hapus state `selectedLetter`, `loading`, `error` yang tidak digunakan
- [ ] Hapus fungsi `handleResubmit` yang tidak digunakan
- [ ] Hapus error message display yang redundant
- [ ] Update tombol action dengan conditional rendering

### Priority 3 (OPTIONAL - Nice to Have)
- [ ] Improve loading state UI
- [ ] Tambahkan confirmation dialog
- [ ] Implement form change tracking
- [ ] Tambahkan preview button

---

## 🧪 Testing Checklist

Setelah implementasi, test scenario berikut:

### Test Case 1: Melihat Surat yang Perlu Direvisi
1. [ ] Login sebagai user yang memiliki surat dengan status `REVISION_REQUESTED`
2. [ ] Navigasi ke `/documents/revision`
3. [ ] Verifikasi catatan revisi ditampilkan di setiap card
4. [ ] Verifikasi nama reviewer dan timestamp ditampilkan

### Test Case 2: Edit Surat Revisi
1. [ ] Dari halaman revision, klik tombol "Revisi"
2. [ ] Verifikasi Alert catatan revisi muncul di bagian atas form
3. [ ] Verifikasi tombol yang muncul adalah "Simpan Perubahan" dan "Kirim Ulang untuk Review"
4. [ ] Edit beberapa field
5. [ ] Klik "Simpan Perubahan" → verifikasi redirect ke detail page
6. [ ] Kembali ke edit, klik "Kirim Ulang untuk Review" → verifikasi status berubah ke `SUBMITTED_TO_REVIEW`

### Test Case 3: Edit Surat Draft (Bukan Revisi)
1. [ ] Buat surat baru (status DRAFT)
2. [ ] Navigasi ke halaman edit
3. [ ] Verifikasi Alert revisi TIDAK muncul
4. [ ] Verifikasi tombol yang muncul adalah "Simpan Draft" dan "Submit untuk Review"

### Test Case 4: Edge Cases
1. [ ] Test dengan surat yang tidak memiliki catatan revisi (notes null)
2. [ ] Test dengan multiple revision requests (harus tampilkan yang terbaru)
3. [ ] Test loading state saat fetch revision notes

---

## 📚 File yang Perlu Dimodifikasi

1. **`/src/app/(protected)/documents/revision/page.tsx`**
   - Tambah: Query untuk revision notes
   - Tambah: UI untuk menampilkan revision notes
   - Hapus: Unused state dan fungsi

2. **`/src/app/(protected)/documents/outgoing-letter/[id]/edit/page.tsx`**
   - Tambah: Query untuk revision notes
   - Tambah: Alert component untuk revision notes
   - Update: Conditional rendering untuk tombol action

---

## 🔗 Dependencies yang Diperlukan

Pastikan package berikut sudah terinstall:

```json
{
  "@tanstack/react-query": "^5.x.x",
  "@supabase/supabase-js": "^2.x.x",
  "lucide-react": "^0.x.x"
}
```

Jika menggunakan optional features:
```bash
npx shadcn-ui@latest add dialog
```

---

## 💡 Tips Implementasi

1. **Gunakan React Query DevTools** untuk debug query
2. **Test dengan data real** dari database
3. **Implementasi bertahap** - mulai dari Priority 1
4. **Commit setiap priority** untuk mudah rollback jika ada masalah
5. **Test di berbagai status surat** (DRAFT, REVISION_REQUESTED, SUBMITTED_TO_REVIEW)

---

## 🐛 Potential Issues & Solutions

### Issue 1: Query revision notes return null
**Cause:** Tidak ada data dengan `action_type = 'REVISION_REQUESTED'`  
**Solution:** Check database, pastikan saat reviewer request revision, action_type di-set dengan benar

### Issue 2: Multiple revision notes muncul
**Cause:** Surat di-revisi berkali-kali  
**Solution:** Query sudah menggunakan `.limit(1)` dan `.order('created_at', { ascending: false })` untuk ambil yang terbaru

### Issue 3: Alert tidak muncul di halaman edit
**Cause:** Query enabled condition tidak terpenuhi  
**Solution:** Pastikan `letter?.status === 'REVISION_REQUESTED'` dan `id` tersedia

---

## 📞 Support

Jika ada pertanyaan atau issue saat implementasi:
1. Check console log untuk error messages
2. Verify database schema dan data
3. Check React Query DevTools untuk query status
4. Review file `src/lib/supabase/letters.ts` untuk memahami data flow

---

**Good luck with the implementation! 🚀**
