# Project Tracking Feature

## Overview
Fitur untuk memonitor hubungan antara progress pekerjaan vendor, pembayaran ke vendor, dan pembayaran dari customer dalam satu project.

## Tech Stack
- Frontend: Next.js + TypeScript
- Backend: Supabase (PostgreSQL)
- Auth & RBAC: Supabase Auth

---

## Data Structure

```
projects
  └── customer_payment      (revenue dari customer)
  └── vendor_spk            (kontrak per vendor)
        └── vendor_progress (history progress pekerjaan)
        └── vendor_payment  (history pembayaran ke vendor)
```

### Relasi
- 1 project → many vendor_spk
- 1 project → many customer_payment
- 1 vendor_spk → many vendor_progress
- 1 vendor_spk → many vendor_payment

---

## Data Fields

### projects
| Field | Type | Keterangan |
|---|---|---|
| id | uuid | PK |
| nama_project | text | |
| customer | text | |
| contract_value | numeric | Nilai kontrak dengan customer |
| tanggal_mulai | date | |
| tanggal_deadline | date | Deadline penyelesaian proyek |
| retensi_persen | numeric | % retensi (default 0, opsional) |
| status | text | `active` \| `completed` \| `cancelled` |

### vendor_spk
| Field | Type | Keterangan |
|---|---|---|
| id | uuid | PK |
| project_id | uuid | FK → projects |
| nama_vendor | text | |
| nilai_spk | numeric | |
| retensi_persen | numeric | % retensi per vendor SPK (opsional) |
| status | text | `active` \| `completed` |
| lampiran_url | text | URL file SPK di Supabase Storage |

### vendor_progress
| Field | Type | Keterangan |
|---|---|---|
| id | uuid | PK |
| vendor_spk_id | uuid | FK → vendor_spk |
| tanggal | date | |
| progress_percent | numeric | 0–100 |
| catatan | text | Opsional |
| lampiran_url | text | URL BA progress di Supabase Storage |

### vendor_payment
| Field | Type | Keterangan |
|---|---|---|
| id | uuid | PK |
| vendor_spk_id | uuid | FK → vendor_spk |
| tanggal | date | |
| jenis_pembayaran | text | `dp` \| `term` \| `pelunasan` |
| jumlah | numeric | |
| catatan | text | Opsional |
| lampiran_url | text | URL invoice/kwitansi di Supabase Storage |

### customer_payment
| Field | Type | Keterangan |
|---|---|---|
| id | uuid | PK |
| project_id | uuid | FK → projects |
| tanggal | date | |
| termin | text | `dp` \| `term` \| `final` |
| jumlah | numeric | |
| catatan | text | Opsional |
| lampiran_url | text | URL bukti pembayaran di Supabase Storage |

---

## Business Logic

### Weighted Project Progress
Project progress dihitung otomatis berdasarkan nilai SPK tiap vendor.

```
Project Progress =
  Σ (nilai_spk_vendor × progress_vendor_terkini)
  ─────────────────────────────────────────────
  Σ nilai_spk_vendor
```

- Gunakan `progress_percent` terbaru dari `vendor_progress` per vendor
- Hanya vendor dengan `status = 'active'` yang ikut kalkulasi
- Hasil dibulatkan 2 desimal

### Margin / Cash Flow
Tampilkan selisih antara uang masuk dari customer vs uang keluar ke vendor:

```
Cash Flow Aktual     = Customer Paid - Vendor Paid
Projected Margin     = contract_value - Total SPK
Margin %             = Projected Margin / contract_value × 100
```

- Jika `Cash Flow Aktual < 0` (Vendor Paid > Customer Paid): tampilkan **warning** di UI
- Jika `Customer Outstanding > contract_value × 0.5`: tampilkan **alert** di UI

### Retensi (Opsional)
Jika `retensi_persen > 0` pada vendor_spk:

```
Nilai Retensi Vendor = nilai_spk × retensi_persen / 100
Nilai Bersih SPK     = nilai_spk - Nilai Retensi Vendor
```

- Retensi baru bisa dibayar setelah `vendor_spk.status = 'completed'`
- Tampilkan kolom retensi di tabel Vendor SPK jika ada vendor yang punya retensi

### Sisa Hari Proyek
```
Sisa Hari = tanggal_deadline - tanggal_hari_ini
```

- Tampilkan di summary view
- Jika `sisa_hari <= 0`: status **Overdue**
- Jika `sisa_hari <= 14`: tampilkan **warning**

### Validasi Rules
- `progress_percent` antara 0–100
- Total `vendor_payment.jumlah` per vendor tidak boleh melebihi `vendor_spk.nilai_spk`
- Total `customer_payment.jumlah` per project tidak boleh melebihi `projects.contract_value`
- `vendor_spk.status` hanya: `active` | `completed`
- `vendor_payment.jenis_pembayaran` hanya: `dp` | `term` | `pelunasan`
- `customer_payment.termin` hanya: `dp` | `term` | `final`
- `projects.status` hanya: `active` | `completed` | `cancelled`
- `retensi_persen` antara 0–100

---

## Key Calculations (Summary View)

| Metric | Kalkulasi |
|---|---|
| Project Progress | Weighted avg progress vendor active |
| Total SPK | Σ nilai_spk semua vendor |
| Vendor Paid | Σ jumlah dari vendor_payment |
| Vendor Outstanding | Total SPK - Vendor Paid |
| Customer Paid | Σ jumlah dari customer_payment |
| Customer Outstanding | contract_value - Customer Paid |
| Cash Flow Aktual | Customer Paid - Vendor Paid |
| Projected Margin | contract_value - Total SPK |
| Projected Margin % | Projected Margin / contract_value × 100 |
| Sisa Hari | tanggal_deadline - today |

---

## UI / UX Notes

### Alert & Warning
- **Cash Flow Negatif** (Vendor Paid > Customer Paid): badge merah di summary, bukan hanya warna teks
- **Customer Outstanding > 50% contract_value**: badge oranye
- **Sisa Hari ≤ 14**: badge kuning di header proyek
- **Overdue** (deadline terlewat): badge merah di header proyek

### Tabel Vendor SPK
- Tampilkan bobot (%) tiap vendor terhadap total SPK agar formula progress transparan
- Contoh: CV Mandiri Bangun — bobot 66.7%, progress 50% → kontribusi 33.3%

### Tab Pembayaran Customer
- Kolom `TERMIN` harus konsisten dengan tab Pembayaran Vendor: `DP`, `Termin 1`, `Termin 2`, ..., `Final`
- Jangan hanya tampilkan label "DP" — tampilkan urutan termin secara eksplisit

### Lampiran
- Tiap row di semua tab (vendor_progress, vendor_payment, customer_payment) bisa attach file
- Icon clip/paperclip di kolom AKSI jika ada lampiran, greyed out jika tidak ada

---

## Instructions for AI

- Ikuti konvensi penamaan, struktur folder, dan pola import yang sudah ada di kodebase
- Gunakan Supabase client yang sudah diinisialisasi di kodebase, jangan buat instance baru
- Untuk kalkulasi project progress, margin, dan sisa hari — lakukan di sisi server (Supabase function atau query) bukan di client
- Gunakan TypeScript types, sesuaikan dengan pola types/interfaces yang ada
- Untuk enum (`status`, `jenis_pembayaran`, `termin`), sesuaikan apakah kodebase pakai string union atau enum TypeScript
- Lampiran (`lampiran_url`) menggunakan Supabase Storage, ikuti pola upload yang sudah ada
- RBAC menggunakan Supabase RLS, ikuti pola policy yang sudah ada di project
- Kalkulasi Cash Flow Aktual, Projected Margin, dan Sisa Hari lakukan di server, bukan di client