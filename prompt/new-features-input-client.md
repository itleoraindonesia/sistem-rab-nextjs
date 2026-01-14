# New Features: Input Data Client CRM

## Overview
Sistem input data client dengan format CSV paste yang terintegrasi dengan Next.js Semi-ERP existing. Fitur ini memungkinkan CS input data client secara bulk dengan validasi real-time.

---

## 1. Form Input Bulk (CSV Paste Style)

### UI Component
- **Large Textarea** (min-height: 300px)
- Style mirip Vercel environment variables input
- Placeholder dengan contoh format
- Auto-resize based on content

### Input Format
```
Nama, WA, Kebutuhan, Lokasi, Luasan
Budi Santoso, 08123456789, Rumah, Depok-Jawa Barat, 200
Ani Wijaya, 628124567890, Pagar, Bandung-Jawa Barat, 50
Dodi Hermawan, 08125678901, Kos/Kontrakan, Solo-Jawa Tengah, 150
Siti Rahayu, 08126789012, Toko/Ruko, Jakarta-DKI Jakarta, 80
Ahmad Fauzi, 08127890123, Gudang, Semarang-Jawa Tengah, 500
```

### Supported Delimiters
- Comma (`,`)
- Tab (`\t`) - support paste dari Excel
- Auto-detect delimiter

### Features
- Copy-paste from Excel/Google Sheets
- Preserve line breaks
- Trim whitespace otomatis
- Case-insensitive untuk kategori

---

## 2. Real-time Preview & Validasi

### Preview Table
Muncul otomatis dibawah textarea ketika user mulai input/paste

```
┌─────────────────────────────────────────────────────────────┐
│  PREVIEW DATA (3 rows parsed)                               │
├────┬──────────────┬─────────────┬───────────┬──────────┬────┤
│ #  │ Nama         │ WA          │ Kebutuhan │ Lokasi   │ m² │
├────┼──────────────┼─────────────┼───────────┼──────────┼────┤
│ ✅ 1│ Budi Santoso │ 08123456789 │ Bangunan  │ Depok    │200 │
│ ✅ 2│ Ani Wijaya   │ 628124567.. │ Pagar     │ Bandung  │ 50 │
│ ❌ 3│ Dodi         │ SALAH       │ Bangunan  │ Solo     │ -  │
│     │              │ ⚠️ Invalid  │           │          │⚠️  │
└────┴──────────────┴─────────────┴───────────┴──────────┴────┘

❌ 1 row has errors. Please fix before saving.
✅ 2 rows valid
```

### Validation Rules

#### 1. Nama
- **Required**: Yes
- **Min Length**: 2 characters
- **Max Length**: 100 characters
- **Error Message**: "Nama harus minimal 2 karakter"

#### 2. WhatsApp
- **Required**: Yes
- **Format**: 
  - `08XXXXXXXXXX` (10-13 digits)
  - `628XXXXXXXXX` (11-14 digits)
  - `+628XXXXXXXXX` (12-15 digits)
- **Validation**: Numeric only after prefix
- **Auto-format**: Normalize to `628...` format
- **Error Message**: "Format WA tidak valid. Contoh: 08123456789"

#### 3. Kebutuhan Pembangunan
- **Required**: Yes
- **Options**: 
  - `Pagar`
  - `Gudang`
  - `Kos/Kontrakan`
  - `Toko/Ruko`
  - `Rumah`
  - `Villa`
  - `Hotel`
  - `Rumah Sakit`
  - `Panel Saja`
- **Case Insensitive**: `rumah` = `RUMAH` = `Rumah`
- **Flexible Match**: `kos`, `kontrakan`, `kos kontrakan` → `Kos/Kontrakan`
- **Error Message**: "Kebutuhan tidak valid. Pilihan: Pagar, Gudang, Kos/Kontrakan, Toko/Ruko, Rumah, Villa, Hotel, Rumah Sakit, Panel Saja"

#### 4. Lokasi (Kab - Prov)
- **Required**: Yes
- **Format**: `Kabupaten/Kota - Provinsi`
- **Examples**: 
  - `Depok - Jawa Barat`
  - `Bandung - Jawa Barat`
  - `Solo - Jawa Tengah`
- **Validation**: 
  - Min 3 characters
  - Contains hyphen/dash (optional warning)
- **Warning Message**: "Format lokasi sebaiknya: Kota - Provinsi"

#### 5. Luasan/Ukuran
- **Required**: No (optional)
- **Format**: Number (integer or decimal)
- **Unit**: 
  - m² (meter persegi) untuk: Gudang, Kos/Kontrakan, Toko/Ruko, Rumah, Villa, Hotel, Rumah Sakit
  - m (meter) untuk: Pagar (keliling)
  - unit untuk: Panel Saja
- **Validation**: 
  - Must be numeric if provided
  - Must be > 0
- **Error Message**: "Luasan harus berupa angka positif"

### Visual Indicators
- ✅ **Green Row**: All validations passed
- ❌ **Red Row**: Has validation errors
- ⚠️ **Yellow Cell**: Warning (data ok tapi ada saran)
- 🔴 **Red Cell**: Error pada field tersebut

### Error Tooltip
Hover pada cell error menampilkan detail error message

---

## 3. Save ke Database

### Database Schema

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
  updated_at TIMESTAMP DEFAULT NOW(),
  created_by INT REFERENCES users(id) -- Track siapa yang input
);

-- Index untuk performa
CREATE INDEX idx_clients_lokasi ON clients(lokasi);
CREATE INDEX idx_clients_kebutuhan ON clients(kebutuhan);
CREATE INDEX idx_clients_created_at ON clients(created_at);
```

### Save Options

#### Option 1: Save Valid Only (Default)
```
[Save Valid Data Only] ← Default action
```
- Skip rows dengan error
- Save hanya data yang valid
- Show summary: "2 data saved, 1 skipped"

#### Option 2: Save All (Force)
```
[Force Save All]
```
- Save semua termasuk yang error
- Mark error rows dengan flag `has_error: true`
- Admin bisa review & fix nanti

#### Option 3: Fix & Retry
```
[Fix Errors First]
```
- Highlight error rows
- Allow inline editing
- Re-validate

### Bulk Insert API

```typescript
// POST /api/crm/clients/bulk
{
  "clients": [
    {
      "nama": "Budi Santoso",
      "whatsapp": "628123456789",
      "kebutuhan": "Bangunan",
      "lokasi": "Depok - Jawa Barat",
      "luasan": 200
    },
    // ... more
  ],
  "options": {
    "skipErrors": true, // or false
    "validate": true
  }
}

// Response
{
  "success": true,
  "inserted": 2,
  "skipped": 1,
  "errors": [
    {
      "row": 3,
      "field": "whatsapp",
      "message": "Format WA tidak valid"
    }
  ]
}
```

### Success Notification
```
✅ Data berhasil disimpan!
   • 2 client baru ditambahkan
   • 1 data di-skip (ada error)
   
[View Data] [Input Lagi] [Close]
```

---

## 4. Tabel Data dengan Filter

### Features

#### Search & Filter
```
┌─────────────────────────────────────────┐
│ 🔍 Search: [_________________]         │
│                                         │
│ Filter:                                 │
│ Kebutuhan: [All ▼]                     │
│   • Pagar                               │
│   • Gudang                              │
│   • Kos/Kontrakan                       │
│   • Toko/Ruko                           │
│   • Rumah                               │
│   • Villa                               │
│   • Hotel                               │
│   • Rumah Sakit                         │
│   • Panel Saja                          │
│                                         │
│ Lokasi: [All Provinsi ▼]              │
│ Tanggal: [Last 7 days ▼]              │
│                                         │
│ [Reset Filter]                          │
└─────────────────────────────────────────┘
```

#### Data Table
```
┌────┬──────────────┬─────────────┬──────────────┬──────────┬─────┬────────────┐
│ #  │ Nama         │ WA          │ Kebutuhan    │ Lokasi   │ m²  │ Tanggal    │
├────┼──────────────┼─────────────┼──────────────┼──────────┼─────┼────────────┤
│ 1  │ Budi Santoso │ 0812345... │ Rumah        │ Depok    │ 200 │ 2024-01-10 │
│ 2  │ Ani Wijaya   │ 0812456... │ Pagar        │ Bandung  │ 50  │ 2024-01-10 │
│ 3  │ Dodi Herman  │ 0812567... │ Kos/Kontrakan│ Solo     │ 150 │ 2024-01-09 │
│ 4  │ Siti Rahayu  │ 0812678... │ Toko/Ruko    │ Jakarta  │ 80  │ 2024-01-09 │
│ 5  │ Ahmad Fauzi  │ 0812789... │ Gudang       │ Semarang │ 500 │ 2024-01-08 │
└────┴──────────────┴─────────────┴──────────────┴──────────┴─────┴────────────┘

Showing 1-10 of 234 clients
[< Prev] [1] [2] [3] ... [24] [Next >]
```

#### Actions
- **View Detail**: Click row → modal detail
- **Edit**: Inline edit atau modal
- **Delete**: Soft delete (mark as deleted)
- **Bulk Actions**: Select multiple → Export/Delete

#### Sort
- Click column header to sort
- Ascending/Descending toggle
- Default: Sort by created_at DESC (newest first)

---

## 5. Chart Statistik Basic

### Dashboard Layout

```
┌─────────────────────────────────────────────────────────────┐
│  DASHBOARD CRM                                  [Export PDF]│
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  📊 STATISTIK CLIENTS                                        │
│                                                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ Total Clients│  │ This Month   │  │ This Week    │      │
│  │     234      │  │      45      │  │      12      │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│                                                               │
├─────────────────────────────────────────────────────────────┤
│  📍 BY PROVINSI                                              │
│  ┌─────────────────────────────────────┐                    │
│  │         Bar Chart                    │                    │
│  │  Jawa Barat     ████████████ 45%    │                    │
│  │  Jawa Tengah    ███████ 30%         │                    │
│  │  Jawa Timur     ████ 15%            │                    │
│  │  DKI Jakarta    ██ 10%              │                    │
│  └─────────────────────────────────────┘                    │
│                                                               │
├─────────────────────────────────────────────────────────────┤
│  📦 BY KEBUTUHAN                                             │
│  ┌─────────────────────────────────────┐                    │
│  │         Bar Chart                    │                    │
│  │  Rumah          ████████████ 35%    │                    │
│  │  Gudang         ████████ 20%        │                    │
│  │  Pagar          ██████ 15%          │                    │
│  │  Kos/Kontrakan  ████ 10%            │                    │
│  │  Toko/Ruko      ███ 8%              │                    │
│  │  Villa          ██ 5%               │                    │
│  │  Hotel          ██ 4%               │                    │
│  │  Rumah Sakit    █ 2%                │                    │
│  │  Panel Saja     █ 1%                │                    │
│  └─────────────────────────────────────┘                    │
│                                                               │
├─────────────────────────────────────────────────────────────┤
│  📈 LEADS PER BULAN                                          │
│  ┌─────────────────────────────────────┐                    │
│  │         Line Chart                   │                    │
│  │    |                            •    │                    │
│  │  50|                        •        │                    │
│  │    |                    •            │                    │
│  │  25|              •                  │                    │
│  │    |        •                        │                    │
│  │   0|___________________________      │                    │
│  │     Sep  Oct  Nov  Dec  Jan         │                    │
│  └─────────────────────────────────────┘                    │
│                                                               │
└─────────────────────────────────────────────────────────────┘

[Export Excel] [Export PDF] [Refresh]
```

### Chart Specifications

#### 1. Bar Chart - By Provinsi
- **Library**: Recharts (already available)
- **Data Source**: 
  ```sql
  SELECT 
    SPLIT_PART(lokasi, '-', 2) as provinsi,
    COUNT(*) as total
  FROM clients
  GROUP BY provinsi
  ORDER BY total DESC
  LIMIT 10
  ```
- **X-axis**: Provinsi name
- **Y-axis**: Total clients
- **Color**: Single color (#3b82f6)
- **Interactive**: Hover to show exact count

#### 2. Bar Chart - By Kebutuhan
- **Library**: Recharts
- **Data Source**:
  ```sql
  SELECT 
    kebutuhan,
    COUNT(*) as total,
    ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER(), 1) as percentage
  FROM clients
  GROUP BY kebutuhan
  ORDER BY total DESC
  ```
- **X-axis**: Kebutuhan name
- **Y-axis**: Total clients
- **Colors**: Gradient or distinct colors per category
- **Interactive**: Hover to show exact count & percentage
- **Horizontal Layout**: Better for many categories

#### 3. Line Chart - Leads Per Bulan
- **Library**: Recharts
- **Data Source**:
  ```sql
  SELECT 
    DATE_TRUNC('month', created_at) as bulan,
    COUNT(*) as total
  FROM clients
  WHERE created_at >= NOW() - INTERVAL '6 months'
  GROUP BY bulan
  ORDER BY bulan
  ```
- **X-axis**: Month name (Jan, Feb, Mar...)
- **Y-axis**: Total leads
- **Color**: #3b82f6
- **Smooth**: Curved line
- **Dots**: Show data points

### Export Features

#### Export Excel
- Library: SheetJS (xlsx)
- Include: All filtered data
- Columns: All fields + created_at
- Filename: `clients-export-YYYY-MM-DD.xlsx`

#### Export PDF
- Library: jsPDF or similar
- Include: 
  - Summary stats
  - All charts as images
  - Filtered data table
- Filename: `crm-report-YYYY-MM-DD.pdf`

---

## Technical Implementation

### File Structure
```
app/
├── crm/
│   ├── input/
│   │   └── page.tsx              # Bulk input form
│   ├── dashboard/
│   │   └── page.tsx              # Dashboard with charts
│   └── clients/
│       ├── page.tsx              # Data table
│       └── [id]/page.tsx         # Detail client

components/
├── crm/
│   ├── BulkInputForm.tsx         # CSV paste textarea
│   ├── PreviewTable.tsx          # Validation preview
│   ├── ClientsTable.tsx          # Data table with filter
│   ├── ChartProvinsi.tsx         # Bar chart
│   ├── ChartKebutuhan.tsx        # Pie chart
│   └── ChartLeadsTrend.tsx       # Line chart

api/
└── crm/
    ├── clients/
    │   ├── route.ts              # GET, POST (single)
    │   └── bulk/route.ts         # POST (bulk insert)
    └── stats/
        └── route.ts              # GET stats for charts

lib/
└── crm/
    ├── validators.ts             # Validation functions
    ├── parsers.ts                # CSV parser
    └── formatters.ts             # Data formatters
```

### Key Functions

#### CSV Parser
```typescript
// lib/crm/parsers.ts
export function parseCSV(text: string) {
  const lines = text.trim().split('\n');
  const delimiter = detectDelimiter(lines[0]);
  
  return lines.map((line, index) => {
    const [nama, wa, kebutuhan, lokasi, luasan] = 
      line.split(delimiter).map(s => s.trim());
    
    return {
      row: index + 1,
      nama,
      whatsapp: normalizeWhatsApp(wa),
      kebutuhan: normalizeKebutuhan(kebutuhan),
      lokasi,
      luasan: luasan ? parseFloat(luasan) : null,
      errors: validate({ nama, wa, kebutuhan, lokasi, luasan })
    };
  });
}
```

#### Validators
```typescript
// lib/crm/validators.ts
export function validateClient(data) {
  const errors = [];
  
  const validKebutuhan = [
    'Pagar', 'Gudang', 'Kos/Kontrakan', 'Toko/Ruko',
    'Rumah', 'Villa', 'Hotel', 'Rumah Sakit', 'Panel Saja'
  ];
  
  if (!data.nama || data.nama.length < 2) {
    errors.push({ field: 'nama', message: 'Minimal 2 karakter' });
  }
  
  if (!isValidWhatsApp(data.whatsapp)) {
    errors.push({ field: 'whatsapp', message: 'Format WA tidak valid' });
  }
  
  if (!validKebutuhan.includes(data.kebutuhan)) {
    errors.push({ 
      field: 'kebutuhan', 
      message: `Harus salah satu: ${validKebutuhan.join(', ')}` 
    });
  }
  
  if (data.luasan && (isNaN(data.luasan) || data.luasan <= 0)) {
    errors.push({ field: 'luasan', message: 'Harus angka positif' });
  }
  
  return errors;
}
```

---

## User Flow

### Scenario 1: Bulk Input dari CS
1. CS dapat data dari chat WhatsApp/Instagram
2. Copy data ke Excel, format sesuai template
3. Paste ke form input bulk
4. Preview muncul real-time
5. Cek validasi (merah/hijau)
6. Fix error jika ada
7. Klik "Save Valid Data"
8. Success notification
9. Redirect ke dashboard/table

### Scenario 2: Review & Filter Data
1. Admin buka halaman Clients
2. Lihat tabel semua data
3. Filter by Provinsi: "Jawa Barat"
4. Search: "Budi"
5. Klik row untuk detail
6. Edit jika perlu
7. Export ke Excel untuk laporan

### Scenario 3: Lihat Statistik
1. Buka Dashboard CRM
2. Lihat summary cards (total, this month, this week)
3. Analisa chart by provinsi (mana yang paling banyak)
4. Cek trend leads per bulan (naik/turun)
5. Export PDF untuk presentasi

---

## Notes & Considerations

### Performance
- Use pagination for table (50 rows per page)
- Lazy load charts
- Debounce search input (300ms)
- Cache chart data (5 minutes)

### Security
- Validate input on both client & server
- Sanitize data before DB insert
- Rate limit bulk insert API
- Only authenticated users can access

### UX Improvements
- Auto-save draft di localStorage
- Keyboard shortcuts (Ctrl+S to save)
- Undo/Redo untuk editing
- Bulk edit mode

### Future Enhancements
- AI auto-categorize from chat text
- WhatsApp API integration
- Auto-assign to sales team
- Lead scoring
- Email notification

---

## Success Metrics
- Time to input 10 clients: < 2 minutes
- Data accuracy: > 95%
- Error rate: < 5%
- User satisfaction: > 4/5

---

## Deployment Checklist
- [ ] Database migration ready
- [ ] API endpoints tested
- [ ] Validation rules confirmed
- [ ] Charts rendering correctly
- [ ] Export functions working
- [ ] Mobile responsive
- [ ] Error handling complete
- [ ] Loading states implemented
- [ ] User documentation ready
- [ ] Demo data seeded

---

*Document created for AI context and development reference*