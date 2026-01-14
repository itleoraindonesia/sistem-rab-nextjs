import { normalizeWhatsApp, normalizeKebutuhan, normalizeProduk, validateClient, ValidationError } from './validators';

export interface ParsedRow {
  row: number;
  nama: string;
  whatsapp: string;
  kebutuhan: string;
  produk: string;
  kabupaten: string;
  provinsi: string;
  luasan: number | null;
  errors: ValidationError[];
  isValid: boolean;
}

// Detect delimiter in CSV line
export function detectDelimiter(line: string): string {
  const commaCount = (line.match(/,/g) || []).length;
  const tabCount = (line.match(/\t/g) || []).length;
  
  return tabCount > commaCount ? '\t' : ',';
}

// Capitalize each word in a name
function capitalizeName(name: string): string {
  if (!name) return '';
  
  return name
    .trim()
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

// Parse CSV text to structured data
export function parseCSV(text: string): ParsedRow[] {
  if (!text || !text.trim()) {
    return [];
  }
  
  const lines = text.trim().split('\n');
  
  // Skip header if it looks like a header
  const firstLine = lines[0].toLowerCase();
  const hasHeader = firstLine.includes('nama') || firstLine.includes('whatsapp') || firstLine.includes('kebutuhan') || firstLine.includes('kabupaten');
  const dataLines = hasHeader ? lines.slice(1) : lines;
  
  const delimiter = detectDelimiter(dataLines[0] || lines[0]);
  
  return dataLines.map((line, index) => {
    const parts = line.split(delimiter).map(s => s.trim());
    
    // Format: Nama, WA, Kebutuhan, Produk, Kabupaten/Kota, Luasan (6 fields)
    const [nama = '', wa = '', kebutuhan = '', produk = '', kabupaten = '', luasan = ''] = parts;
    
    const normalizedWa = normalizeWhatsApp(wa);
    const normalizedKebutuhan = normalizeKebutuhan(kebutuhan);
    const normalizedProduk = normalizeProduk(produk);
    const parsedLuasan = luasan && luasan.trim() !== '' ? parseFloat(luasan) : null;
    
    const clientData = {
      nama: capitalizeName(nama),
      whatsapp: normalizedWa,
      kebutuhan: normalizedKebutuhan,
      produk: normalizedProduk,
      kabupaten: kabupaten.trim(),
      provinsi: '', // Will be filled by async lookup
      luasan: parsedLuasan,
    };
    
    const errors = validateClient(clientData);
    
    return {
      row: index + 1,
      nama: clientData.nama,
      whatsapp: clientData.whatsapp,
      kebutuhan: clientData.kebutuhan,
      produk: clientData.produk,
      kabupaten: clientData.kabupaten,
      provinsi: clientData.provinsi, // Empty initially, will be populated by enrichWithProvinsi
      luasan: clientData.luasan,
      errors,
      isValid: errors.length === 0,
    };
  });
}

// Helper function to try multiple kabupaten name variations
async function findKabupatenMatch(
  kabupaten: string,
  supabase: any
): Promise<{ 
  success: boolean; 
  provinsi?: string; 
  kabupaten?: string;
  suggestions?: Array<{ kabupaten: string; provinsi: string }>;
  isAmbiguous?: boolean;
} | null> {
  const trimmed = kabupaten.trim();
  
  // List of variations to try for EXACT matching
  const variations = [
    trimmed, // Exact as entered
    `Kota ${trimmed}`, // Add "Kota " prefix
    `Kabupaten ${trimmed}`, // Add "Kabupaten " prefix
    trimmed.replace(/^Kota\s+/i, ''), // Remove "Kota " prefix if exists
    trimmed.replace(/^Kabupaten\s+/i, ''), // Remove "Kabupaten " prefix if exists
  ];

  // Remove duplicates
  const uniqueVariations = [...new Set(variations)];

  // Try each variation for EXACT match
  for (const variant of uniqueVariations) {
    try {
      const { data, error } = await supabase
        .from('master_ongkir')
        .select('provinsi, kabupaten')
        .ilike('kabupaten', variant)
        .limit(1)
        .single();

      if (!error && data) {
        return {
          success: true,
          provinsi: data.provinsi,
          kabupaten: data.kabupaten,
        };
      }
    } catch (e) {
      // Continue to next variation
    }
  }

  // If no exact match, try fuzzy matching and get ALL matches
  try {
    const { data, error } = await supabase
      .from('master_ongkir')
      .select('provinsi, kabupaten')
      .ilike('kabupaten', `%${trimmed}%`)
      .limit(10); // Get up to 10 matches

    if (!error && data && data.length > 0) {
      // Remove duplicates based on kabupaten name
      const uniqueMatches = Array.from(
        new Map(data.map((item: any) => [item.kabupaten, item])).values()
      ) as Array<{provinsi: string; kabupaten: string}>;

      if (uniqueMatches.length === 1) {
        // Only 1 fuzzy match - safe to use
        return {
          success: true,
          provinsi: uniqueMatches[0].provinsi,
          kabupaten: uniqueMatches[0].kabupaten,
        };
      } else {
        // Multiple matches - ambiguous!
        return {
          success: false,
          isAmbiguous: true,
          suggestions: uniqueMatches.slice(0, 5).map((item: any) => ({
            kabupaten: item.kabupaten,
            provinsi: item.provinsi,
          })),
        };
      }
    }
  } catch (e) {
    // No match found
  }

  return null;
}

// Async function to enrich parsed data with provinsi lookup from master_ongkir
export async function enrichWithProvinsi(
  parsedRows: ParsedRow[],
  supabase: any
): Promise<ParsedRow[]> {
  if (!supabase) return parsedRows;

  const enrichedRows = await Promise.all(
    parsedRows.map(async (row) => {
      if (!row.kabupaten || row.kabupaten.trim() === '') {
        return row;
      }

      try {
        // Try to find kabupaten with flexible matching
        const match = await findKabupatenMatch(row.kabupaten, supabase);

        if (match?.success) {
          // Found unique match - populate provinsi and use the matched kabupaten name
          return {
            ...row,
            kabupaten: match.kabupaten!, // Use the exact name from database
            provinsi: match.provinsi!,
          };
        } else if (match?.isAmbiguous) {
          // Multiple matches found - ambiguous!
          const suggestionText = match.suggestions
            ?.map(s => `${s.kabupaten} (${s.provinsi})`)
            .join(', ');
          
          return {
            ...row,
            errors: [
              ...row.errors,
              {
                field: 'kabupaten',
                message: `Ambigu. Maksud Anda: ${suggestionText}?`,
              },
            ],
            isValid: false,
          };
        } else {
          // Kabupaten not found in master_ongkir
          return {
            ...row,
            errors: [
              ...row.errors,
              {
                field: 'kabupaten',
                message: `Kabupaten "${row.kabupaten}" tidak ditemukan di database`,
              },
            ],
            isValid: false,
          };
        }
      } catch (error) {
        console.error('Error looking up provinsi:', error);
        return row;
      }
    })
  );

  return enrichedRows;
}

// Format parsed data for database insert
export function formatForDatabase(parsedRows: ParsedRow[]) {
  return parsedRows
    .filter(row => row.isValid)
    .map(row => ({
      nama: row.nama,
      whatsapp: row.whatsapp,
      kebutuhan: row.kebutuhan,
      produk: row.produk,
      kabupaten: row.kabupaten,
      provinsi: row.provinsi,
      luasan: row.luasan,
    }));
}
