'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { supabase } from '@/lib/supabaseClient';
import { Client } from '@/lib/supabaseClient';
import { VALID_KEBUTUHAN, VALID_PRODUCTS } from '@/lib/crm/validators';
import { clientSchema, clientFormValues } from '@/lib/crm/schemas';
import { useToast } from '@/components/ui/use-toast';

interface EditClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  client: Client | null;
  onSuccess: () => void;
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
        updated_at: new Date().toISOString(),
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
          <div className="flex justify-between items-center border-b pb-4">
            <h2 className="text-2xl font-bold text-gray-800">Edit Data Client</h2>
            <button 
              type="button" 
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {submitError && (
            <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm border border-red-200">
              {submitError}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nama Client</label>
                <input
                  type="text"
                  {...register('nama')}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary outline-none capitalize ${errors.nama ? 'border-red-500' : 'border-gray-300'}`}
                />
                {errors.nama && <p className="text-xs text-red-500 mt-1">{errors.nama.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">WhatsApp</label>
                <input
                  type="text"
                  {...register('whatsapp')}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary outline-none ${errors.whatsapp ? 'border-red-500' : 'border-gray-300'}`}
                />
                {errors.whatsapp && <p className="text-xs text-red-500 mt-1">{errors.whatsapp.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Instagram Username (Opsional)</label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-gray-400">@</span>
                  <input
                    type="text"
                    {...register('instagram_username')}
                    className="w-full pl-7 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary outline-none border-gray-300"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Kabupaten/Kota</label>
                <input
                  type="text"
                  list="kabupaten-list"
                  {...register('kabupaten')}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary outline-none capitalize ${errors.kabupaten ? 'border-red-500' : 'border-gray-300'}`}
                  placeholder="Ketik untuk mencari..."
                />
                <datalist id="kabupaten-list">
                  {kabupatenList.map((item, idx) => (
                    <option key={`${item.kabupaten}-${idx}`} value={item.kabupaten} />
                  ))}
                </datalist>
                {errors.kabupaten && <p className="text-xs text-red-500 mt-1">{errors.kabupaten.message}</p>}
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-4">
               <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status Pipeline</label>
                <select
                  {...register('status')}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary outline-none font-medium bg-white border-gray-300"
                >
                  {PIPELINE_STAGES.map(stage => (
                    <option key={stage} value={stage}>{stage.replace(/_/g, ' ')}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Kebutuhan</label>
                <select
                  {...register('kebutuhan')}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary outline-none bg-white ${errors.kebutuhan ? 'border-red-500' : 'border-gray-300'}`}
                >
                  <option value="">Pilih Kebutuhan</option>
                  {VALID_KEBUTUHAN.map(k => (
                    <option key={k} value={k}>{k}</option>
                  ))}
                </select>
                {errors.kebutuhan && <p className="text-xs text-red-500 mt-1">{errors.kebutuhan.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Produk</label>
                 <select
                  {...register('produk')}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary outline-none bg-white ${errors.produk ? 'border-red-500' : 'border-gray-300'}`}
                >
                  <option value="">- Belum ada produk -</option>
                  {Array.from(VALID_PRODUCTS).map(p => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
                {errors.produk && <p className="text-xs text-red-500 mt-1">{errors.produk.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Luasan / Keliling</label>
                <div className="flex items-center gap-2">
                    <input
                      type="number"
                      step="any"
                      {...register('luasan')}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary outline-none ${errors.luasan ? 'border-red-500' : 'border-gray-300'}`}
                    />
                    <span className="text-sm text-gray-500 shrink-0">
                      {(kebutuhanValue === 'Pagar' || kebutuhanValue === 'Pagar Beton') ? 'm (lari)' : 'm²'}
                    </span>
                </div>
                 {errors.luasan && <p className="text-xs text-red-500 mt-1">{errors.luasan.message}</p>}
              </div>
            </div>
          </div>

          <div className="pt-4 flex justify-end gap-3 border-t mt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-5 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors font-medium"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading || !isDirty} // Optional: Disable if nothing changed (isDirty)
              className="px-5 py-2 text-white bg-primary hover:bg-primary/90 rounded-lg shadow-lg hover:shadow-xl transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
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
                'Simpan Perubahan'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
