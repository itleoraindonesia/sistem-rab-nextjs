# Update: Penambahan Audit Logs (Created By & Updated By)

## 📋 Overview
Update ini menambahkan kolom `created_by` dan `updated_by` pada tabel `clients`. Kolom ini berguna untuk melacak siapa user yang membuat atau mengubah data client.

## 🚀 Cara Menjalankan Update Database

Jalankan perintah SQL berikut di Supabase SQL Editor:
https://supabase.com/dashboard/project/phfuwunwgzkfzettekkh/sql/new

```sql
-- Add audit columns to clients table
ALTER TABLE clients 
ADD COLUMN IF NOT EXISTS created_by uuid REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS updated_by uuid REFERENCES auth.users(id);

-- Add comments
COMMENT ON COLUMN clients.created_by IS 'User ID who created the record';
COMMENT ON COLUMN clients.updated_by IS 'User ID who last updated the record';

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_clients_created_by ON clients(created_by);
```

## ℹ️ Catatan
- Kolom ini bersifat **NULLABLE** (boleh kosong) agar data lama tetap aman.
- Data lama akan memiliki `created_by` = `NULL`.
- Mulai sekarang, setiap input baru via CRM Input akan otomatis mengisi `created_by` dan `updated_by` dengan ID user yang sedang login.
- Update data (duplicate handling) akan mengupdate `updated_by`.
