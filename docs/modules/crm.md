# CRM Module

## Overview
Modul Customer Relationship Management untuk mengelola pipeline penjualan dengan tracking source (Instagram/WhatsApp). Sistem mendukung bulk input CSV dengan auto-detect format dan duplicate WhatsApp handling.

## Features

### Core Features
1. **Bulk Input Form** - CSV paste dengan real-time validation
2. **Clients Table** - Filter dan search clients
3. **Dashboard** - Statistics dan pipeline analytics
4. **Tracking Source** - Instagram vs WhatsApp lead tracking
5. **Auto-detect CSV Format** - Smart format detection
6. **Duplicate Handling** - WhatsApp number deduplication

### Pipeline Stages
```
IG_Lead → WA_Negotiation → Quotation_Sent → Follow_Up → Invoice_Deal → WIP → Finish
```

## Database Schema

### Clients Table
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
  produk TEXT,                                    -- Product interest
  tracking_source TEXT CHECK (tracking_source IN ('instagram_only', 'whatsapp_only')),
  instagram_username TEXT,                        -- IG username if applicable
  status sales_stage,                             -- Pipeline status
  created_by UUID REFERENCES auth.users(id),      -- Audit logs
  updated_by UUID REFERENCES auth.users(id),      -- Audit logs
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Indexes
```sql
CREATE INDEX idx_clients_tracking_source ON clients(tracking_source);
CREATE INDEX idx_clients_instagram_username ON clients(instagram_username);
CREATE INDEX idx_clients_status ON clients(status);
CREATE INDEX idx_clients_created_by ON clients(created_by);
```

## CSV Input Format

### Instagram Source (7 columns)
```
Username Instagram, Nama, WhatsApp, Kebutuhan, Produk, Kabupaten, Luasan
@budisantoso, Budi Santoso, 08123456789, Rumah, Pagar Beton, Kota Depok, 200
```

### WhatsApp Source (6 columns)
```
Nama, WhatsApp, Kebutuhan, Produk, Kabupaten, Luasan
Budi Santoso, 08123456789, Rumah, Panel Lantai, Kota Depok, 200
```

**Features:**
- Auto-detect format berdasarkan jumlah kolom
- Flexible delimiter (comma/tab)
- Header row auto-skip
- Real-time validation dengan visual indicators
- Kabupaten suggestions dengan fuzzy matching

## Duplicate WhatsApp Handling

### Scenario
Ketika input Instagram memiliki nomor WA yang sudah ada di database:

**Existing Record (WhatsApp only):**
- `nama`: "Budi Santoso"
- `whatsapp`: "628123456789"
- `tracking_source`: "whatsapp_only"

**New Instagram Input:**
- `instagram_username`: "@budisantoso"
- `nama`: "Budi Santoso"
- `whatsapp`: "08123456789" (sama setelah normalize)
- `tracking_source`: "instagram_only"

**Result:**
- Record existing di-UPDATE (bukan create baru)
- `tracking_source` berubah ke "instagram_only"
- `instagram_username` ditambahkan
- Data lain (produk, kebutuhan, dll) diupdate sesuai input baru

## Validation Rules

### Instagram Source
- ✅ Username Instagram wajib diisi
- ✅ Nama wajib diisi
- ✅ WhatsApp wajib diisi dan valid
- ✅ Kebutuhan wajib diisi
- ✅ Kabupaten wajib diisi dan valid
- ⚪ Luasan opsional
- ⚪ Produk opsional

### WhatsApp Source
- ✅ Nama wajib diisi
- ✅ WhatsApp wajib diisi dan valid
- ✅ Kebutuhan wajib diisi
- ✅ Kabupaten wajib diisi dan valid
- ⚪ Luasan opsional
- ⚪ Produk opsional

### Kebutuhan Options
- Pagar, Gudang, Kos/Kontrakan, Toko/Ruko
- Rumah, Villa, Hotel, Rumah Sakit, Panel Saja

## UI Components

### BulkInputForm (`/crm/input`)
- **Source Selector**: Checkbox buttons (Instagram Only / WhatsApp Only)
- **CSV Textarea**: Large input dengan placeholder sesuai source
- **Preview Table**: Real-time parsing dengan validation indicators
- **Progress Tracking**: Upload progress dan success/error counts
- **Error Display**: Detailed validation errors per row

### ClientsTable (`/crm/clients`)
- **Filters**: Kebutuhan, provinsi, tanggal range
- **Search**: Nama, WhatsApp, lokasi
- **Sort**: Nama, created_at
- **Export**: Excel/PDF (future)
- **Pagination**: Client-side untuk MVP

### CRMDashboard (`/crm`)
- **Summary Cards**: Total clients, this month, this week
- **Charts**: 
  - Bar chart by provinsi (top 10)
  - Bar chart by kebutuhan
  - Line chart leads trend (6 bulan)
- **Quick Actions**: Link ke bulk input dan clients table

## Query Optimization

### Caching Strategy
```typescript
// Dashboard stats - Aggressive refresh
useQuery({
  queryKey: ['crm-stats'],
  staleTime: 45 * 1000,           // 45 seconds
  refetchInterval: 3 * 60 * 1000, // Auto-refresh every 3 min
  refetchIntervalInBackground: false,
})

// Client list - Fast updates
useQuery({
  queryKey: ['clients', page, search, filter],
  staleTime: 45 * 1000,           // 45 seconds
  refetchOnWindowFocus: true,
  refetchOnReconnect: true,
})
```

### Connection Status
- Real-time online/offline detection
- Database health check setiap 5 menit
- Visual status indicator di bottom-right
- Auto-dismiss notifications

## API Usage

### Fetch Clients
```typescript
const { data, error } = await supabase
  .from('clients')
  .select('*')
  .order('created_at', { ascending: false });
```

### Bulk Insert with Duplicate Handling
```typescript
// System handles duplicate WhatsApp automatically
const { data, error } = await supabase
  .from('clients')
  .upsert(clientsData, {
    onConflict: 'whatsapp',
    ignoreDuplicates: false
  });
```

### Filter by Tracking Source
```typescript
const { data, error } = await supabase
  .from('clients')
  .select('*')
  .eq('tracking_source', 'instagram_only');
```

## Reporting & Analytics

### Lead Source Analysis
- **Conversion Rate**: Instagram vs WhatsApp
- **Geographic Distribution**: Leads by province
- **Product Interest**: Most requested products
- **Pipeline Velocity**: Time to move through stages

### Performance Metrics
- **Input Efficiency**: Records processed per minute
- **Data Quality**: Validation error rates
- **Duplicate Rate**: WhatsApp number conflicts
- **User Adoption**: Active users vs total users

## File Structure

```
src/
├── app/(protected)/crm/
│   ├── page.tsx                    # Dashboard
│   ├── input/page.tsx              # Bulk input form
│   └── clients/page.tsx            # Clients table
├── components/crm/
│   ├── BulkInputForm.tsx           # CSV input + preview
│   ├── ClientsTable.tsx            # Table with filters
│   ├── CRMDashboard.tsx            # Charts & stats
│   └── ConnectionStatus.tsx        # Network status indicator
└── lib/crm/
    ├── parsers.ts                  # CSV parsing logic
    ├── validators.ts               # Validation functions
    └── formatters.ts               # Display formatters
```

## Security Considerations

### Data Access
- **Authenticated Only**: All CRM data requires login
- **No RLS**: Current implementation uses auth-only policies
- **Future**: Add role-based access (sales team, managers)

### Data Privacy
- **WhatsApp Numbers**: Sanitized storage (remove spaces/dashes)
- **Instagram Usernames**: Public data, no privacy concerns
- **Audit Trail**: created_by/updated_by tracking

### Input Validation
- **Server-side**: Database constraints dan triggers
- **Client-side**: Zod schemas dan real-time validation
- **Sanitization**: Input trimming dan normalization

## Future Enhancements

### Phase 2 Features
- **Pipeline Management**: Drag-drop stage changes
- **Email Integration**: Automated follow-up emails
- **WhatsApp API**: Direct messaging integration
- **Advanced Filtering**: Saved filter presets
- **Bulk Actions**: Mass update/delete operations
- **Export Features**: Excel/PDF reports
- **Real-time Updates**: Live pipeline changes

### Integration Points
- **Project Tracking**: Convert leads to projects
- **Document Workflow**: Generate quotations automatically
- **Calendar**: Meeting scheduling
- **Notifications**: Lead assignment alerts

## Troubleshooting

### CSV Parsing Issues
- **Delimiter Detection**: Ensure consistent comma/tab usage
- **Encoding**: Use UTF-8 encoding
- **Line Breaks**: Handle CRLF/LF properly
- **Quotes**: Support quoted fields with commas

### Duplicate Handling Problems
- **Normalization**: WhatsApp format standardization (08xxx → 628xxx)
- **Case Sensitivity**: Instagram usernames are case-sensitive
- **Timing**: Concurrent updates may cause conflicts

### Performance Issues
- **Large CSV**: Process in chunks of 100 rows
- **Memory Usage**: Clear temp data after processing
- **Network Timeout**: Increase timeout for large uploads

---

*Last Updated: 2026-04-04*
*Status: Production Ready*