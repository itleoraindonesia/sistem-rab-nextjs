import { useState, useEffect, useCallback } from 'react';
import { useForm, useFieldArray, UseFormReturn, FieldArrayWithId } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { RABFormData, rabSchema } from '../schemas/rabSchema';
import { useRouter } from 'next/navigation';
import { supabase } from '../lib/supabaseClient';

interface Panel {
  id: number;
  name: string;
  harga: number;
  luasPerLembar: number;
  type: string;
}

interface Ongkir {
  provinsi: string;
  biaya: number;
}

interface Parameters {
  wasteFactor: number;
  jointFactorDinding: number;
  jointFactorLantai: number;
  upahPasang: number;
  hargaJoint: number;
}

interface UseRABFormResult {
  register: UseFormReturn<RABFormData>['register'];
  control: UseFormReturn<RABFormData>['control'];
  handleSubmit: UseFormReturn<RABFormData>['handleSubmit'];
  watch: UseFormReturn<RABFormData>['watch'];
  setValue: UseFormReturn<RABFormData>['setValue'];
  reset: UseFormReturn<RABFormData>['reset'];
  formState: UseFormReturn<RABFormData>['formState'];
  loading: boolean;
  error: string | null;
  noRefGenerated: boolean;
  watchedValues: Partial<RABFormData>;
  fields: FieldArrayWithId<RABFormData, 'bidang'>[];
  remove: (index: number) => void;
  onSubmit: (data: RABFormData) => Promise<void>;
  saveHandler: () => Promise<void>;
  generateNoRef: () => void;
  loadExistingData: (id: string) => Promise<void>;
  tambahBidang: () => void;
}

export function useRABForm(
  id: string | undefined,
  panels: Panel[] = [],
  hasil: any = {},
  parameters: Parameters = {
    wasteFactor: 1.05,
    jointFactorDinding: 2.5,
    jointFactorLantai: 1.8,
    upahPasang: 50000,
    hargaJoint: 2500,
  }
): UseRABFormResult {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [noRef, setNoRef] = useState('');

  const isEdit = Boolean(id);

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState,
  } = useForm<RABFormData>({
    defaultValues: {
      no_ref: '',
      project_name: '',
      location: '',
      bidang: [],
      perimeter: 0,
      tinggi_lantai: 0,
      panel_dinding_id: '',
      panel_lantai_id: '',
      hitung_dinding: false,
      hitung_lantai: false,
      status: 'draft' as const,
    },
    mode: 'onChange',
  });

  const { errors, isSubmitting, isValid } = formState;

  const {
    fields,
    append,
    remove,
  } = useFieldArray({
    control,
    name: 'bidang',
  });

  const watchedValues = watch();

  // Generate No Ref
  const generateNoRef = useCallback(() => {
    if (noRef) return;

    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');

    const newNoRef = `RAB-${year}${month}${day}-${random}`;
    setNoRef(newNoRef);
  }, [noRef]);

  // Load existing data
  const loadExistingData = useCallback(async (rabId: string) => {
    try {
      setLoading(true);
      setError(null);

      if (!supabase) {
        throw new Error('Database not configured');
      }

      const { data: rab, error } = await (supabase as any)
        .from('rab_documents')
        .select('*')
        .eq('id', parseInt(rabId))
        .single();

      if (error) {
        throw new Error('Failed to load RAB data');
      }

      if (!rab) {
        throw new Error('RAB not found');
      }

      // Transform form data
      const formData: Partial<RABFormData> = {
        no_ref: rab.no_ref || '',
        project_name: rab.project_name || '',
        location: rab.location || '',
        bidang: rab.form_data?.bidang || [],
        perimeter: rab.form_data?.perimeter || 0,
        tinggi_lantai: rab.form_data?.tinggi_lantai || 0,
        panel_dinding_id: rab.form_data?.panel_dinding_id || '',
        panel_lantai_id: rab.form_data?.panel_lantai_id || '',
        hitung_dinding: rab.form_data?.hitung_dinding || false,
        hitung_lantai: rab.form_data?.hitung_lantai || false,
        status: rab.status || 'draft',
      };

      reset(formData);
      setNoRef(rab.no_ref || '');
    } catch (err) {
      console.error('Error loading RAB:', err);
      setError(err instanceof Error ? err.message : 'Failed to load RAB data');
    } finally {
      setLoading(false);
    }
  }, [reset]);

  // Save handler (draft save)
  const saveHandler = useCallback(async () => {
    if (!supabase) {
      alert('Database not configured');
      return;
    }

    const formData = watch();

    try {
      setLoading(true);

      const saveData = {
        no_ref: formData.no_ref,
        project_name: formData.project_name,
        location: formData.location,
        status: 'draft' as const,
        form_data: formData,
        total_cost: hasil.grandTotal || 0,
      };

      let result;
      if (isEdit && id) {
        // Update existing RAB
        const { data, error } = await (supabase as any)
          .from('rab_documents')
          .update(saveData as any)
          .eq('id', parseInt(id))
          .select()
          .single();

        if (error) throw error;
        result = { data };
      } else {
        // Create new RAB
        const { data, error } = await (supabase as any)
          .from('rab_documents')
          .insert([saveData] as any)
          .select()
          .single();

        if (error) throw error;
        result = { data };

        if (!isEdit) {
          router.push(`/rab/edit/${result.data.id}`);
        }
      }

      alert('Draft berhasil disimpan!');
    } catch (err) {
      console.error('Error saving:', err);
      alert('Gagal menyimpan draft: ' + (err as Error).message);
    } finally {
      setLoading(false);
    }
  }, [watch, hasil.grandTotal, isEdit, id, router]);

  // Submit handler (final submission)
  const onSubmit = useCallback(async (data: RABFormData) => {
    if (!supabase) {
      alert('Database not configured');
      return;
    }

    try {
      setLoading(true);

      const submitData = {
        no_ref: data.no_ref,
        project_name: data.project_name,
        location: data.location,
        status: (isEdit ? 'sent' : 'draft') as 'draft' | 'sent' | 'approved',
        form_data: data,
        total_cost: hasil.grandTotal || 0,
      };

      let result;
      if (isEdit && id) {
        // Update existing RAB
        const { data, error } = await (supabase as any)
          .from('rab_documents')
          .update(submitData as any)
          .eq('id', parseInt(id))
          .select()
          .single();

        if (error) throw error;
        result = { data };
        router.push(`/rab/${id}`);
      } else {
        // Create new RAB
        const { data, error } = await (supabase as any)
          .from('rab_documents')
          .insert([submitData] as any)
          .select()
          .single();

        if (error) throw error;
        result = { data };
        router.push(`/rab/${result.data.id}`);
      }

      alert(isEdit ? 'RAB berhasil diperbarui!' : 'RAB berhasil dibuat!');
    } catch (err) {
      console.error('Error submitting:', err);
      alert('Gagal mengirim RAB: ' + (err as Error).message);
    } finally {
      setLoading(false);
    }
  }, [hasil.grandTotal, isEdit, id, router]);

  // Add bidang field
  const tambahBidang = useCallback(() => {
    append({
      panjang: 0,
      lebar: 0,
    });
  }, [append]);

  // Initialize form on mount
  useEffect(() => {
    if (isEdit && id) {
      loadExistingData(id);
    } else if (!noRef && !loading) {
      generateNoRef();
    }
  }, [isEdit, id, noRef, loading, loadExistingData, generateNoRef]);

  return {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState,
    loading,
    error,
    noRefGenerated: Boolean(noRef),
    watchedValues,
    fields,
    remove,
    onSubmit,
    saveHandler,
    generateNoRef,
    loadExistingData,
    tambahBidang,
  };
}
