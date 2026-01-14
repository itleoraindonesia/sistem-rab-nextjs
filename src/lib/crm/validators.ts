// Validation types
export interface ValidationError {
  field: string;
  message: string;
}

export interface ClientData {
  nama: string;
  whatsapp: string;
  kebutuhan: string;
  lokasi: string;
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
  
  // Validate lokasi (hanya kabupaten/kota)
  if (!data.lokasi || data.lokasi.trim().length < 3) {
    errors.push({
      field: 'lokasi',
      message: 'Lokasi harus minimal 3 karakter',
    });
  }
  
  if (data.lokasi && data.lokasi.length > 100) {
    errors.push({
      field: 'lokasi',
      message: 'Lokasi maksimal 100 karakter',
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
