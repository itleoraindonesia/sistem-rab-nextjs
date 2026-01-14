'use client';

import { useState } from 'react';
import { parseCSV, enrichWithProvinsi, ParsedRow, formatForDatabase } from '@/lib/crm/parsers';
import { supabase } from '@/lib/supabaseClient';

const EXAMPLE_CSV = `Nama, WA, Kebutuhan, Produk, Kabupaten/Kota, Luasan/Keliling
Budi Santoso, 08123456789, Rumah, Panel Beton, Depok, 200
Ani Wijaya, 628124567890, Pagar, Pagar Beton, Bandung, 50
Dodi Hermawan, 08125678901, Kos/Kontrakan, Sandwich Panel, Surakarta, 150`;

export default function BulkInputForm() {
  const [inputText, setInputText] = useState('');
  const [parsedData, setParsedData] = useState<ParsedRow[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveResult, setSaveResult] = useState<{
    success: boolean;
    inserted: number;
    skipped: number;
    message: string;
  } | null>(null);

  const handleInputChange = async (text: string) => {
    setInputText(text);
    setSaveResult(null);
    
    if (text.trim()) {
      setIsLoading(true);
      try {
        // Parse CSV
        const parsed = parseCSV(text);
        
        // Enrich with provinsi lookup from master_ongkir
        const enriched = await enrichWithProvinsi(parsed, supabase);
        
        setParsedData(enriched);
      } catch (error) {
        console.error('Error parsing CSV:', error);
        setParsedData([]);
      } finally {
        setIsLoading(false);
      }
    } else {
      setParsedData([]);
    }
  };

  const handleSave = async () => {
    if (!supabase) {
      alert('Supabase not configured');
      return;
    }

    // Check if ALL rows are valid - no partial submissions allowed
    const hasInvalidRows = parsedData.some(row => !row.isValid);
    
    if (hasInvalidRows) {
      alert('Semua data harus valid sebelum submit. Perbaiki error terlebih dahulu.');
      return;
    }

    if (parsedData.length === 0) {
      alert('Tidak ada data untuk disimpan');
      return;
    }

    setIsSaving(true);
    
    try {
      const dataToInsert = formatForDatabase(parsedData);

      const { data, error } = await supabase!
        .from('clients')
        .insert(dataToInsert as any)
        .select();

      if (error) throw error;

      const inserted = data?.length || 0;

      setSaveResult({
        success: true,
        inserted,
        skipped: 0,
        message: `✅ Berhasil menyimpan ${inserted} data`,
      });

      // Clear form after success
      setInputText('');
      setParsedData([]);
      
    } catch (error: any) {
      setSaveResult({
        success: false,
        inserted: 0,
        skipped: 0,
        message: `❌ Error: ${error.message}`,
      });
    } finally {
      setIsSaving(false);
    }
  };

  const validCount = parsedData.filter(row => row.isValid).length;
  const errorCount = parsedData.filter(row => !row.isValid).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold mb-2">Input Data Client (Bulk)</h2>
        <p className="text-gray-600">
          Copy-paste data dari Excel atau ketik manual dengan format CSV
        </p>
      </div>

      {/* Input Textarea */}
      <div>
        <label className="block text-sm font-medium mb-2">
          Data Client (CSV Format)
        </label>
        <textarea
          value={inputText}
          onChange={(e) => handleInputChange(e.target.value)}
          placeholder={EXAMPLE_CSV}
          className="w-full min-h-[300px] p-4 border border-gray-300 rounded-lg font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-y"
          style={{ 
            lineHeight: '1.5',
            tabSize: 4,
          }}
        />
        <p className="text-xs text-gray-500 mt-2">
          Format: Nama, WA, Kebutuhan, Produk, Kabupaten/Kota, Luasan/Keliling (pisahkan dengan koma atau tab)
        </p>
        {isLoading && (
          <p className="text-xs text-blue-600 mt-1">🔍 Mencari provinsi dari database...</p>
        )}
      </div>

      {/* Preview Table */}
      {parsedData.length > 0 && (
        <div className="border border-gray-200 rounded-lg overflow-hidden">
          <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
            <h3 className="font-semibold">
              Preview Data Klien ({parsedData.length} baris data telah dianalisis)
            </h3>
            <div className="flex gap-4 mt-1 text-sm">
              {validCount > 0 && (
                <span className="text-green-600">✓ {validCount} data valid</span>
              )}
              {errorCount > 0 && (
                <span className="text-red-600">❌ {errorCount} error</span>
              )}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-100 border-b border-gray-200">
                <tr>
                  <th className="px-3 py-2 text-left">No</th>
                  <th className="px-3 py-2 text-left">Nama</th>
                  <th className="px-3 py-2 text-left">WhatsApp</th>
                  <th className="px-3 py-2 text-left">Kebutuhan</th>
                  <th className="px-3 py-2 text-left">Produk</th>
                  <th className="px-3 py-2 text-left">Kabupaten/Kota</th>
                  <th className="px-3 py-2 text-left">Provinsi</th>
                  <th className="px-3 py-2 text-left">Luasan/Keliling</th>
                </tr>
              </thead>
              <tbody>
                {parsedData.map((row) => (
                  <tr
                    key={row.row}
                    className={`border-b border-gray-100 ${
                      row.isValid ? 'bg-white' : 'bg-red-50'
                    }`}
                  >
                    <td className="px-3 py-2">
                      {row.isValid ? '✓' : '❌'} {row.row}
                    </td>
                    <td className="px-3 py-2 capitalize">
                      {row.nama || <span className="text-gray-400">-</span>}
                      {row.errors.find(e => e.field === 'nama') && (
                        <div className="text-xs text-red-600 mt-1">
                          {row.errors.find(e => e.field === 'nama')?.message}
                        </div>
                      )}
                    </td>
                    <td className="px-3 py-2 font-mono text-xs">
                      {row.whatsapp || <span className="text-gray-400">-</span>}
                      {row.errors.find(e => e.field === 'whatsapp') && (
                        <div className="text-xs text-red-600 mt-1">
                          {row.errors.find(e => e.field === 'whatsapp')?.message}
                        </div>
                      )}
                    </td>
                    <td className="px-3 py-2">
                      {row.kebutuhan || <span className="text-gray-400">-</span>}
                      {row.errors.find(e => e.field === 'kebutuhan') && (
                        <div className="text-xs text-red-600 mt-1">
                          {row.errors.find(e => e.field === 'kebutuhan')?.message}
                        </div>
                      )}
                    </td>
                    <td className="px-3 py-2">
                      {row.produk || <span className="text-gray-400">-</span>}
                      {row.errors.find((e: any) => e.field === 'produk') && (
                        <div className="text-xs text-red-600 mt-1">
                          {row.errors.find((e: any) => e.field === 'produk')?.message}
                        </div>
                      )}
                    </td>
                    <td className="px-3 py-2 capitalize">
                      {row.kabupaten || <span className="text-gray-400">-</span>}
                      {row.errors.find(e => e.field === 'kabupaten') && (
                        <div className="text-xs text-red-600 mt-1">
                          {row.errors.find(e => e.field === 'kabupaten')?.message}
                        </div>
                      )}
                    </td>
                    <td className="px-3 py-2">
                      {row.provinsi ? (
                        <span className="text-green-700 font-medium">{row.provinsi}</span>
                      ) : (
                        <span className="text-gray-400 italic">auto</span>
                      )}
                      {row.errors.find(e => e.field === 'provinsi') && (
                        <div className="text-xs text-red-600 mt-1">
                          {row.errors.find(e => e.field === 'provinsi')?.message}
                        </div>
                      )}
                    </td>
                    <td className="px-3 py-2">
                      {row.luasan ? row.luasan.toLocaleString('id-ID') : '-'}
                      {row.errors.find(e => e.field === 'luasan') && (
                        <div className="text-xs text-red-600 mt-1">
                          {row.errors.find(e => e.field === 'luasan')?.message}
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Save Result */}
      {saveResult && (
        <div
          className={`p-4 rounded-lg ${
            saveResult.success
              ? 'bg-green-50 border border-green-200'
              : 'bg-red-50 border border-red-200'
          }`}
        >
          <p className={saveResult.success ? 'text-green-800' : 'text-red-800'}>
            {saveResult.message}
          </p>
        </div>
      )}

      {/* Actions */}
      {parsedData.length > 0 && (
        <div className="flex gap-3">
          <button
            onClick={handleSave}
            disabled={isSaving || errorCount > 0}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed font-medium"
          >
            {isSaving ? 'Menyimpan...' : 'Simpan'}
          </button>
          
          <button
            onClick={() => {
              setInputText('');
              setParsedData([]);
              setSaveResult(null);
            }}
            className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium"
          >
            Reset
          </button>
        </div>
      )}
    </div>
  );
}
