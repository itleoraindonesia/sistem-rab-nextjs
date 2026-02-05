import { useState, useEffect, useCallback, useMemo } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { RABFormData, rabSchema } from "../schemas/rabSchema";
import { useRouter } from "next/navigation";
import { supabase } from "../lib/supabaseClient";
import { useRABCalculation } from "./useRABCalculation";
import { useMasterData } from "../context/MasterDataContext";

interface UseRABEditResult {
  register: any;
  control: any;
  handleSubmit: any;
  watch: any;
  setValue: any;
  reset: any;
  formState: any;
  loading: boolean;
  error: string | null;
  documentId: string | null;
  originalStatus: 'draft' | 'sent' | 'approved';
  hasil: any;
  onSubmit: (data: RABFormData, hasil?: any) => Promise<void>;
  saveHandler: (hasil?: any) => Promise<void>;
  deleteHandler: () => Promise<void>;
}

export function useRABEdit(id: string): UseRABEditResult {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [documentId, setDocumentId] = useState<string | null>(id);
  const [initialData, setInitialData] = useState<RABFormData | null>(null);

  // Get master data for calculations
  const {
    panels,
    ongkir,
    parameters,
    loading: masterLoading,
  } = useMasterData();

  const { register, control, handleSubmit, watch, setValue, reset, formState } =
    useForm({
      resolver: zodResolver(rabSchema),
      defaultValues: {
        no_ref: "",
        project_name: "",
        location_provinsi: "",
        location_kabupaten: "",
        location_address: "",
        client_profile: {
          nama: "",
          no_hp: "",
          email: "",
        },
        project_profile: {
          kategori: "",
          deskripsi: "",
        },
        estimasi_pengiriman: "",
        bidang: [],
        perimeter: undefined,
        tinggi_lantai: undefined,
        panel_dinding_id: "",
        panel_lantai_id: "",
        hitung_dinding: false,
        hitung_lantai: false,
        status: "draft" as const,
      },
      mode: "onChange",
    });

  const { errors, isSubmitting, isValid } = formState;

  const { fields, append, remove } = useFieldArray({
    control,
    name: "bidang",
  });

  const watchedValues = watch();

  // Stabilize panels and ongkir to prevent unnecessary re-renders
  const stablePanels = useMemo(() => panels, [JSON.stringify(panels)]);
  const stableOngkir = useMemo(() => ongkir, [JSON.stringify(ongkir)]);

  // Stabilize calculation parameters
  const calculationParameters = useMemo(
    () => ({
      wasteFactor: 1.1,
      upahPasang: 200000,
      hargaJoint: 2300,
    }),
    []
  );

  // Import calculation hook with stable dependencies
  const { hasil, calculateRAB, setHasil } = useRABCalculation(
    stablePanels,
    stableOngkir,
    calculationParameters,
    false
  );

  // Only calculate when specific fields change (not all watched values)
  const calculationDeps = JSON.stringify({
    perimeter: watchedValues.perimeter,
    tinggi_lantai: watchedValues.tinggi_lantai,
    bidang: watchedValues.bidang,
    hitung_dinding: watchedValues.hitung_dinding,
    hitung_lantai: watchedValues.hitung_lantai,
    location_kabupaten: watchedValues.location_kabupaten,
    panel_dinding_id: watchedValues.panel_dinding_id,
    panel_lantai_id: watchedValues.panel_lantai_id,
  });

  // Memoized calculation result to prevent infinite loops
  const calculationResult = useMemo(() => {
    if (!stablePanels.length || !watchedValues) return null;

    // Always calculate, but result might be empty
    return calculateRAB(watchedValues as Partial<RABFormData>);
  }, [calculationDeps, stablePanels, calculateRAB]);

  // Direct effect to update hasil (real-time) - only if calculationResult changed
  useEffect(() => {
    if (calculationResult) {
      setHasil(calculationResult);
    }
  }, [calculationResult]); // Remove setHasil from deps

  // Load existing document data
  useEffect(() => {
    const loadDocument = async () => {
      if (!id || !supabase) {
        setError("Invalid document ID or database not configured");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const { data, error } = await supabase
          .from("rab_documents")
          .select("*")
          .eq("id", id)
          .single();

        if (error) throw error;

        // Type assertion for Supabase response
        const doc = data as any;

        // Extract form data from snapshot or legacy fields
        const snapshot = doc.snapshot || {};
        const formData = {
          no_ref: doc.no_ref || "",
          project_name: doc.project_name || "",
          location_provinsi:
            snapshot.location_provinsi || doc.location_provinsi || "",
          location_kabupaten:
            snapshot.location_kabupaten || doc.location_kabupaten || "",
          location_address:
            snapshot.location_address || doc.location_address || "",
          client_profile: {
            nama: (snapshot.client_profile || doc.client_profile || {}).nama || "",
            no_hp: (snapshot.client_profile || doc.client_profile || {}).no_hp || "",
            email: (snapshot.client_profile || doc.client_profile || {}).email || "",
          },
          project_profile: {
            kategori: (snapshot.project_profile || doc.project_profile || {}).kategori || "",
            deskripsi: (snapshot.project_profile || doc.project_profile || {}).deskripsi || "",
          },
          estimasi_pengiriman:
            snapshot.estimasi_pengiriman || doc.estimasi_pengiriman || "",
          bidang: snapshot.bidang || doc.bidang || [],
          perimeter: snapshot.perimeter || doc.perimeter || undefined,
          tinggi_lantai: snapshot.tinggi_lantai || doc.tinggi_lantai || undefined,
          panel_dinding_id:
            snapshot.panel_dinding_id || doc.panel_dinding_id || "",
          panel_lantai_id:
            snapshot.panel_lantai_id || doc.panel_lantai_id || "",
          hitung_dinding: Boolean(
            snapshot.panel_dinding_id || doc.panel_dinding_id
          ),
          hitung_lantai: Boolean(
            snapshot.panel_lantai_id || doc.panel_lantai_id
          ),
          status: doc.status || "draft",
        };

        setInitialData(formData);
        reset(formData);
        setDocumentId(doc.id);
      } catch (err) {
        console.error("Error loading document:", err);
        setError(
          "Gagal memuat dokumen: " +
            (err instanceof Error ? err.message : String(err))
        );
      } finally {
        setLoading(false);
      }
    };

    loadDocument();
  }, [id, reset]);

  // Save handler (draft update)
  const saveHandler = useCallback(
    async (hasil?: any) => {
      if (!supabase || !documentId) {
        alert("Database not configured or document ID missing");
        return;
      }

      const formData = watch();

      try {
        setLoading(true);

        const updateData = {
          no_ref: formData.no_ref,
          project_name: formData.project_name,
          location_provinsi: formData.location_provinsi,
          location_kabupaten: formData.location_kabupaten,
          status: "draft" as const,
          snapshot: {
            ...formData,
            items: hasil?.items || [],
            total: hasil?.grandTotal || 0,
          },
          total: hasil?.grandTotal || 0,
        };



        // Update existing RAB draft
        const { error } = await (supabase as any)
          .from("rab_documents")
          .update(updateData)
          .eq("id", documentId);

        if (error) throw error;

        alert("Draft berhasil diperbarui!");
      } catch (err) {
        console.error("Error updating:", err);
        alert("Gagal memperbarui draft: " + (err as Error).message);
      } finally {
        setLoading(false);
      }
    },
    [watch, documentId]
  );

  // Submit handler (final update)
  const onSubmit = useCallback(
    async (data: RABFormData, hasil?: any) => {
      if (!supabase || !documentId) {
        alert("Database not configured or document ID missing");
        return;
      }

      try {
        setLoading(true);

        const updateData = {
          no_ref: data.no_ref,
          project_name: data.project_name,
          location_provinsi: data.location_provinsi,
          location_kabupaten: data.location_kabupaten,
          status: data.status as "draft" | "sent" | "approved",
          snapshot: {
            ...data,
            items: hasil?.items || [],
            total: hasil?.grandTotal || 0,
          },
          total: hasil?.grandTotal || 0,
        };



        // Update existing RAB
        const { error } = await (supabase as any)
          .from("rab_documents")
          .update(updateData)
          .eq("id", documentId);

        if (error) throw error;

        // Component will handle redirect logic
      } catch (err) {
        console.error("Error updating:", err);
        alert("Gagal memperbarui RAB: " + (err as Error).message);
      } finally {
        setLoading(false);
      }
    },
    [router, documentId]
  );

  // Delete handler (soft delete)
  const deleteHandler = useCallback(async () => {
    if (!supabase || !documentId) {
      alert("Database not configured or document ID missing");
      return;
    }

    // Check document status first
    try {
      const { data: doc, error: fetchError } = await (supabase as any)
        .from("rab_documents")
        .select("status")
        .eq("id", documentId)
        .single();

      if (fetchError) throw fetchError;

      if ((doc as any).status === "approved") {
        alert("Dokumen yang sudah disetujui tidak dapat dihapus.");
        return;
      }

      if (!confirm("Hapus dokumen ini? Dokumen akan disembunyikan dan dapat dikembalikan.")) return;

      // Soft delete: set deleted_at instead of hard delete
      const { error } = await (supabase as any)
        .from("rab_documents")
        .update({ deleted_at: new Date().toISOString() })
        .eq("id", documentId);

      if (error) throw error;

      alert("Dokumen berhasil dihapus (disembunyikan)");
      router.push("/rab");
    } catch (err) {
      console.error("Error deleting document:", err);
      alert("Gagal menghapus dokumen: " + (err as Error).message);
    }
  }, [router, documentId]);

  // Add bidang field
  const tambahBidang = useCallback(() => {
    append({
      panjang: 0,
      lebar: 0,
    });
  }, [append]);

  return {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState,
    loading: loading || masterLoading,
    error,
    documentId,
    originalStatus: initialData?.status || 'draft',
    hasil,
    onSubmit,
    saveHandler,
    deleteHandler,
  };
}
