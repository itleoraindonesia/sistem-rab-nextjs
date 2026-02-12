# CRM Client Input Module

## Overview
Sistem input data client dengan format CSV paste yang terintegrasi dengan Next.js Semi-ERP existing. Fitur ini memungkinkan CS input data client secara bulk dengan validasi real-time dan tracking source (Instagram/WhatsApp).

## Features

### ✅ Implemented (MVP)
1. **Bulk Input Form** (`/crm/input`)
   - Large textarea untuk CSV paste (Vercel-style)
   - Support delimiter: comma (`,`) dan tab (`\t`)
   - Auto-detect delimiter
   - Real-time preview table
   - Validasi 5 field: nama, WA, kebutuhan, lokasi, luasan
   - Visual indicators (✅❌⚠️)
   - Save valid data ke Supabase
   - **NEW**: Tracking source selection (Instagram Only / WhatsApp Only)
   - **NEW**: Auto-detect format berdasarkan jumlah kolom
   - **NEW**: Duplicate WhatsApp handling (update existing data)

2. **Clients Table** (`/crm/clients`)
   - List semua clients
   - Filter by: kebutuhan, provinsi, tanggal
   - Search by: nama, WA, lokasi
   - Sort by: nama, created_at
   - Click row untuk detail (future)

3. **Dashboard** (`/crm`)
   - Summary cards: total, this month, this week
   - Bar chart by provinsi (top 10)
   - Bar chart by kebutuhan
   - Line chart leads trend (6 bulan terakhir)

### 🚧 Future Enhancements (Phase 2)
- Export Excel/PDF
- Pagination
- Role-based access (RLS)
- Integrasi dengan RAB system
- Client detail page
- Edit/delete client
- Bulk actions

## Database Schema

```sql
CREATE TABLE clients (
  id SERIAL PRIMARY KEY,
  nama VARCHAR(100) NOT NULL,
  whatsapp VARCHAR(20) NOT NULL,
  kebutuhan VARCHAR(50) NOT NULL CHECK (kebutuhan IN (
    'Pagar', 'Gudang', 'Kos/Kontrakan', 'Toko/Ruko', 
    'Rumah', 'Villa', 'Hotel', 'Rumah Sakit', 'Panel Saja'
  )),
  lokasi VARCHAR(200) NOT NULL,
  luasan DECIMAL(10,2),
  produk TEXT,                                    -- NEW: Product interest
  tracking_source TEXT CHECK (tracking_source IN ('instagram_only', 'whatsapp_only')), -- NEW
  instagram_username TEXT,                        -- NEW: Username Instagram
  status sales_stage,                             -- NEW: Pipeline status
  created_by uuid REFERENCES auth.users(id),      -- NEW: Audit logs
  updated_by uuid REFERENCES auth.users(id),      -- NEW: Audit logs
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

## File Structure

```
src/
├── app/(protected)/crm/
│   ├── page.tsx                    # Dashboard
│   ├── input/page.tsx              # Bulk input form
│   └── clients/page.tsx            # Clients list
│
├── components/crm/
│   ├── BulkInputForm.tsx           # CSV paste textarea + preview
│   ├── ClientsTable.tsx            # Table with filter/search
│   └── CRMDashboard.tsx            # Charts & stats
│
└── lib/crm/
    ├── validators.ts               # Validation functions
    ├── parsers.ts                  # CSV parser
    └── formatters.ts               # Display formatters
```

## Setup Instructions

### 1. Run Database Migration

Execute the SQL migration in Supabase SQL Editor:

```sql
-- Add produk column
ALTER TABLE clients ADD COLUMN IF NOT EXISTS produk TEXT;

-- Add tracking source columns
ALTER TABLE clients 
ADD COLUMN IF NOT EXISTS tracking_source TEXT CHECK (tracking_source IN ('instagram_only', 'whatsapp_only')),
ADD COLUMN IF NOT EXISTS instagram_username TEXT;

-- Add pipeline status
ALTER TABLE clients ADD COLUMN IF NOT EXISTS status sales_stage;

-- Add audit logs
ALTER TABLE clients 
ADD COLUMN IF NOT EXISTS created_by uuid REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS updated_by uuid REFERENCES auth.users(id);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_clients_tracking_source ON clients(tracking_source);
CREATE INDEX IF NOT EXISTS idx_clients_instagram_username ON clients(instagram_username);
CREATE INDEX IF NOT EXISTS idx_clients_status ON clients(status);
CREATE INDEX IF NOT EXISTS idx_clients_created_by ON clients(created_by);
```

Or run via Supabase CLI:

```bash
supabase db push
```

### 2. Install Dependencies

```bash
npm install recharts
```

### 3. Access the Module

- Dashboard: `/crm`
- Input Data: `/crm/input`
- Clients List: `/crm/clients`

## Usage Guide

### Bulk Input CSV Format

#### Instagram Only (7 Kolom)
```csv
Username Instagram, Nama, WhatsApp, Kebutuhan, Produk, Kabupaten, Luasan
@budisantoso, Budi Santoso, 08123456789, Rumah, Pagar Beton, Kota Depok, 200
```

#### WhatsApp Only (6 Kolom)
```csv
Nama, WhatsApp, Kebutuhan, Produk, Kabupaten, Luasan
Budi Santoso, 08123456789, Rumah, Panel Lantai, Kota Depok, 200
```

**Supported Formats:**
- **Delimiter**: Comma (`,`) or Tab (`\t`)
- **WhatsApp**: `08xxx`, `628xxx`, or `+628xxx`
- **Kebutuhan**: Case-insensitive, flexible matching
- **Luasan**: Optional, numeric only
- **Produk**: Optional, free text (e.g., "Pagar Beton", "Panel Lantai")

### Validation Rules

#### Instagram Source
- ✅ Username Instagram wajib diisi
- ✅ Nama wajib diisi
- ✅ WhatsApp wajib diisi dan valid
- ✅ Kebutuhan wajib diisi
- ✅ Kabupaten wajib diisi dan valid
- ⚪ Luasan opsional
- ⚪ Produk opsional

#### WhatsApp Source
- ✅ Nama wajib diisi
- ✅ WhatsApp wajib diisi dan valid
- ✅ Kebutuhan wajib diisi
- ✅ Kabupaten wajib diisi dan valid
- ⚪ Luasan opsional
- ⚪ Produk opsional

### Valid Kebutuhan Options

- Pagar
- Gudang
- Kos/Kontrakan
- Toko/Ruko
- Rumah
- Villa
- Hotel
- Rumah Sakit
- Panel Saja

### Pipeline Status Logic

- **Instagram Only** ➝ `IG_Lead`
- **WhatsApp Only** ➝ `WA_Negotiation` (Default awal untuk WA)

## API Usage (Supabase Client)

### Fetch All Clients

```typescript
const { data, error } = await supabase
  .from('clients')
  .select('*')
  .order('created_at', { ascending: false });
```

### Insert Bulk Clients

```typescript
const { data, error } = await supabase
  .from('clients')
  .insert([
    { 
      nama: 'Budi', 
      whatsapp: '628123456789', 
      tracking_source: 'instagram_only',
      instagram_username: '@budisantoso',
      produk: 'Pagar Beton',
      status: 'IG_Lead'
    },
    { 
      nama: 'Ani', 
      whatsapp: '628124567890',
      tracking_source: 'whatsapp_only',
      produk: 'Panel Lantai',
      status: 'WA_Negotiation'
    },
  ]);
```

### Filter by Kebutuhan

```typescript
const { data, error } = await supabase
  .from('clients')
  .select('*')
  .eq('kebutuhan', 'Rumah');
```

### Filter by Tracking Source

```typescript
const { data, error } = await supabase
  .from('clients')
  .select('*')
  .eq('tracking_source', 'instagram_only');
```

### Filter by Pipeline Status

```typescript
const { data, error } = await supabase
  .from('clients')
  .select('*')
  .eq('status', 'IG_Lead');
```

## Performance Considerations

- **Indexes**: Created on `lokasi`, `kebutuhan`, `created_at`, `nama`, `tracking_source`, `status`
- **No Pagination**: For MVP, showing all data (will add later)
- **Client-side Filtering**: Fast for <1000 records
- **Chart Caching**: Consider adding React Query for caching

## Security Notes

- **No RLS Yet**: All authenticated users can access (MVP)
- **Future**: Add Row Level Security policies
- **Validation**: Both client-side and database constraints
- **Sanitization**: Data trimmed and normalized before insert
- **Audit Logs**: Track created_by and updated_by for compliance

## Troubleshooting

### Charts not showing?
- Make sure `recharts` is installed
- Check browser console for errors
- Verify data exists in database

### CSV parsing issues?
- Check delimiter (comma vs tab)
- Remove extra spaces
- Ensure header row is present or absent consistently

### WhatsApp format errors?
- Use format: `08123456789` or `628123456789`
- Remove spaces, dashes, parentheses
- Auto-normalization will convert to `628xxx` format

### Tracking source validation errors?
- Pastikan memilih sumber data (Instagram Only atau WhatsApp Only)
- Untuk Instagram source, pastikan kolom username tidak kosong

### Duplicate handling not working?
- Pastikan nomor WA sama persis (sistem auto-normalize 08xxx → 628xxx)
- Data existing harus memiliki tracking_source = 'whatsapp_only'
- Data baru harus memiliki tracking_source = 'instagram_only'

## Development

### Run Development Server

```bash
npm run dev
```

### Run Tests

```bash
npm test
```

### Build for Production

```bash
npm run build
```

## Credits

Created for Sistem RAB Next.js by AI Assistant
Date: 2026-01-13
