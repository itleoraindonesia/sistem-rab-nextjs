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
    useForm<RABFormData>({
      defaultValues: {
        no_ref: "",
        project_name: "",
        location: "",
        bidang: [],
        perimeter: 0,
        tinggi_lantai: 0,
        panel_dinding_id: "",
        panel_lantai_id: "",
        hitung_dinding: false,
        hitung_lantai: false,
        status: "draft",
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
  const calculationParameters = useMemo(() => ({
    wasteFactor: 1.05,
    jointFactorDinding: 2.5,
    jointFactorLantai: 1.8,
    upahPasang: 50000,
    hargaJoint: 2500,
  }), []);
  
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
    location: watchedValues.location,
    panel_dinding_id: watchedValues.panel_dinding_id,
    panel_lantai_id: watchedValues.panel_lantai_id,
  });

  // Memoized calculation result to prevent infinite loops
  const calculationResult = useMemo(() => {
    if (!stablePanels.length || !watchedValues) return null;

    // Always calculate, but result might be empty
    return calculateRAB(watchedValues);
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
        const formData: RABFormData = {
          no_ref: doc.no_ref || "",
          project_name: doc.project_name || "",
          location: doc.location || "",
          bidang: snapshot.bidang || doc.bidang || [],
          perimeter: snapshot.perimeter || doc.perimeter || 0,
          tinggi_lantai: snapshot.tinggi_lantai || doc.tinggi_lantai || 0,
          panel_dinding_id: snapshot.panel_dinding_id || doc.panel_dinding_id || "",
          panel_lantai_id: snapshot.panel_lantai_id || doc.panel_lantai_id || "",
          hitung_dinding: Boolean(snapshot.panel_dinding_id || doc.panel_dinding_id),
          hitung_lantai: Boolean(snapshot.panel_lantai_id || doc.panel_lantai_id),
          status: doc.status || "draft",
        };

        setInitialData(formData);
        reset(formData);
        setDocumentId(doc.id);
      } catch (err) {
        console.error("Error loading document:", err);
        setError("Gagal memuat dokumen: " + (err instanceof Error ? err.message : String(err)));
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
          location: formData.location,
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
          location: data.location,
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

        router.push(`/rab/${documentId}`);
        alert("RAB berhasil diperbarui!");
      } catch (err) {
        console.error("Error updating:", err);
        alert("Gagal memperbarui RAB: " + (err as Error).message);
      } finally {
        setLoading(false);
      }
    },
    [router, documentId]
  );

  // Delete handler
  const deleteHandler = useCallback(async () => {
    if (!supabase || !documentId) {
      alert("Database not configured or document ID missing");
      return;
    }

    if (!confirm("Hapus dokumen ini? Tindakan tidak bisa dibatalkan.")) return;

    try {
      const { error } = await supabase
        .from("rab_documents")
        .delete()
        .eq("id", documentId);

      if (error) throw error;

      alert("Dokumen berhasil dihapus");
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
    hasil,
    onSubmit,
    saveHandler,
    deleteHandler,
  };
}
