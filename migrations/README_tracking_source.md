# Migration: Add Tracking Source to Clients

## Overview
This migration adds tracking source functionality to the CRM system, allowing differentiation between Instagram and WhatsApp leads.

## Changes
- Added `tracking_source` column (TEXT with CHECK constraint: 'instagram_only' or 'whatsapp_only')
- Added `instagram_username` column (TEXT, nullable)
- Added indexes for better query performance

## How to Run

### Option 1: Using Supabase Dashboard (Recommended)
1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Copy the contents of `migrations/add_tracking_source_to_clients.sql`
4. Paste and execute the SQL

### Option 2: Using Supabase CLI
```bash
# If you have Supabase CLI installed
supabase db push
```

### Option 3: Manual SQL Execution
Connect to your PostgreSQL database and run:
```bash
psql -h <your-host> -U <your-user> -d <your-database> -f migrations/add_tracking_source_to_clients.sql
```

## Verification
After running the migration, verify the changes:
```sql
-- Check if columns exist
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'clients' 
AND column_name IN ('tracking_source', 'instagram_username');

-- Check indexes
SELECT indexname, indexdef 
FROM pg_indexes 
WHERE tablename = 'clients' 
AND indexname LIKE 'idx_clients_%';
```

## Rollback (if needed)
```sql
-- Remove indexes
DROP INDEX IF EXISTS idx_clients_tracking_source;
DROP INDEX IF EXISTS idx_clients_instagram_username;

-- Remove columns
ALTER TABLE clients DROP COLUMN IF EXISTS tracking_source;
ALTER TABLE clients DROP COLUMN IF EXISTS instagram_username;
```

## Features Enabled
After this migration, the CRM input form will support:
1. **Tracking Source Selection**: Choose between Instagram or WhatsApp leads
2. **Auto-detect CSV Format**: 
   - Instagram: 6 columns (Username, Nama, WA, Kebutuhan, Kabupaten, Luasan)
   - WhatsApp: 5 columns (Nama, WA, Kebutuhan, Kabupaten, Luasan)
3. **Duplicate Handling**: When an Instagram lead has the same WhatsApp number as an existing WhatsApp-only lead, the system will update the existing record with Instagram information
4. **Dynamic UI**: Input form adapts based on selected source

## Date
2026-01-19
