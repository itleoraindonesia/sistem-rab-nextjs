// Validation types
export interface ValidationError {
  field: string;
  message: string;
}

export interface ClientData {
  nama: string;
  whatsapp: string;
  kebutuhan: string;
  produk?: string;
  kabupaten: string;
  provinsi?: string;
  luasan: string | number | null;
}

// Valid kebutuhan options
export const VALID_KEBUTUHAN = [
  'Pagar',
  'Gudang',
  'Kos/Kontrakan',
  'Toko/Ruko',
  'Rumah',
  'Villa',
  'Hotel',
  'Rumah Sakit',
  'Panel Saja',
] as const;

// Valid products (Hardcoded)
export const VALID_PRODUCTS = [
  'Panel Beton',
  'Pagar Beton',
  'Sandwich Panel',
  'Panel Surya',
  'Plastik Board',
  'Ponton Terapung',
  'Jasa Konstruksi',
  'Jasa Renovasi',
  'Jasa RAB/Gambar',
] as const;

// Flexible matching for kebutuhan
const KEBUTUHAN_ALIASES: Record<string, string> = {
  'kos': 'Kos/Kontrakan',
  'kontrakan': 'Kos/Kontrakan',
  'kos kontrakan': 'Kos/Kontrakan',
  'koskontrakan': 'Kos/Kontrakan',
  'toko': 'Toko/Ruko',
  'ruko': 'Toko/Ruko',
  'tokoruko': 'Toko/Ruko',
  'rs': 'Rumah Sakit',
  'rumahsakit': 'Rumah Sakit',
  'panel': 'Panel Saja',
};

// Validate WhatsApp number format
export function isValidWhatsApp(wa: string): boolean {
  if (!wa) return false;
  
  // Remove all non-digit characters
  const cleaned = wa.replace(/\D/g, '');
  
  // Valid formats:
  // 08XXXXXXXXXX (10-13 digits)
  // 628XXXXXXXXX (11-14 digits)
  // +628XXXXXXXXX (same as 628)
  
  if (cleaned.startsWith('08') && cleaned.length >= 10 && cleaned.length <= 13) {
    return true;
  }
  
  if (cleaned.startsWith('628') && cleaned.length >= 11 && cleaned.length <= 14) {
    return true;
  }
  
  return false;
}

// Normalize WhatsApp to 628... format
export function normalizeWhatsApp(wa: string): string {
  if (!wa) return '';
  
  const cleaned = wa.replace(/\D/g, '');
  
  if (cleaned.startsWith('08')) {
    return '628' + cleaned.substring(2);
  }
  
  if (cleaned.startsWith('628')) {
    return cleaned;
  }
  
  return wa; // Return original if can't normalize
}

// Normalize kebutuhan (case-insensitive, flexible matching)
export function normalizeKebutuhan(kebutuhan: string): string {
  if (!kebutuhan) return '';
  
  const cleaned = kebutuhan.trim().toLowerCase();
  
  // Check aliases first
  if (KEBUTUHAN_ALIASES[cleaned]) {
    return KEBUTUHAN_ALIASES[cleaned];
  }
  
  // Check exact match (case-insensitive)
  const exactMatch = VALID_KEBUTUHAN.find(
    (valid) => valid.toLowerCase() === cleaned
  );
  
  if (exactMatch) {
    return exactMatch;
  }
  
  // Return original if no match
  return kebutuhan.trim();
}

// Normalize produk (case-insensitive)
export function normalizeProduk(produk: string): string {
  if (!produk) return '';
  
  const cleaned = produk.trim().toLowerCase();
  
  // Check exact match (case-insensitive)
  const exactMatch = VALID_PRODUCTS.find(
    (valid) => valid.toLowerCase() === cleaned
  );
  
  if (exactMatch) {
    return exactMatch;
  }

  // NOTE: Partial match removed to trigger suggestions in UI instead of auto-correcting
  // providing better UX for ambiguous inputs (e.g. "Panel" -> could be Panel Beton or Panel Surya)
  
  return produk.trim(); 
}

// Validate produk and return suggestions
export function validateProdukWithSuggestions(produk: string): { isValid: boolean, normalized?: string, suggestions: string[] } {
  if (!produk || !produk.trim()) {
    return { isValid: false, suggestions: [] };
  }

  const normalized = normalizeProduk(produk);
  const isValid = VALID_PRODUCTS.includes(normalized as any);

  if (isValid) {
    return { isValid: true, normalized, suggestions: [] };
  }

  // Fuzzy match for suggestions
  const cleaned = produk.trim().toLowerCase();
  const suggestions = VALID_PRODUCTS.filter(p => 
    p.toLowerCase().includes(cleaned) || cleaned.includes(p.toLowerCase())
  ).slice(0, 5);

  // If exactly one suggestion found, treat it as valid match (Auto-Select)
  if (suggestions.length === 1) {
     return { isValid: true, normalized: suggestions[0], suggestions: [] };
  }

  return { isValid: false, suggestions: suggestions.length > 0 ? suggestions : Array.from(VALID_PRODUCTS).slice(0, 5) };
}

// Capitalize name (first letter of each word)
export function capitalizeName(name: string): string {
  if (!name) return '';
  
  return name
    .trim()
    .toLowerCase()
    .split(' ')
    .map(word => {
      if (word.length === 0) return '';
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(' ');
}

// Validate client data
export function validateClient(data: ClientData): ValidationError[] {
  const errors: ValidationError[] = [];
  
  // Validate nama
  if (!data.nama || data.nama.trim().length < 2) {
    errors.push({
      field: 'nama',
      message: 'Nama harus minimal 2 karakter',
    });
  }
  
  if (data.nama && data.nama.length > 100) {
    errors.push({
      field: 'nama',
      message: 'Nama maksimal 100 karakter',
    });
  }
  
  // Validate WhatsApp
  if (!isValidWhatsApp(data.whatsapp)) {
    errors.push({
      field: 'whatsapp',
      message: 'Format WA tidak valid. Contoh: 08123456789',
    });
  }
  
  // Validate kebutuhan
  const normalizedKebutuhan = normalizeKebutuhan(data.kebutuhan);
  if (!VALID_KEBUTUHAN.includes(normalizedKebutuhan as any)) {
    errors.push({
      field: 'kebutuhan',
      message: `Kebutuhan tidak valid. Pilihan: ${VALID_KEBUTUHAN.join(', ')}`,
    });
  }

  // Validate produk (Required now)
  if (!data.produk || !data.produk.trim()) {
    errors.push({
      field: 'produk',
      message: 'Produk wajib diisi',
    });
  } else {
    const normalizedProduk = normalizeProduk(data.produk);
    if (!VALID_PRODUCTS.includes(normalizedProduk as any)) {
       errors.push({
        field: 'produk',
        message: `Produk tidak valid.`,
      });
    }
  }
  
  // Validate kabupaten - basic validation only
  // Actual kabupaten validation will be done separately with suggestions
  if (!data.kabupaten || data.kabupaten.trim().length < 3) {
    errors.push({
      field: 'kabupaten',
      message: 'Kabupaten harus minimal 3 karakter',
    });
  }
  
  if (data.kabupaten && data.kabupaten.length > 100) {
    errors.push({
      field: 'kabupaten',
      message: 'Kabupaten maksimal 100 karakter',
    });
  }
  
  // Validate luasan (optional, but must be valid if provided)
  if (data.luasan !== null && data.luasan !== undefined && data.luasan !== '') {
    const luasanNum = typeof data.luasan === 'string' ? parseFloat(data.luasan) : data.luasan;
    
    if (isNaN(luasanNum) || luasanNum <= 0) {
      errors.push({
        field: 'luasan',
        message: 'Luasan harus berupa angka positif',
      });
    }
  }
  
  return errors;
}

// Get all valid kabupaten from database
export async function getAllValidKabupaten(supabase: any): Promise<Array<{kabupaten: string, provinsi: string}>> {
  try {
    const { data, error } = await supabase
      .from('master_ongkir')
      .select('kabupaten, provinsi')
      .order('kabupaten');
    
    if (error) throw error;
    
    // Get unique kabupaten-provinsi pairs
    const uniqueKabupaten = new Map<string, string>();
    (data || []).forEach((item: any) => {
      if (item.kabupaten && item.provinsi) {
        uniqueKabupaten.set(item.kabupaten, item.provinsi);
      }
    });
    
    return Array.from(uniqueKabupaten.entries()).map(([kabupaten, provinsi]) => ({
      kabupaten,
      provinsi
    }));
  } catch (error) {
    console.error('Error fetching kabupaten:', error);
    return [];
  }
}

// Validate kabupaten against database and return suggestions if invalid
export function validateKabupatenWithSuggestions(
  kabupaten: string,
  validKabupaten: Array<{kabupaten: string, provinsi: string}>
): { isValid: boolean; provinsi?: string; normalizedKabupaten?: string; suggestions: Array<{kabupaten: string, provinsi: string}> } {
  if (!kabupaten || !kabupaten.trim()) {
    return { isValid: false, suggestions: [] };
  }
  
  const kabupatenLower = kabupaten.trim().toLowerCase();
  
  // Check exact match (case-insensitive)
  const exactMatch = validKabupaten.find(
    item => item.kabupaten.toLowerCase() === kabupatenLower
  );
  
  if (exactMatch) {
    return { isValid: true, provinsi: exactMatch.provinsi, normalizedKabupaten: exactMatch.kabupaten, suggestions: [] };
  }
  
  // Find fuzzy matches (contains or is contained)
  const suggestions = validKabupaten.filter(item => {
    const kabupatenItemLower = item.kabupaten.toLowerCase();
    return kabupatenItemLower.includes(kabupatenLower) || kabupatenLower.includes(kabupatenItemLower);
  }).slice(0, 5); // Limit to 5 suggestions

  // Auto-pick if exactly 1 suggestion
  if (suggestions.length === 1) {
    return { 
      isValid: true, 
      provinsi: suggestions[0].provinsi, 
      normalizedKabupaten: suggestions[0].kabupaten,
      suggestions: [] 
    };
  }
  
  return { isValid: false, suggestions };
}
