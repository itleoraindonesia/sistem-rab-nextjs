# Update: Penambahan Kolom Produk

## 📋 Overview
Update ini menambahkan kolom `produk` pada form input CRM untuk memungkinkan pencatatan produk spesifik (seperti Pagar Beton, Panel Lantai, U-Ditch) selain kategori kebutuhan (Kebutuhan).

## 🚀 Cara Menjalankan Update Database

Jalankan perintah SQL berikut di Supabase SQL Editor:
https://supabase.com/dashboard/project/phfuwunwgzkfzettekkh/sql/new

```sql
-- Add produk column to clients table
ALTER TABLE clients 
ADD COLUMN IF NOT EXISTS produk TEXT;

-- Add index on produk for filtering
CREATE INDEX IF NOT EXISTS idx_clients_produk ON clients(produk);

-- Add comment
COMMENT ON COLUMN clients.produk IS 'Product interest (e.g., Pagar Beton, Panel Lantai, etc)';
```

## ✨ Format Input Baru

### Instagram Only (7 Kolom)
```
Username Instagram, Nama, WhatsApp, Kebutuhan, Produk, Kabupaten, Luasan
```
Contoh:
`@budisantoso, Budi Santoso, 08123456789, Rumah, Pagar Beton, Kota Depok, 200`

### WhatsApp Only (6 Kolom)
```
Nama, WhatsApp, Kebutuhan, Produk, Kabupaten, Luasan
```
Contoh:
`Budi Santoso, 08123456789, Rumah, Panel Lantai, Kota Depok, 200`

## 📄 Backward Compatibility
Sistem tetap mendeteksi format lama (tetapi kolom produk akan kosong). Disarankan menggunakan format baru.
