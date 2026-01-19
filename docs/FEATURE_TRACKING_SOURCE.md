# Fitur Tracking Source - CRM Input

## 📋 Overview
Fitur ini menambahkan kemampuan untuk melacak sumber lead (Instagram atau WhatsApp) dalam sistem CRM, dengan auto-detect format CSV dan handling duplicate WhatsApp number.

## ✨ Fitur Utama

### 1. **Tracking Source Selection**
- Checkbox button untuk memilih sumber: **Instagram Only** atau **WhatsApp Only**
- UI dinamis yang berubah berdasarkan pilihan source
- Wajib memilih source sebelum input data

### 2. **Auto-detect CSV Format**
- **Instagram Format** (6 kolom):
  ```
  Username Instagram, Nama, WhatsApp, Kebutuhan, Kabupaten, Luasan
  ```
  Contoh:
  ```
  @budisantoso, Budi Santoso, 08123456789, Rumah, Kota Depok, 200
  ```

- **WhatsApp Format** (5 kolom):
  ```
  Nama, WhatsApp, Kebutuhan, Kabupaten, Luasan
  ```
  Contoh:
  ```
  Budi Santoso, 08123456789, Rumah, Kota Depok, 200
  ```

### 3. **UI Dinamis**
- Format instruksi berubah sesuai source yang dipilih
- Preview table menampilkan kolom Username IG hanya untuk Instagram source
- Placeholder textarea menyesuaikan dengan format yang dipilih
- Real-time validation dan preview

### 4. **Duplicate WhatsApp Handling**
- Ketika data Instagram memiliki nomor WA yang sama dengan data WhatsApp existing:
  - Sistem akan **UPDATE** data existing dengan informasi Instagram
  - Tracking source berubah dari `whatsapp_only` → `instagram_only`
  - Instagram username ditambahkan
  - Data lainnya (nama, kebutuhan, kabupaten, dll) juga diupdate
- Mencegah duplikasi data dengan nomor WA yang sama

## 🗄️ Database Schema

### Kolom Baru di Tabel `clients`

```sql
-- tracking_source: Sumber lead
tracking_source TEXT CHECK (tracking_source IN ('instagram_only', 'whatsapp_only'))

-- instagram_username: Username Instagram (jika source adalah Instagram)
instagram_username TEXT
```

### Indexes
```sql
CREATE INDEX idx_clients_tracking_source ON clients(tracking_source);
CREATE INDEX idx_clients_instagram_username ON clients(instagram_username);
```

## 📦 File yang Dimodifikasi

### 1. **Type Definitions**
- `/src/lib/supabaseClient.ts` - Extended Client type
- `/src/lib/crm/parsers.ts` - Extended ParsedRow interface

### 2. **Parser Logic**
- `/src/lib/crm/parsers.ts`
  - `parseCSV()` - Auto-detect format berdasarkan jumlah kolom
  - `formatForDatabase()` - Include tracking_source dan instagram_username

### 3. **UI Components**
- `/src/components/crm/BulkInputForm.tsx`
  - Tracking source selector dengan checkbox buttons
  - Dynamic format instructions
  - Enhanced preview table dengan kolom Instagram username
  - Duplicate handling logic dalam `handleSave()`

### 4. **Pages**
- `/src/app/(protected)/crm/input/page.tsx`
  - Updated tips section dengan informasi fitur baru

### 5. **Database Migration**
- `/migrations/add_tracking_source_to_clients.sql`
- `/migrations/README_tracking_source.md`

## 🚀 Cara Menggunakan

### 1. Jalankan Migration
Lihat instruksi lengkap di `/migrations/README_tracking_source.md`

**Quick Start (Supabase Dashboard):**
1. Buka Supabase Dashboard → SQL Editor
2. Copy-paste isi file `migrations/add_tracking_source_to_clients.sql`
3. Execute

### 2. Gunakan Fitur di UI
1. Buka halaman `/crm/input`
2. **Pilih sumber data** (Instagram atau WhatsApp) - WAJIB
3. Input data sesuai format yang ditampilkan
4. Preview akan muncul real-time
5. Klik "Simpan" untuk menyimpan data

## 🎯 Use Cases

### Case 1: Input Data WhatsApp
```
1. Pilih "WhatsApp Only"
2. Input: Budi Santoso, 08123456789, Rumah, Kota Depok, 200
3. Save → Data tersimpan dengan tracking_source = 'whatsapp_only'
```

### Case 2: Input Data Instagram
```
1. Pilih "Instagram Only"
2. Input: @budisantoso, Budi Santoso, 08123456789, Rumah, Kota Depok, 200
3. Save → Data tersimpan dengan tracking_source = 'instagram_only' dan instagram_username = '@budisantoso'
```

### Case 3: Update WhatsApp → Instagram (Duplicate Handling)
```
Existing data:
- Nama: Budi Santoso
- WA: 628123456789
- tracking_source: whatsapp_only

New Instagram input:
- Username: @budisantoso
- Nama: Budi Santoso
- WA: 08123456789 (sama dengan existing)
- tracking_source: instagram_only

Result:
→ Data existing di-UPDATE (bukan insert baru)
→ tracking_source berubah jadi 'instagram_only'
→ instagram_username ditambahkan: '@budisantoso'
→ Data lain juga diupdate sesuai input baru
```

## 🔍 Validasi

### Instagram Source
- ✅ Username Instagram wajib diisi
- ✅ Nama wajib diisi
- ✅ WhatsApp wajib diisi dan valid
- ✅ Kebutuhan wajib diisi
- ✅ Kabupaten wajib diisi dan valid
- ⚪ Luasan opsional

### WhatsApp Source
- ✅ Nama wajib diisi
- ✅ WhatsApp wajib diisi dan valid
- ✅ Kebutuhan wajib diisi
- ✅ Kabupaten wajib diisi dan valid
- ⚪ Luasan opsional

## 📊 Reporting & Analytics

Dengan tracking source, Anda bisa:
- Filter leads berdasarkan source (Instagram vs WhatsApp)
- Analisis conversion rate per channel
- Track Instagram username untuk follow-up
- Identifikasi leads yang berasal dari multi-channel (WA → IG)

## 🐛 Troubleshooting

### Error: "Pilih sumber data terlebih dahulu"
**Solusi:** Klik salah satu button (WhatsApp Only atau Instagram Only) sebelum input data

### Error: "Username Instagram wajib diisi"
**Solusi:** Pastikan kolom pertama (Username IG) tidak kosong untuk Instagram source

### Data tidak ter-update saat duplicate
**Solusi:** Pastikan:
- Nomor WA sama persis (sistem auto-normalize 08xxx → 628xxx)
- Data existing memiliki tracking_source = 'whatsapp_only'
- Data baru memiliki tracking_source = 'instagram_only'

## 📝 Notes

- Auto-normalisasi WhatsApp tetap berjalan (08xxx → 628xxx)
- Kabupaten validation dengan suggestions tetap aktif
- Format CSV support comma (,) dan tab (\t) sebagai delimiter
- Header row otomatis di-skip jika terdeteksi

## 🔄 Future Enhancements

Potential improvements:
- [ ] Support untuk multi-source (leads yang ada di IG dan WA)
- [ ] Bulk update tracking source untuk data existing
- [ ] Export data dengan filter by source
- [ ] Instagram DM integration
- [ ] WhatsApp Business API integration

---

**Version:** 1.0.0  
**Date:** 2026-01-19  
**Author:** Sistem RAB Development Team
