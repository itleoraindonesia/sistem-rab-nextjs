'use client';

import { useState } from 'react';
import { parseCSV, ParsedRow, formatForDatabase } from '@/lib/crm/parsers';
import { supabase } from '@/lib/supabaseClient';

const EXAMPLE_CSV = `Nama, WA, Kebutuhan, Lokasi, Luasan
Budi Santoso, 08123456789, Rumah, Depok, 200
Ani Wijaya, 628124567890, Pagar, Bandung, 50
Dodi Hermawan, 08125678901, Kos/Kontrakan, Solo, 150`;

export default function BulkInputForm() {
  const [inputText, setInputText] = useState('');
  const [parsedData, setParsedData] = useState<ParsedRow[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [saveResult, setSaveResult] = useState<{
    success: boolean;
    inserted: number;
    skipped: number;
    message: string;
  } | null>(null);

  const handleInputChange = (text: string) => {
    setInputText(text);
    setSaveResult(null);
    
    if (text.trim()) {
      const parsed = parseCSV(text);
      setParsedData(parsed);
    } else {
      setParsedData([]);
    }
  };

  const handleSave = async () => {
    if (!supabase) {
      alert('Supabase not configured');
      return;
    }

    const validRows = parsedData.filter(row => row.isValid);
    
    if (validRows.length === 0) {
      alert('Tidak ada data valid untuk disimpan');
      return;
    }

    setIsSaving(true);
    
    try {
      const dataToInsert = formatForDatabase(validRows);
      
      const { data, error } = await supabase
        .from('clients')
        .insert(dataToInsert)
        .select();

      if (error) throw error;

      const inserted = data?.length || 0;
      const skipped = parsedData.length - validRows.length;

      setSaveResult({
        success: true,
        inserted,
        skipped,
        message: `✅ Berhasil menyimpan ${inserted} data${skipped > 0 ? `, ${skipped} data di-skip (ada error)` : ''}`,
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
          Format: Nama, WA, Kebutuhan, Lokasi, Luasan (pisahkan dengan koma atau tab)
        </p>
      </div>

      {/* Preview Table */}
      {parsedData.length > 0 && (
        <div className="border border-gray-200 rounded-lg overflow-hidden">
          <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
            <h3 className="font-semibold">
              PREVIEW DATA ({parsedData.length} rows parsed)
            </h3>
            <div className="flex gap-4 mt-1 text-sm">
              {validCount > 0 && (
                <span className="text-green-600">✅ {validCount} valid</span>
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
                  <th className="px-3 py-2 text-left">#</th>
                  <th className="px-3 py-2 text-left">Nama</th>
                  <th className="px-3 py-2 text-left">WhatsApp</th>
                  <th className="px-3 py-2 text-left">Kebutuhan</th>
                  <th className="px-3 py-2 text-left">Lokasi</th>
                  <th className="px-3 py-2 text-left">Luasan</th>
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
                      {row.isValid ? '✅' : '❌'} {row.row}
                    </td>
                    <td className="px-3 py-2">
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
                      {row.lokasi || <span className="text-gray-400">-</span>}
                      {row.errors.find(e => e.field === 'lokasi') && (
                        <div className="text-xs text-red-600 mt-1">
                          {row.errors.find(e => e.field === 'lokasi')?.message}
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
            disabled={isSaving || validCount === 0}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed font-medium"
          >
            {isSaving ? 'Menyimpan...' : `Simpan ${validCount} Data Valid`}
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
