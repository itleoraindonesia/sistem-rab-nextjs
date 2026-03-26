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

### Validasi Rules
- `progress_percent` antara 0–100
- Total `vendor_payment.jumlah` per vendor tidak boleh melebihi `vendor_spk.nilai_spk`
- Total `customer_payment.jumlah` per project tidak boleh melebihi `projects.contract_value`
- `vendor_spk.status` hanya: `active` | `completed`
- `vendor_payment.jenis_pembayaran` hanya: `dp` | `term` | `pelunasan`
- `customer_payment.termin` hanya: `dp` | `term` | `final`

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

---

## Instructions for AI

- Ikuti konvensi penamaan, struktur folder, dan pola import yang sudah ada di kodebase
- Gunakan Supabase client yang sudah diinisialisasi di kodebase, jangan buat instance baru
- Untuk kalkulasi project progress, lakukan di sisi server (Supabase function atau query) bukan di client
- Gunakan TypeScript types, sesuaikan dengan pola types/interfaces yang ada
- Untuk enum (`status`, `jenis_pembayaran`, `termin`), sesuaikan apakah kodebase pakai string union atau enum TypeScript
- Lampiran (`lampiran_url`) menggunakan Supabase Storage, ikuti pola upload yang sudah ada
- RBAC menggunakan Supabase RLS, ikuti pola policy yang sudah ada di project
