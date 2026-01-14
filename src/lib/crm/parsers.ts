import { normalizeWhatsApp, normalizeKebutuhan, validateClient, ValidationError } from './validators';

export interface ParsedRow {
  row: number;
  nama: string;
  whatsapp: string;
  kebutuhan: string;
  lokasi: string;
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

// Parse CSV text to structured data
export function parseCSV(text: string): ParsedRow[] {
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
    
    const [nama = '', wa = '', kebutuhan = '', lokasi = '', luasan = ''] = parts;
    
    const normalizedWa = normalizeWhatsApp(wa);
    const normalizedKebutuhan = normalizeKebutuhan(kebutuhan);
    const parsedLuasan = luasan && luasan.trim() !== '' ? parseFloat(luasan) : null;
    
    const clientData = {
      nama: nama.trim(),
      whatsapp: normalizedWa,
      kebutuhan: normalizedKebutuhan,
      lokasi: lokasi.trim(),
      luasan: parsedLuasan,
    };
    
    const errors = validateClient(clientData);
    
    return {
      row: index + 1,
      nama: clientData.nama,
      whatsapp: clientData.whatsapp,
      kebutuhan: clientData.kebutuhan,
      lokasi: clientData.lokasi,
      luasan: clientData.luasan,
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
      lokasi: row.lokasi,
      luasan: row.luasan,
    }));
}
