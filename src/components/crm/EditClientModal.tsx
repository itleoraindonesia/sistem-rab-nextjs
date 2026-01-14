'use client';

import { useState, useEffect } from 'react';
import { Client, supabase } from '@/lib/supabaseClient';
import { VALID_KEBUTUHAN } from '@/lib/crm/validators';
import { useMasterData } from '@/context/MasterDataContext';
import { useWilayahData } from '@/hooks/useWilayahData';

interface EditClientModalProps {
  client: Client | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function EditClientModal({ client, isOpen, onClose, onSuccess }: EditClientModalProps) {
  const { provinsiList } = useMasterData();
  const { getKabupaten, kabupatenCache } = useWilayahData();

  const [formData, setFormData] = useState({
    nama: '',
    whatsapp: '',
    kebutuhan: '',
    provinsi: '',
    kabupaten: '',
    luasan: '',
  });
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  // Load client data when modal opens
  useEffect(() => {
    if (client && isOpen) {
      setFormData({
        nama: client.nama || '',
        whatsapp: client.whatsapp || '',
        kebutuhan: client.kebutuhan || '',
        provinsi: client.provinsi || '',
        kabupaten: client.kabupaten || '',
        luasan: client.luasan?.toString() || '',
      });
      
      // Load kabupaten options for the selected province
      if (client.provinsi) {
        getKabupaten(client.provinsi);
      }
    }
  }, [client, isOpen]);

  // Load kabupaten when province changes
  useEffect(() => {
    if (formData.provinsi) {
      getKabupaten(formData.provinsi);
    }
  }, [formData.provinsi, getKabupaten]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!client || !supabase) return;

    setIsSaving(true);
    setError('');

    try {
      const updateData: any = {
        nama: formData.nama.trim(),
        whatsapp: formData.whatsapp.trim(),
        kebutuhan: formData.kebutuhan,
        kabupaten: formData.kabupaten,
        provinsi: formData.provinsi,
        luasan: formData.luasan ? parseFloat(formData.luasan) : null,
        updated_at: new Date().toISOString(),
      };

      const result = await (supabase as any)
        .from('clients')
        .update(updateData)
        .eq('id', client.id);

      const { error: updateError } = result as any;

      if (updateError) throw updateError;

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Gagal menyimpan perubahan');
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen || !client) return null;

  const kabupatenOptions = formData.provinsi ? (kabupatenCache[formData.provinsi] || []) : [];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white">
          <h2 className="text-xl font-bold">Edit Data Client</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl"
          >
            ×
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded">
              {error}
            </div>
          )}

          {/* Nama */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Nama <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.nama}
              onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          {/* WhatsApp */}
          <div>
            <label className="block text-sm font-medium mb-1">
              WhatsApp <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.whatsapp}
              onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
              placeholder="08123456789 atau 628123456789"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono"
              required
            />
          </div>

          {/* Kebutuhan */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Kebutuhan <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.kebutuhan}
              onChange={(e) => setFormData({ ...formData, kebutuhan: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            >
              <option value="">Pilih Kebutuhan</option>
              {VALID_KEBUTUHAN.map((k) => (
                <option key={k} value={k}>
                  {k}
                </option>
              ))}
            </select>
          </div>

          {/* Provinsi */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Provinsi <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.provinsi}
              onChange={(e) => {
                setFormData({ ...formData, provinsi: e.target.value, kabupaten: '' });
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            >
              <option value="">Pilih Provinsi</option>
              {provinsiList.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>

          {/* Kabupaten */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Kabupaten/Kota <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.kabupaten}
              onChange={(e) => setFormData({ ...formData, kabupaten: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
              disabled={!formData.provinsi}
            >
              <option value="">
                {formData.provinsi ? 'Pilih Kabupaten/Kota' : 'Pilih Provinsi terlebih dahulu'}
              </option>
              {kabupatenOptions.map((k) => (
                <option key={k} value={k}>
                  {k}
                </option>
              ))}
            </select>
          </div>

          {/* Luasan */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Luasan/Keliling (m²) <span className="text-gray-400 text-xs">(opsional)</span>
            </label>
            <input
              type="number"
              value={formData.luasan}
              onChange={(e) => setFormData({ ...formData, luasan: e.target.value })}
              placeholder="Contoh: 200"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              min="0"
              step="0.01"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={isSaving}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed font-medium"
            >
              {isSaving ? 'Menyimpan...' : 'Simpan Perubahan'}
            </button>
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium"
            >
              Batal
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
