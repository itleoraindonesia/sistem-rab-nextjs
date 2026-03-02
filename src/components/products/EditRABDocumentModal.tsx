'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { supabase } from '@/lib/supabase/client';
import { RABDocument, RAB_DOCUMENT_STATUS } from '@/hooks/useRABDocuments';
import { useToast } from '@/components/ui/use-toast';
import { getCurrentWIBISO, formatDateToWIB } from '@/lib/utils/dateUtils';

interface EditRABDocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  document: RABDocument | null;
  onSuccess: () => void;
}

interface User {
  id: string;
  nama: string;
  email: string;
}

const rabDocumentSchema = z.object({
  no_ref: z.string().optional(),
  project_name: z.string().min(1, 'Nama proyek wajib diisi'),
  location_kabupaten: z.string().optional(),
  client_nama: z.string().optional(),
  client_no_hp: z.string().optional(),
  client_email: z.string().email('Email tidak valid').optional().or(z.literal('')),
  total: z.number().optional(),
  status: z.string().optional(),
});

type rabDocumentFormValues = z.infer<typeof rabDocumentSchema>;

export default function EditRABDocumentModal({ isOpen, onClose, document, onSuccess }: EditRABDocumentModalProps) {
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
  } = useForm({
    resolver: zodResolver(rabDocumentSchema),
    defaultValues: {
      no_ref: '',
      project_name: '',
      location_kabupaten: '',
      client_nama: '',
      client_no_hp: '',
      client_email: '',
      total: 0,
      status: 'draft',
    },
  });

  const [kabupatenList, setKabupatenList] = useState<{kabupaten: string, provinsi: string}[]>([]);

  useEffect(() => {
    if (document && isOpen) {
      reset({
        no_ref: document.no_ref || '',
        project_name: document.project_name || '',
        location_kabupaten: document.location_kabupaten || '',
        client_nama: document.client_profile?.nama || '',
        client_no_hp: document.client_profile?.no_hp || '',
        client_email: document.client_profile?.email || '',
        total: document.total || 0,
        status: document.status || 'draft',
      });
      setSubmitError('');
    }
  }, [document, isOpen, reset]);

  useEffect(() => {
    if (isOpen && kabupatenList.length === 0) {
      const fetchKabupaten = async () => {
        const { data } = await supabase
          .from('master_ongkir')
          .select('kabupaten, provinsi')
          .order('kabupaten');
        
        if (data) {
          setKabupatenList(data as any);
        }
      };
      fetchKabupaten();
    }
  }, [isOpen]);

  if (!isOpen || !document) return null;

  const onSubmit = async (data: rabDocumentFormValues) => {
    setLoading(true);
    setSubmitError('');

    try {
      const matchedKab = kabupatenList.find(
        k => k.kabupaten.toLowerCase() === (data.location_kabupaten || '').toLowerCase()
      );

      const updates = {
        no_ref: data.no_ref || null,
        project_name: data.project_name,
        location_kabupaten: data.location_kabupaten || null,
        location_provinsi: matchedKab ? matchedKab.provinsi : null,
        client_profile: {
          nama: data.client_nama || null,
          no_hp: data.client_no_hp || null,
          email: data.client_email || null,
        },
        total: data.total || null,
        status: data.status || 'draft',
        updated_at: getCurrentWIBISO(),
      };

      const { error: updateError } = await supabase
        .from('rab_documents')
        .update(updates)
        .eq('id', document.id);

      if (updateError) throw updateError;
      
      toast({
        title: "Perubahan Disimpan",
        description: `Data dokumen ${data.project_name} berhasil diperbarui.`,
        variant: "success" as any,
      });

      onSuccess();
      onClose();
    } catch (err: any) {
      console.error('Error updating document:', err);
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
          <div className="flex justify-between items-start border-b border-gray-200 pb-4">
            <h2 className="text-2xl font-bold text-gray-900">Edit Dokumen RAB</h2>
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

          {submitError && (
            <div className="flex items-start gap-3 p-4 bg-red-50 text-red-700 rounded-lg border border-red-200">
              <svg className="w-5 h-5 shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <span className="text-sm">{submitError}</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1.5">
                No Referensi
              </label>
              <input
                type="text"
                {...register('no_ref')}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all hover:border-gray-400 text-sm"
                placeholder="RAB-001"
              />
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1.5">
                Status
              </label>
              <select
                {...register('status')}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all hover:border-gray-400 bg-white text-sm font-medium"
              >
                {RAB_DOCUMENT_STATUS.map(st => (
                  <option key={st} value={st}>{st.charAt(0).toUpperCase() + st.slice(1)}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1.5">
              Nama Proyek
              <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              {...register('project_name')}
              className={`w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm ${errors.project_name ? 'border-red-500 bg-red-50' : 'border-gray-300 hover:border-gray-400'}`}
              placeholder="Nama proyek"
            />
            {errors.project_name && (
              <p className="text-xs text-red-600 mt-1.5">{errors.project_name.message}</p>
            )}
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1.5">
              Kabupaten/Kota
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-gray-400 text-sm">📍</span>
              <input
                type="text"
                list="kabupaten-list-rab"
                {...register('location_kabupaten')}
                className="w-full pl-9 px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all hover:border-gray-400 text-sm"
                placeholder="Cari kabupaten..."
              />
            </div>
            <datalist id="kabupaten-list-rab">
              {kabupatenList.map((item, idx) => (
                <option key={`${item.kabupaten}-${idx}`} value={item.kabupaten} />
              ))}
            </datalist>
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1.5">
              Total
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-gray-400 text-sm">Rp</span>
              <input
                type="number"
                step="any"
                {...register('total', { valueAsNumber: true })}
                className="w-full pl-9 px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all hover:border-gray-400 text-sm"
                placeholder="0"
              />
            </div>
          </div>

          <div className="border-t border-gray-200 pt-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Informasi Client</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1.5">
                  Nama Client
                </label>
                <input
                  type="text"
                  {...register('client_nama')}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all hover:border-gray-400 text-sm"
                  placeholder="Nama client"
                />
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1.5">
                  No HP
                </label>
                <input
                  type="text"
                  {...register('client_no_hp')}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all hover:border-gray-400 text-sm"
                  placeholder="08xxxxxxxxxx"
                />
              </div>

              <div className="md:col-span-2">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1.5">
                  Email
                </label>
                <input
                  type="email"
                  {...register('client_email')}
                  className={`w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm ${errors.client_email ? 'border-red-500 bg-red-50' : 'border-gray-300 hover:border-gray-400'}`}
                  placeholder="email@example.com"
                />
                {errors.client_email && (
                  <p className="text-xs text-red-600 mt-1.5">{errors.client_email.message}</p>
                )}
              </div>
            </div>
          </div>

          {document.created_at && (
            <div className="px-3 py-2 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs text-gray-600">
                <span className="flex items-center gap-1">
                  <span>Created:</span>
                  <span className="font-medium text-gray-800">
                    {formatDateToWIB(document.created_at)}
                  </span>
                </span>
                {document.updated_at && (
                  <span className="flex items-center gap-1">
                    <span>Updated:</span>
                    <span className="font-medium text-gray-800">
                      {formatDateToWIB(document.updated_at)}
                    </span>
                  </span>
                )}
              </div>
            </div>
          )}

          <div className="pt-4 flex items-center justify-end gap-3 border-t border-gray-200">
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
