# CRM Client Input Module

## Overview
Sistem input data client dengan format CSV paste yang terintegrasi dengan Next.js Semi-ERP existing. Fitur ini memungkinkan CS input data client secara bulk dengan validasi real-time.

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

```bash
# File: supabase/migrations/create_clients_table.sql
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

```csv
Nama, WA, Kebutuhan, Lokasi, Luasan
Budi Santoso, 08123456789, Rumah, Depok - Jawa Barat, 200
Ani Wijaya, 628124567890, Pagar, Bandung - Jawa Barat, 50
```

**Supported Formats:**
- **Delimiter**: Comma (`,`) or Tab (`\t`)
- **WhatsApp**: `08xxx`, `628xxx`, or `+628xxx`
- **Kebutuhan**: Case-insensitive, flexible matching
- **Luasan**: Optional, numeric only

### Validation Rules

1. **Nama**: 2-100 characters
2. **WhatsApp**: Valid Indonesian phone format
3. **Kebutuhan**: Must be one of 9 valid options
4. **Lokasi**: Min 3 characters
5. **Luasan**: Optional, must be positive number

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
    { nama: 'Budi', whatsapp: '628123456789', ... },
    { nama: 'Ani', whatsapp: '628124567890', ... },
  ]);
```

### Filter by Kebutuhan

```typescript
const { data, error } = await supabase
  .from('clients')
  .select('*')
  .eq('kebutuhan', 'Rumah');
```

## Performance Considerations

- **Indexes**: Created on `lokasi`, `kebutuhan`, `created_at`, `nama`
- **No Pagination**: For MVP, showing all data (will add later)
- **Client-side Filtering**: Fast for <1000 records
- **Chart Caching**: Consider adding React Query for caching

## Security Notes

- **No RLS Yet**: All authenticated users can access (MVP)
- **Future**: Add Row Level Security policies
- **Validation**: Both client-side and database constraints
- **Sanitization**: Data trimmed and normalized before insert

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
