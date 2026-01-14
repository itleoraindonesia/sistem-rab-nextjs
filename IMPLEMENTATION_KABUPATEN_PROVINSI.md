# Implementation Summary: Kabupaten & Provinsi Auto-lookup

## Changes Made

### 1. Database Schema
- **Renamed** `lokasi` → `kabupaten` in `clients` table
- **Added** `provinsi` column to `clients` table
- Updated schema documentation in `prompt/database-schema.md`

### 2. Input Format
**Old Format (6 fields):**
```
Nama, WA, Kebutuhan, Kabupaten, Provinsi, Luasan
```

**New Format (5 fields):**
```
Nama, WA, Kebutuhan, Kabupaten, Luasan
```

**Key Feature:** Provinsi is now **auto-filled** by looking up the kabupaten in `master_ongkir` table.

### 3. Code Changes

#### `src/lib/crm/parsers.ts`
- Updated `ParsedRow` interface to include `kabupaten` and `provinsi`
- Modified `parseCSV()` to parse 5 fields instead of 6
- **Added** `enrichWithProvinsi()` - async function that:
  - Takes parsed rows and supabase client
  - Looks up provinsi from `master_ongkir` for each kabupaten
  - Returns enriched rows with provinsi populated
  - Adds validation errors if kabupaten not found

#### `src/lib/crm/validators.ts`
- Updated `ClientData` interface with `kabupaten` and `provinsi` fields
- Modified validation to check kabupaten (provinsi validation skipped since it's auto-populated)

#### `src/components/crm/BulkInputForm.tsx`
- Integrated `enrichWithProvinsi()` in the input handler
- Added loading state while looking up provinsi
- Updated preview table to show 6 columns (including auto-filled provinsi)
- Provinsi column styled in green to indicate it's auto-filled
- Updated example CSV to 5-field format

#### `src/app/(protected)/crm/input/page.tsx`
- Updated tips section to explain new format and auto-lookup feature

### 4. Migration Files Created

#### `migrations/add_kabupaten_provinsi_to_clients.sql`
SQL script to add kabupaten and provinsi columns (if using Option A - add columns)

#### `migrations/check_duplicate_kabupaten.sql`
SQL queries to check for duplicate kabupaten entries in master_ongkir

#### `src/lib/crm/locationValidator.ts`
Utility functions for location validation (created but not yet integrated - for future enhancements)

## How It Works

1. **User inputs CSV** with 5 fields: `Nama, WA, Kebutuhan, Kabupaten, Luasan`
2. **System parses** the CSV into structured data
3. **System looks up** each kabupaten in `master_ongkir` table (case-insensitive)
4. **Provinsi is auto-filled** from the lookup result
5. **Preview shows** both kabupaten and provinsi (provinsi in green to indicate auto-fill)
6. **Validation** checks if kabupaten exists in database
7. **Save** stores both kabupaten and provinsi to `clients` table

## Database Migration Required

You need to run this SQL on your Supabase database:

```sql
-- Option 1: If lokasi column exists and you want to rename it
ALTER TABLE clients 
RENAME COLUMN lokasi TO kabupaten;

ALTER TABLE clients 
ADD COLUMN IF NOT EXISTS provinsi TEXT;

-- Option 2: If you want to keep lokasi and add new columns
ALTER TABLE clients 
ADD COLUMN IF NOT EXISTS kabupaten TEXT,
ADD COLUMN IF NOT EXISTS provinsi TEXT;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_clients_provinsi ON clients(provinsi);
CREATE INDEX IF NOT EXISTS idx_clients_kabupaten ON clients(kabupaten);
```

## Testing

1. Navigate to `/crm/input`
2. Try pasting this example:
```
Nama, WA, Kebutuhan, Kabupaten, Luasan
Test User, 08123456789, Rumah, Bandung, 200
```
3. Watch the provinsi column auto-fill with "Jawa Barat"
4. Verify validation works for invalid kabupaten names

## Future Enhancements (Optional)

- Add reference dropdown showing "Kabupaten - Provinsi" for easy copy-paste
- Add fuzzy matching for typos (e.g., "Bandng" → suggest "Bandung")
- Add autocomplete suggestions while typing
- Cache provinsi lookups to reduce database queries
