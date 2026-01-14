-- Query 1: Find duplicate kabupaten names (same kabupaten in different provinces)
-- This is EXPECTED and VALID (e.g., "Bandung" exists in multiple provinces)
SELECT 
  kabupaten,
  COUNT(*) as count,
  STRING_AGG(DISTINCT provinsi, ', ') as provinces
FROM master_ongkir
GROUP BY kabupaten
HAVING COUNT(*) > 1
ORDER BY count DESC, kabupaten;

-- Query 2: Find duplicate kabupaten+provinsi combinations
-- This is UNEXPECTED and should be investigated (true duplicates)
SELECT 
  provinsi,
  kabupaten,
  COUNT(*) as duplicate_count,
  STRING_AGG(id::text, ', ') as duplicate_ids
FROM master_ongkir
GROUP BY provinsi, kabupaten
HAVING COUNT(*) > 1
ORDER BY duplicate_count DESC, provinsi, kabupaten;

-- Query 3: Get all unique provinsi
SELECT DISTINCT provinsi
FROM master_ongkir
ORDER BY provinsi;

-- Query 4: Count kabupaten per provinsi
SELECT 
  provinsi,
  COUNT(DISTINCT kabupaten) as kabupaten_count,
  COUNT(*) as total_rows
FROM master_ongkir
GROUP BY provinsi
ORDER BY provinsi;

-- Query 5: Find kabupaten with case-sensitivity issues
-- (e.g., "Bandung" vs "BANDUNG" vs "bandung")
SELECT 
  LOWER(kabupaten) as kabupaten_lower,
  COUNT(DISTINCT kabupaten) as case_variations,
  STRING_AGG(DISTINCT kabupaten, ', ') as variations,
  STRING_AGG(DISTINCT provinsi, ', ') as provinces
FROM master_ongkir
GROUP BY LOWER(kabupaten)
HAVING COUNT(DISTINCT kabupaten) > 1
ORDER BY case_variations DESC;
