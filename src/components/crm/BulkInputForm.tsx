'use client';

import { useState, useEffect } from 'react';
import { parseCSV, ParsedRow } from '@/lib/crm/parsers';
import { supabase } from '@/lib/supabaseClient';
import { getAllValidKabupaten, validateKabupatenWithSuggestions } from '@/lib/crm/validators';
import { useToast } from '@/components/ui/use-toast';
import { getFirstName } from '@/lib/utils/nameUtils';

const EXAMPLE_CSV_WHATSAPP = `Budi Santoso, 08123456789, Rumah, Pagar Beton, Kota Depok, 200
Ani Wijaya, -, Pagar, Panel Lantai, Kota Bandung, 50
Dodi Hermawan, 08125678901, Kos/Kontrakan, U-Ditch, Kota Surakarta, 150`;

const EXAMPLE_CSV_INSTAGRAM = `@budisantoso, Budi Santoso, 08123456789, Rumah, Pagar Beton, Kota Depok, 200
@aniwijaya, Ani Wijaya, -, Pagar, Panel Lantai, Kota Bandung, 50
@dodihermawan, Dodi Hermawan, 08125678901, Kos/Kontrakan, U-Ditch, Kota Surakarta, 150`;

import { useQueryClient } from '@tanstack/react-query';

export default function BulkInputForm() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [trackingSource, setTrackingSource] = useState<'instagram_only' | 'whatsapp_only' | null>(null);
  const [inputText, setInputText] = useState('');
  const [parsedData, setParsedData] = useState<ParsedRow[]>([]);
  const [validKabupaten, setValidKabupaten] = useState<Array<{kabupaten: string, provinsi: string}>>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [saveResult, setSaveResult] = useState<{
    success: boolean;
    inserted: number;
    skipped: number;
    message: string;
  } | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [existingClients, setExistingClients] = useState<Set<string>>(new Set());

  useEffect(() => {
    // Fetch user for audit trail
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) setUserId(user.id);
    };
    getUser();

    // Fetch master data kabupaten
    const fetchKabupaten = async () => {
      const data = await getAllValidKabupaten(supabase);
      console.log('✅ Kabupaten data loaded:', data.length, 'items');
      setValidKabupaten(data);
    };
    fetchKabupaten();

    // Fetch existing clients for duplicate detection
    const fetchExistingClients = async () => {
      try {
        const { data, error } = await supabase
          .from('clients')
          .select('whatsapp')
          .not('whatsapp', 'eq', '-');

        if (error) {
          console.warn('⚠️ Gagal fetch existing clients:', error.message);
          return;
        }

        const whatsappSet = new Set<string>();
        (data || []).forEach((client: { whatsapp: string }) => {
          if (client.whatsapp) {
            whatsappSet.add(client.whatsapp);
          }
        });

        setExistingClients(whatsappSet);
        console.log('✅ Existing clients loaded:', whatsappSet.size, 'unique WhatsApp numbers');
      } catch (err) {
        console.warn('⚠️ Error fetching existing clients:', err);
      }
    };
    fetchExistingClients();
  }, []);

  // Helper function to validate and set parsed data
  const validateAndSetData = (text: string, kabupatenList: Array<{kabupaten: string, provinsi: string}>, source: 'instagram_only' | 'whatsapp_only' | undefined, existingClientsSet: Set<string>) => {
    if (!text.trim()) {
      setParsedData([]);
      return;
    }

    const parsed = parseCSV(text, source);

    // Only validate kabupaten if the list has been loaded
    if (kabupatenList.length > 0) {
      console.log('🔍 Validating kabupaten with', kabupatenList.length, 'valid options');
      // Validate kabupaten for each row
      const parsedWithKabupatenValidation = parsed.map(row => {
        if (!row.kabupaten) return row;

        const validation = validateKabupatenWithSuggestions(row.kabupaten, kabupatenList);

        if (!validation.isValid) {
          // Add kabupaten error if not already present
          const hasKabupatenError = row.errors.some(e => e.field === 'kabupaten');
          if (!hasKabupatenError) {
            row.errors.push({
              field: 'kabupaten',
              message: validation.suggestions.length > 0
                ? 'Kabupaten tidak ditemukan. Lihat saran di bawah.'
                : 'Kabupaten tidak ditemukan dalam database',
            });
            row.isValid = false;
          }
          row.suggestions = validation.suggestions;
        } else {
          // Set provinsi if valid
          row.provinsi = validation.provinsi;
          // Auto-correct kabupaten name (e.g. "depok" -> "Kota Depok")
          if (validation.normalizedKabupaten) {
            row.kabupaten = validation.normalizedKabupaten;
          }
        }

        // Mark as duplicate if whatsapp already exists
        if (row.whatsapp && row.whatsapp !== '-' && existingClientsSet.has(row.whatsapp)) {
          row.isValid = false;
          const hasDuplicateError = row.errors.some(e => e.field === 'duplicate');
          if (!hasDuplicateError) {
            row.errors.push({
              field: 'duplicate',
              message: 'Data dengan WA ini sudah ada di database',
            });
          }
        }

        return row;
      });

      setParsedData(parsedWithKabupatenValidation);
    } else {
      console.log('⚠️ Kabupaten list not loaded yet, skipping validation');
      // If kabupaten list not loaded yet, just show parsed data without kabupaten validation
      setParsedData(parsed);
    }
  };

  // Re-validate when kabupaten list is loaded or tracking source changes
  useEffect(() => {
    if (validKabupaten.length > 0 && inputText.trim()) {
      validateAndSetData(inputText, validKabupaten, trackingSource ?? undefined, existingClients);
    }
  }, [validKabupaten.length, trackingSource, inputText, validKabupaten, existingClients]);

  // Re-validate when existing clients cache is updated
  useEffect(() => {
    if (existingClients.size > 0 && inputText.trim()) {
      validateAndSetData(inputText, validKabupaten, trackingSource ?? undefined, existingClients);
    }
  }, [existingClients.size, inputText, validKabupaten, existingClients, trackingSource]);

  const handleInputChange = (text: string) => {
    setInputText(text);
    setSaveResult(null);
    validateAndSetData(text, validKabupaten, trackingSource ?? undefined, existingClients);
  };

  const handleSave = async () => {
    if (!supabase) {
      alert('Supabase not configured');
      return;
    }

    setIsSaving(true);
    const validRows = parsedData.filter(r => r.isValid);
    let inserted = 0;
    let skipped = 0;
    const errors: string[] = [];

    // Separate duplicates from new data (duplicates are already marked as invalid)
    const newRows = validRows.filter(r => {
      const isDuplicate = r.whatsapp && r.whatsapp !== '-' && existingClients.has(r.whatsapp);
      if (isDuplicate) skipped++;
      return !isDuplicate;
    });

    if (newRows.length === 0) {
      // All data are duplicates or invalid
      setSaveResult({
        success: skipped > 0,
        inserted: 0,
        skipped: skipped,
        message: skipped > 0
          ? '⚠️ Semua data sudah ada di database.'
          : '⚠️ Tidak ada data valid untuk disimpan.',
      });
      setIsSaving(false);
      return;
    }

    // Bulk insert all new rows at once
    try {
      const recordsToInsert = newRows.map(row => ({
        nama: row.nama,
        whatsapp: row.whatsapp,
        kebutuhan: row.kebutuhan,
        produk: row.produk,
        kabupaten: row.kabupaten,
        provinsi: row.provinsi,
        luasan: row.luasan,
        instagram_username: row.instagram_username,
        tracking_source: row.tracking_source,
        created_by: userId,
        updated_by: userId,
        status: row.tracking_source === 'instagram_only' ? 'IG_Lead' : 'WA_Negotiation',
      }));

      const { error: bulkInsertError } = await supabase
        .from('clients')
        .insert(recordsToInsert);

      if (bulkInsertError) {
        // Check if it's a partial success (some rows inserted, some failed)
        if (bulkInsertError.message?.includes('row') && bulkInsertError.message?.includes('limit')) {
          // Partial insert due to size limits - count what we can
          inserted = Math.floor(newRows.length / 2);
          errors.push(`Hanya ${inserted} data yang berhasil disimpan (limit ukuran query).`);
        } else {
          throw bulkInsertError;
        }
      } else {
        inserted = newRows.length;
      }
    } catch (err) {
      console.error('Error in bulk insert:', err);
      errors.push(`Gagal menyimpan data: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }

    const isSuccess = errors.length === 0 && inserted > 0;

    let message = '';
    if (isSuccess) {
      message = `✅ Selesai: ${inserted} data baru disimpan.`;
      if (skipped > 0) message += ` ${skipped} duplikat di-skip.`;

      toast({
        title: "Bulk Input Berhasil",
        description: `Berhasil menyimpan ${inserted} data baru.`,
        variant: "success" as any,
      });

      // Clear form on success
      setInputText('');
      setParsedData([]);

      // Refresh existing clients cache
      const { data: newClients } = await supabase
        .from('clients')
        .select('whatsapp')
        .not('whatsapp', 'eq', '-');

      if (newClients) {
        const newSet = new Set<string>();
        newClients.forEach((client: { whatsapp: string }) => {
          if (client.whatsapp) newSet.add(client.whatsapp);
        });
        setExistingClients(newSet);
      }

      // Invalidate queries to refresh dashboard and table
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      queryClient.invalidateQueries({ queryKey: ['crm-stats'] });
    } else {
      if (errors.length > 0) {
        message = `❌ Error: ${errors[0]}`;
        if (inserted > 0) {
          message += ` (${inserted} data berhasil disimpan)`;
        }

        toast({
          title: "Terdapat Error",
          description: errors[0],
          variant: "destructive"
        });
      } else {
        message = `⚠️ Tidak ada data yang disimpan.`;
      }
    }

    setSaveResult({
      success: isSuccess,
      inserted: inserted,
      skipped: skipped,
      message: message,
    });

    setIsSaving(false);
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

      {/* Tracking Source Selector */}
      <div>
        <label className="block text-sm font-medium mb-3">
          Pilih Sumber Data <span className="text-red-500">*</span>
        </label>
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            type="button"
            onClick={() => {
              setTrackingSource('whatsapp_only');
              setSaveResult(null);
            }}
            className={`flex-1 px-6 py-4 rounded-lg border-2 transition-all ${
              trackingSource === 'whatsapp_only'
                ? 'border-green-500 bg-green-50 text-green-900'
                : 'border-gray-300 bg-white text-gray-700 hover:border-green-300'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                trackingSource === 'whatsapp_only' 
                  ? 'border-green-500 bg-green-500' 
                  : 'border-gray-400'
              }`}>
                {trackingSource === 'whatsapp_only' && (
                  <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>
              <span className="font-semibold">WhatsApp Only</span>
            </div>
            <p className="text-xs mt-2 opacity-75">6 kolom: Nama, WA, Kebutuhan, Produk, Kabupaten, Luasan</p>
          </button>

          <button
            type="button"
            onClick={() => {
              setTrackingSource('instagram_only');
              setSaveResult(null);
            }}
            className={`flex-1 px-6 py-4 rounded-lg border-2 transition-all ${
              trackingSource === 'instagram_only'
                ? 'border-purple-500 bg-purple-50 text-purple-900'
                : 'border-gray-300 bg-white text-gray-700 hover:border-purple-300'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                trackingSource === 'instagram_only' 
                  ? 'border-purple-500 bg-purple-500' 
                  : 'border-gray-400'
              }`}>
                {trackingSource === 'instagram_only' && (
                  <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>
              <span className="font-semibold">Instagram Only</span>
            </div>
            <p className="text-xs mt-2 opacity-75">7 kolom: Username, Nama, WA, Kebutuhan, Produk, Kabupaten, Luasan</p>
          </button>
        </div>
      </div>

      {/* Input Textarea */}
      {trackingSource && (
        <div>
          <label className="block text-sm font-medium mb-2">
            Data Client (CSV Format)
          </label>
          <p className="text-xs text-gray-500 my-2">
            <span className="font-semibold">Format (pisahkan dengan koma):</span>{' '}
            {trackingSource === 'instagram_only' 
              ? 'Username Instagram, Nama, WhatsApp, Kebutuhan, Produk, Kabupaten, Luasan (opsional)'
              : 'Nama, WhatsApp, Kebutuhan, Produk, Kabupaten, Luasan (opsional)'
            }
          </p>
          <textarea
            value={inputText}
            onChange={(e) => handleInputChange(e.target.value)}
            placeholder={trackingSource === 'instagram_only' ? EXAMPLE_CSV_INSTAGRAM : EXAMPLE_CSV_WHATSAPP}
            className="w-full min-h-[300px] p-4 border border-gray-300 rounded-lg font-mono text-sm focus:ring-2 focus:ring-primary focus:border-transparent resize-y"
            style={{ 
              lineHeight: '1.5',
              tabSize: 4,
            }}
          />
       
        </div>
      )}

      {/* Preview Table / Cards */}
      {parsedData.length > 0 && (
        <div className="border border-gray-200 rounded-lg overflow-hidden">
          <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
            <h3 className="font-semibold">
              Preview Data ({parsedData.length} baris dianalisa)
            </h3>
            <div className="flex gap-4 mt-1 text-sm">
              {validCount > 0 && (
                <span className="text-green-600">✅ {validCount} valid</span>
              )}
              {errorCount > 0 && (
                <span className="text-red-600">❌ {errorCount} error</span>
              )}
              {parsedData.filter(r => r.errors.some(e => e.field === 'duplicate')).length > 0 && (
                <span className="text-orange-600">⏭️ {parsedData.filter(r => r.errors.some(e => e.field === 'duplicate')).length} duplikat</span>
              )}
            </div>
          </div>

          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-100 border-b border-gray-200">
                <tr>
                  <th className="px-3 py-2 text-left">#</th>
                  {trackingSource === 'instagram_only' && (
                    <th className="px-3 py-2 text-left">Username IG</th>
                  )}
                  <th className="px-3 py-2 text-left">Nama</th>
                  <th className="px-3 py-2 text-left">WhatsApp</th>
                  <th className="px-3 py-2 text-left">Kebutuhan</th>
                  <th className="px-3 py-2 text-left">Produk</th>
                  <th className="px-3 py-2 text-left">Kabupaten</th>
                  <th className="px-3 py-2 text-left">Provinsi</th>
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
                    {trackingSource === 'instagram_only' && (
                      <td className="px-3 py-2 font-mono text-xs">
                        {row.instagram_username || <span className="text-gray-400">-</span>}
                        {row.errors.find(e => e.field === 'instagram_username') && (
                          <div className="text-xs text-red-600 mt-1">
                            {row.errors.find(e => e.field === 'instagram_username')?.message}
                          </div>
                        )}
                      </td>
                    )}
                    <td className="px-3 py-2">
                      {getFirstName(row.nama) || <span className="text-gray-400">-</span>}
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
                      {row.errors.find(e => e.field === 'duplicate') && (
                        <div className="text-xs text-orange-600 mt-1 font-medium">
                          ⏭️ Duplikat
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
                      {row.errors.find(e => e.field === 'produk') && (
                        <div className="text-xs text-red-600 mt-1">
                          {row.errors.find(e => e.field === 'produk')?.message}
                        </div>
                      )}
                      {/* Show suggestions if produk is invalid */}
                      {row.produkSuggestions && row.produkSuggestions.length > 0 && (
                        <div className="mt-2 p-2 bg-purple-50 border border-purple-200 rounded text-xs">
                          <div className="font-semibold text-purple-800 mb-1">Mungkin maksud Anda:</div>
                          <ul className="space-y-1">
                            {row.produkSuggestions.map((sug, idx) => (
                              <li key={idx} className="text-purple-700">
                                • {sug}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </td>
                    <td className="px-3 py-2">
                      {row.kabupaten || <span className="text-gray-400">-</span>}
                      {row.errors.find(e => e.field === 'kabupaten') && (
                        <div className="text-xs text-red-600 mt-1">
                          {row.errors.find(e => e.field === 'kabupaten')?.message}
                        </div>
                      )}
                      {/* Show suggestions if kabupaten is invalid */}
                      {row.suggestions && row.suggestions.length > 0 && (
                        <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs">
                          <div className="font-semibold text-yellow-800 mb-1">Mungkin maksud Anda:</div>
                          <ul className="space-y-1">
                            {row.suggestions.map((sug, idx) => (
                              <li key={idx} className="text-yellow-700">
                                • {sug.kabupaten} ({sug.provinsi})
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </td>
                    <td className="px-3 py-2 text-sm">
                      {row.provinsi ? (
                        <span className="text-gray-700">{row.provinsi}</span>
                      ) : (
                        <span className="text-gray-400">-</span>
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

          {/* Mobile Card View */}
          <div className="md:hidden bg-gray-50 p-4 space-y-4">
            {parsedData.map((row) => (
              <div 
                key={row.row}
                className={`bg-white rounded-lg border shadow-sm p-4 ${
                  row.isValid ? 'border-gray-200' : 'border-red-300 ring-1 ring-red-100'
                }`}
              >
                <div className="flex justify-between items-start mb-3">
                   <div className="flex items-center gap-2">
                     <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${
                       row.isValid ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                     }`}>
                       {row.row}
                     </span>
                     <h4 className="font-semibold text-gray-900">{getFirstName(row.nama) || 'Tanpa Nama'}</h4>
                   </div>
                   <div className={`text-xs px-2 py-1 rounded-full font-medium ${
                     row.isValid ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                   }`}>
                     {row.isValid ? 'Valid' : 'Invalid'}
                   </div>
                </div>

                <div className="space-y-2 text-sm">
                   {/* Row Details Grid */}
                   <div className="grid grid-cols-2 gap-2 text-xs text-gray-600 mb-2">
                      {trackingSource === 'instagram_only' && (
                        <div><span className="font-medium text-gray-500">IG:</span> {row.instagram_username || '-'}</div>
                      )}
                      <div><span className="font-medium text-gray-500">WA:</span> {row.whatsapp || '-'}</div>
                      <div><span className="font-medium text-gray-500">Produk:</span> {row.produk || '-'}</div>
                      <div><span className="font-medium text-gray-500">Area:</span> {row.kabupaten || '-'}</div>
                   </div>

                   {/* Errors Section */}
                   {row.errors.length > 0 && (
                     <div className="mt-3 bg-red-50 p-2 rounded border border-red-100">
                       <p className="text-xs font-semibold text-red-800 mb-1">Perlu Perbaikan:</p>
                       <ul className="list-disc list-inside text-xs text-red-700 space-y-0.5">
                         {row.errors.map((e, idx) => (
                           <li key={idx}>{e.message}</li>
                         ))}
                       </ul>
                     </div>
                   )}

                   {/* Suggestions Section */}
                   {((row.suggestions?.length ?? 0) > 0 || (row.produkSuggestions?.length ?? 0) > 0) && (
                     <div className="mt-2 bg-yellow-50 p-2 rounded border border-yellow-100">
                       <p className="text-xs font-semibold text-yellow-800 mb-1">Saran Sistem:</p>
                       <ul className="text-xs text-yellow-700 space-y-1">
                         {row.suggestions?.map((s, i) => (
                           <li key={`loc-${i}`}>📍 Lokasi: {s.kabupaten}</li>
                         ))}
                         {row.produkSuggestions?.map((s, i) => (
                           <li key={`prod-${i}`}>📦 Produk: {s}</li>
                         ))}
                       </ul>
                     </div>
                   )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Save Result */}
      {saveResult && (
        <div
          className={`p-4 rounded-lg ${
            saveResult.message.startsWith('✅')
              ? 'bg-green-50 border border-green-200'
              : saveResult.message.startsWith('⚠️')
              ? 'bg-yellow-50 border border-yellow-200'
              : 'bg-red-50 border border-red-200'
          }`}
        >
          <p className={
            saveResult.message.startsWith('✅')
              ? 'text-green-800'
              : saveResult.message.startsWith('⚠️')
              ? 'text-yellow-800'
              : 'text-red-800'
          }>
            {saveResult.message}
          </p>
        </div>
      )}

      {/* Actions */}
      {parsedData.length > 0 && (
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={handleSave}
            disabled={isSaving || validCount === 0}
            className="w-full sm:w-auto px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:bg-gray-300 disabled:cursor-not-allowed font-medium shadow-sm active:scale-[0.98] transition-transform"
          >
                        {isSaving ? 'Menyimpan...' : `Simpan ${validCount} Data`}
          </button>
          
          <button
            onClick={() => {
              setInputText('');
              setParsedData([]);
              setSaveResult(null);
            }}
            className="w-full sm:w-auto px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium active:scale-[0.98] transition-transform"
          >
            Reset
          </button>
        </div>
      )}
    </div>
  );
}
