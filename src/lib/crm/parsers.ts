import { normalizeWhatsApp, normalizeKebutuhan, normalizeProduk, validateProdukWithSuggestions, capitalizeName, validateClient, ValidationError, VALID_PRODUCTS } from './validators';

export interface ParsedRow {
  row: number;
  nama: string;
  whatsapp: string;
  kebutuhan: string;
  kabupaten: string;
  provinsi?: string;
  produk?: string;
  luasan: number | null;
  tracking_source?: 'instagram_only' | 'whatsapp_only';
  instagram_username?: string;
  errors: ValidationError[];
  isValid: boolean;
  suggestions?: Array<{kabupaten: string, provinsi: string}>;
  produkSuggestions?: string[];
  existingClient?: any;
  isOverride?: boolean;
}

// Detect delimiter in CSV line
export function detectDelimiter(line: string): string {
  const commaCount = (line.match(/,/g) || []).length;
  const tabCount = (line.match(/\t/g) || []).length;
  
  return tabCount > commaCount ? '\t' : ',';
}

// Parse CSV text to structured data
export function parseCSV(text: string, trackingSource?: 'instagram_only' | 'whatsapp_only'): ParsedRow[] {
  if (!text || !text.trim()) {
    return [];
  }
  
  const lines = text.trim().split('\n');
  
  // Skip header if it looks like a header
  const firstLine = lines[0].toLowerCase();
  const hasHeader = firstLine.includes('nama') || firstLine.includes('whatsapp') || firstLine.includes('kebutuhan');
  const dataLines = hasHeader ? lines.slice(1) : lines;
  
  const delimiter = detectDelimiter(dataLines[0] || lines[0]);
  
  return dataLines.map((line, index) => {
    const parts = line.split(delimiter).map(s => s.trim());
    
    let nama = '';
    let wa = '';
    let kebutuhan = '';
    let produk = '';
    let kabupaten = '';
    let luasan = '';
    let instagramUsername = '';
    
    // Helper to check if a string matches any valid product
    const isProduct = (str: string) => {
      if (!str) return false;
      const normalized = str.toLowerCase().trim();
      return VALID_PRODUCTS.some(p => normalized.includes(p.toLowerCase()) || p.toLowerCase().includes(normalized));
    };

    // Helper to check if string is numeric (Luasan)
    const isNumeric = (str: string) => {
        if (!str || str.trim() === '') return false; // Empty is not numeric in this context (implies existing luasan provided)
        const num = parseFloat(str);
        return !isNaN(num) && isFinite(num);
    };

    // Auto-detect or use specified source
    if (trackingSource === 'instagram_only') {
      // Instagram format: Username, Nama, WA, Kebutuhan, Produk, Kabupaten, Luasan (7 cols)
      [instagramUsername = '', nama = '', wa = '', kebutuhan = '', produk = '', kabupaten = '', luasan = ''] = parts;
      
      // Heuristic for backward compatibility (6 cols)
      if (parts.length === 6 && !isProduct(produk) && isNumeric(parts[5])) {
         // Re-map as Old Format: Username, Nama, WA, Kebutuhan, Kabupaten, Luasan
         [instagramUsername = '', nama = '', wa = '', kebutuhan = '', kabupaten = '', luasan = ''] = parts;
         produk = '';
      }
    } else if (trackingSource === 'whatsapp_only') {
      // WhatsApp format: Nama, WA, Kebutuhan, Produk, Kabupaten, Luasan (6 cols)
      [nama = '', wa = '', kebutuhan = '', produk = '', kabupaten = '', luasan = ''] = parts;

      // Heuristic for backward compatibility (5 cols)
      if (parts.length === 5 && !isProduct(produk) && isNumeric(parts[4])) {
         // Re-map as Old Format: Nama, WA, Kebutuhan, Kabupaten, Luasan
         [nama = '', wa = '', kebutuhan = '', kabupaten = '', luasan = ''] = parts;
         produk = '';
      }
    } else {
      // Auto-detect
      if (parts[0]?.trim().startsWith('@')) {
         trackingSource = 'instagram_only';
         [instagramUsername = '', nama = '', wa = '', kebutuhan = '', produk = '', kabupaten = '', luasan = ''] = parts;
      } else {
         trackingSource = 'whatsapp_only';
         [nama = '', wa = '', kebutuhan = '', produk = '', kabupaten = '', luasan = ''] = parts;
      }
    }
    
    const normalizedWa = normalizeWhatsApp(wa);
    const normalizedKebutuhan = normalizeKebutuhan(kebutuhan);
    const normalizedProduk = normalizeProduk(produk);
    const capitalizedNama = capitalizeName(nama);
    const parsedLuasan = luasan && luasan.trim() !== '' ? parseFloat(luasan) : null;
    
    // Product validation with suggestions
    const productValidation = validateProdukWithSuggestions(produk);

    const clientData = {
      nama: capitalizedNama,
      whatsapp: normalizedWa,
      kebutuhan: normalizedKebutuhan,
      produk: productValidation.isValid ? productValidation.normalized : produk.trim(),
      kabupaten: kabupaten.trim(),
      luasan: parsedLuasan,
    };
    
    const errors = validateClient(clientData);
    
    // Add product logic explicitly if needed (already in validateClient, but we want to capture suggestions)
    if (!productValidation.isValid && productValidation.suggestions.length > 0) {
      // Ensure error is present
      const hasProdukError = errors.some(e => e.field === 'produk');
      if (!hasProdukError) {
        errors.push({
          field: 'produk',
          message: 'Produk tidak valid. Lihat saran di bawah.',
        });
      }
    }
    
    // Add Instagram username validation if it's Instagram source
    if (trackingSource === 'instagram_only' && !instagramUsername.trim()) {
      errors.push({
        field: 'instagram_username',
        message: 'Username Instagram wajib diisi untuk source Instagram',
      });
    }
    
    return {
      row: index + 1,
      nama: clientData.nama,
      whatsapp: clientData.whatsapp,
      kebutuhan: clientData.kebutuhan,
      produk: clientData.produk,
      produkSuggestions: !productValidation.isValid ? productValidation.suggestions : undefined,
      kabupaten: clientData.kabupaten,
      luasan: clientData.luasan,
      tracking_source: trackingSource,
      instagram_username: instagramUsername.trim().replace(/@/g, '') || undefined,
      errors,
      isValid: errors.length === 0,
    };
  });
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
      tracking_source: row.tracking_source,
      instagram_username: row.instagram_username,
    }));
}
