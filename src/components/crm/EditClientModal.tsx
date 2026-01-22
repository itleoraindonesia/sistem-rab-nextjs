'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { supabase } from '@/lib/supabaseClient';
import { Client } from '@/lib/supabaseClient';
import { VALID_KEBUTUHAN, VALID_PRODUCTS } from '@/lib/crm/validators';
import { clientSchema, clientFormValues } from '@/lib/crm/schemas';
import { useToast } from '@/components/ui/use-toast';
import { getCurrentWIBISO, formatDateToWIB } from '@/lib/utils/dateUtils';
import { getFirstName } from '@/lib/utils/nameUtils';

interface EditClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  client: Client | null;
  onSuccess: () => void;
}

interface User {
  id: string;
  nama: string;
  email: string;
}

const PIPELINE_STAGES = [
  'IG_Lead',
  'WA_Negotiation',
  'Quotation_Sent',
  'Follow_Up',
  'Invoice_Deal',
  'WIP',
  'Finish',
  'Cancelled'
];

export default function EditClientModal({ isOpen, onClose, client, onSuccess }: EditClientModalProps) {
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [creator, setCreator] = useState<User | null>(null);
  const [updater, setUpdater] = useState<User | null>(null);
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
    watch,
  } = useForm({
    resolver: zodResolver(clientSchema),
    defaultValues: {
      nama: '',
      whatsapp: '',
      kebutuhan: '',
      produk: '',
      kabupaten: '',
      luasan: 0,
      status: 'IG_Lead',
      instagram_username: '',
    },
  });

  // Watch kebutuhan to change unit label dynamically
  const kebutuhanValue = watch('kebutuhan');
  
  const [kabupatenList, setKabupatenList] = useState<{kabupaten: string, provinsi: string}[]>([]);

  // Fetch user data for audit trail
  useEffect(() => {
    if (client && isOpen) {
      const fetchUsers = async () => {
        if (client.created_by || client.updated_by) {
          const userIds = [client.created_by, client.updated_by].filter(Boolean) as string[];
          const { data } = await supabase
            .from('users')
            .select('id, nama, email')
            .in('id', userIds);
          
          if (data && data.length > 0) {
            const creator = data.find(u => u.id === client.created_by);
            const updater = data.find(u => u.id === client.updated_by);
            setCreator(creator || null);
            setUpdater(updater || null);
          }
        }
      };
      fetchUsers();
    }
  }, [client, isOpen]);

  // Fetch kabupaten list when modal opens
  useEffect(() => {
    if (isOpen && kabupatenList.length === 0) {
      const fetchKabupaten = async () => {
        const { data } = await supabase
          .from('master_ongkir')
          .select('kabupaten, provinsi')
          .order('kabupaten');
        
        if (data) {
           // Dedup logic if needed, but assuming master is clean or handled here
           setKabupatenList(data as any);
        }
      };
      fetchKabupaten();
    }
  }, [isOpen]);

  useEffect(() => {
    if (client && isOpen) {
      reset({
        nama: client.nama,
        whatsapp: client.whatsapp,
        kebutuhan: client.kebutuhan,
        produk: client.produk || '',
        kabupaten: client.kabupaten,
        // Ensure luasan is treated as string/number correctly for the form
        luasan: client.luasan || 0,
        status: client.status as any, // Cast to any to handle legacy statuses
        instagram_username: client.instagram_username || '',
      });
      setSubmitError('');
    }
  }, [client, isOpen, reset]);

  if (!isOpen || !client) return null;

  const onSubmit = async (data: clientFormValues) => {
    setLoading(true);
    setSubmitError('');

    try {
      // Find provinsi from list if matched
      const matchedKab = kabupatenList.find(
          k => k.kabupaten.toLowerCase() === data.kabupaten.toLowerCase()
      );
      
      const { data: { user } } = await supabase.auth.getUser();

      const updates = {
        ...data,
        // Auto-fill provinsi if found in master
        provinsi: matchedKab ? matchedKab.provinsi : undefined, 
        updated_at: getCurrentWIBISO(),
        updated_by: user?.id,
      };

      const { error: updateError } = await supabase
        .from('clients')
        .update(updates)
        .eq('id', client.id);

      if (updateError) throw updateError;
      
      toast({
        title: "Perubahan Disimpan",
        description: `Data client ${data.nama} berhasil diperbarui.`,
        variant: "success" as any,
      });

      onSuccess();
      onClose();
    } catch (err: any) {
      console.error('Error updating client:', err);
      const msg = err.message || 'Gagal menyimpan perubahan';
      setSubmitError(msg);
      
      toast({
        title: "Gagal Menyimpan",
        description: msg,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
          {/* Header */}
          <div className="flex justify-between items-start border-b border-gray-200 pb-4">
            <h2 className="text-2xl font-bold text-gray-900">Edit Data Client</h2>
            <button 
              type="button" 
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-400 hover:text-gray-600"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Error Alert */}
          {submitError && (
            <div className="flex items-start gap-3 p-4 bg-red-50 text-red-700 rounded-lg border border-red-200">
              <svg className="w-5 h-5 shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <span className="text-sm">{submitError}</span>
            </div>
          )}

          {/* Form Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1.5">
                  Nama Client
                  <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  {...register('nama')}
                  className={`w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all capitalize text-sm ${errors.nama ? 'border-red-500 bg-red-50' : 'border-gray-300 hover:border-gray-400'}`}
                  placeholder="Nama lengkap client"
                />
                {errors.nama && (
                  <p className="text-xs text-red-600 mt-1.5 flex items-center gap-1">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {errors.nama.message}
                  </p>
                )}
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1.5">
                  WhatsApp
                  <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-gray-400 text-sm font-medium">📱</span>
                  <input
                    type="text"
                    {...register('whatsapp')}
                    className={`w-full pl-9 px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm ${errors.whatsapp ? 'border-red-500 bg-red-50' : 'border-gray-300 hover:border-gray-400'}`}
                    placeholder="08xxxxxxxxxx"
                  />
                </div>
                {errors.whatsapp && (
                  <p className="text-xs text-red-600 mt-1.5 flex items-center gap-1">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {errors.whatsapp.message}
                  </p>
                )}
              </div>

              <div className="md:col-span-2">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1.5">
                  Instagram Username
                  <span className="text-xs text-gray-400 font-normal">(Opsional)</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-gray-400 text-sm font-medium">@</span>
                  <input
                    type="text"
                    {...register('instagram_username')}
                    className="w-full pl-9 px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all hover:border-gray-400 text-sm"
                    placeholder="username"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1.5">
                  Status Pipeline
                </label>
                <select
                  {...register('status')}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all hover:border-gray-400 bg-white text-sm font-medium"
                >
                  {PIPELINE_STAGES.map(stage => (
                    <option key={stage} value={stage}>{stage.replace(/_/g, ' ')}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1.5">
                  Kabupaten/Kota
                  <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-gray-400 text-sm">📍</span>
                  <input
                    type="text"
                    list="kabupaten-list"
                    {...register('kabupaten')}
                    className={`w-full pl-9 px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all capitalize text-sm ${errors.kabupaten ? 'border-red-500 bg-red-50' : 'border-gray-300 hover:border-gray-400'}`}
                    placeholder="Cari kabupaten..."
                  />
                </div>
                <datalist id="kabupaten-list">
                  {kabupatenList.map((item, idx) => (
                    <option key={`${item.kabupaten}-${idx}`} value={item.kabupaten} />
                  ))}
                </datalist>
                {errors.kabupaten && (
                  <p className="text-xs text-red-600 mt-1.5 flex items-center gap-1">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {errors.kabupaten.message}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1.5">
                  Kebutuhan
                  <span className="text-red-500">*</span>
                </label>
                <select
                  {...register('kebutuhan')}
                  className={`w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all bg-white text-sm ${errors.kebutuhan ? 'border-red-500 bg-red-50' : 'border-gray-300 hover:border-gray-400'}`}
                >
                  <option value="">Pilih kebutuhan</option>
                  {VALID_KEBUTUHAN.map(k => (
                    <option key={k} value={k}>{k}</option>
                  ))}
                </select>
                {errors.kebutuhan && (
                  <p className="text-xs text-red-600 mt-1.5 flex items-center gap-1">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {errors.kebutuhan.message}
                  </p>
                )}
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1.5">
                  Produk
                  <span className="text-xs text-gray-400 font-normal">(Opsional)</span>
                </label>
                <select
                  {...register('produk')}
                  className={`w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all bg-white text-sm ${errors.produk ? 'border-red-500 bg-red-50' : 'border-gray-300 hover:border-gray-400'}`}
                >
                  <option value="">- Belum ada produk -</option>
                  {Array.from(VALID_PRODUCTS).map(p => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
                {errors.produk && (
                  <p className="text-xs text-red-600 mt-1.5 flex items-center gap-1">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {errors.produk.message}
                  </p>
                )}
              </div>

              <div className="md:col-span-2">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1.5">
                  Luasan / Keliling
                  <span className="text-xs text-gray-400 font-normal">(Opsional)</span>
                </label>
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <input
                      type="number"
                      step="any"
                      {...register('luasan')}
                      className={`w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm ${errors.luasan ? 'border-red-500 bg-red-50' : 'border-gray-300 hover:border-gray-400'}`}
                      placeholder="0"
                    />
                    <span className="absolute right-3 top-2.5 text-xs text-gray-400 font-medium">
                      {(kebutuhanValue === 'Pagar' || kebutuhanValue === 'Pagar Beton') ? 'm (lari)' : 'm²'}
                    </span>
                  </div>
                </div>
                {errors.luasan && (
                  <p className="text-xs text-red-600 mt-1.5 flex items-center gap-1">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {errors.luasan.message}
                  </p>
                )}
              </div>
            </div>

          {/* Audit Info - Compact */}
          {(client.created_at || client.updated_at) && (
            <div className="px-3 py-2 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs text-gray-600">
                {client.created_at && (
                  <span className="flex items-center gap-1">
                    <span>Created:</span>
                    <span className="font-medium text-gray-800">
                      {formatDateToWIB(client.created_at)}
                    </span>
                    {creator && <span className="text-gray-500">by {getFirstName(creator.nama)}</span>}
                  </span>
                )}
                {client.updated_at && (
                  <span className="flex items-center gap-1">
                    <span>Updated:</span>
                    <span className="font-medium text-gray-800">
                      {formatDateToWIB(client.updated_at)}
                    </span>
                    {updater && <span className="text-gray-500">by {getFirstName(updater.nama)}</span>}
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="pt-4 flex items-center justify-end gap-3 border-t border-gray-200 mt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-5 py-2.5 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading || !isDirty}
              className="px-5 py-2.5 text-white bg-primary hover:bg-primary/90 rounded-lg shadow-lg hover:shadow-xl transition-all font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-lg flex items-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Menyimpan...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Simpan Perubahan
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
