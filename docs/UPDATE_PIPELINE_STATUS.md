# Update: Penambahan CRM Pipeline Status (User Enum)

## 📋 Overview
Update ini menambahkan kolom `status` pada tabel `clients` menggunakan tipe Enum `sales_stage` yang sudah Anda buat di Supabase.

## 🚀 Cara Menjalankan Update Database

Jalankan perintah SQL berikut di Supabase SQL Editor:

```sql
-- Pastikan tipe enum sudah ada (jika belum, uncomment baris bawah)
-- CREATE TYPE sales_stage AS ENUM ('IG_Lead', 'WA_Negotiation', 'Quotation_Sent', 'Follow_Up', 'Invoice_Deal', 'WIP', 'Finish', 'Cancelled');

-- Add status column using the custom Enum type
ALTER TABLE clients 
ADD COLUMN IF NOT EXISTS status sales_stage;

-- Create index
CREATE INDEX IF NOT EXISTS idx_clients_status ON clients(status);

-- Comment
COMMENT ON COLUMN clients.status IS 'Pipeline Stage using sales_stage Enum';
```

## ⚙️ Logika Input Otomatis
Sistem akan otomatis menentukan status awal berdasarkan sumber data:
- **Instagram Only** ➝ `IG_Lead`
- **WhatsApp Only** ➝ `WA_Negotiation` (Default awal untuk WA)
