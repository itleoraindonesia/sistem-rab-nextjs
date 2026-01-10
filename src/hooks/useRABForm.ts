import { useState, useEffect, useCallback, useMemo } from "react";
import { useForm, useFieldArray, FieldArrayWithId } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { RABFormData, rabSchema } from "../schemas/rabSchema";
import { useRouter } from "next/navigation";
import { supabase } from "../lib/supabaseClient";
import { useRABCalculation } from "./useRABCalculation";
import { useMasterData } from "../context/MasterDataContext";

interface UseRABFormResult {
  register: any;
  control: any;
  handleSubmit: any;
  watch: any;
  setValue: any;
  reset: any;
  formState: any;
  loading: boolean;
  error: string | null;
  noRefGenerated: boolean;
  hasil: any; // Add hasil to return interface
  onSubmit: (data: RABFormData, hasil?: any) => Promise<{ id: string } | void>;
  saveHandler: (hasil?: any) => Promise<void>;
  generateNoRef: () => void;
}

export function useRABForm(): UseRABFormResult {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [noRef, setNoRef] = useState("");

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
      wasteFactor: 1.05,
      jointFactorDinding: 2.5,
      jointFactorLantai: 1.8,
      upahPasang: 50000,
      hargaJoint: 2500,
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

  // Generate No Ref
  const generateNoRef = useCallback(async () => {
    if (noRef) return;

    try {
      // Count all existing documents
      const { count, error } = await (supabase as any)
        .from("rab_documents")
        .select("*", { count: "exact", head: true });

      if (error) throw error;

      // Sequential number = total documents + 1
      const urut = (count || 0) + 1;

      // Format: 003/SPB/LEORA/XII/2025 (3 digits with leading zeros)
      const romanMonths = [
        "I",
        "II",
        "III",
        "IV",
        "V",
        "VI",
        "VII",
        "VIII",
        "IX",
        "X",
        "XI",
        "XII",
      ];
      const now = new Date();
      const romanMonth = romanMonths[now.getMonth()];

      const newNoRef = `${urut
        .toString()
        .padStart(3, "0")}/SPB/LEORA/${romanMonth}/${now.getFullYear()}`;

      setNoRef(newNoRef);
      setValue("no_ref", newNoRef); // Set the form field
    } catch (err) {
      console.error("Error generate no_ref:", err);
      // Fallback: use date and random number
      const romanMonths = [
        "I",
        "II",
        "III",
        "IV",
        "V",
        "VI",
        "VII",
        "VIII",
        "IX",
        "X",
        "XI",
        "XII",
      ];
      const now = new Date();
      const romanMonth = romanMonths[now.getMonth()];
      const randomNum = Math.floor(Math.random() * 900) + 100; // 100-999
      const fallbackNoRef = `${randomNum}/SPB/LEORA/${romanMonth}/${now.getFullYear()}`;

      setNoRef(fallbackNoRef);
      setValue("no_ref", fallbackNoRef); // Set the form field
    }
  }, [noRef]); // Remove setValue from deps

  // Save handler (draft save)
  const saveHandler = useCallback(
    async (hasil?: any) => {
      if (!supabase) {
        alert("Database not configured");
        return;
      }

      const formData = watch();

      try {
        setLoading(true);

        const saveData = {
          no_ref: formData.no_ref,
          project_name: formData.project_name,
          location_provinsi: formData.location_provinsi,
          location_kabupaten: formData.location_kabupaten,
          location_address: formData.location_address,
          status: "draft" as const,
          snapshot: {
            ...formData,
            items: hasil?.items || [], // Include items in snapshot
            total: hasil?.grandTotal || 0,
          },
          total: hasil?.grandTotal || 0, // Use total instead of total_cost
        };

        // #region agent log
        if (typeof window !== "undefined") {
          fetch(
            "http://127.0.0.1:7242/ingest/49f537d8-251b-4d1b-9021-92d0eb2d1e91",
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                sessionId: "debug-session",
                runId: "kabupaten-save",
                hypothesisId: "K1",
                location: "useRABForm.ts:211",
                message: "Saving new RAB draft - payload",
                data: {
                  no_ref: formData.no_ref,
                  project_name: formData.project_name,
                  location_provinsi: formData.location_provinsi,
                  location_kabupaten: formData.location_kabupaten,
                  location_address: formData.location_address,
                  saveDataKeys: Object.keys(saveData),
                },
                timestamp: Date.now(),
              }),
            }
          ).catch(() => {});
        }
        // #endregion

        // Create new RAB draft
        const { data, error } = await (supabase as any)
          .from("rab_documents")
          .insert([saveData] as any)
          .select()
          .single();

        if (error) throw error;

        // Redirect to edit page for the draft
        router.push(`/rab/edit/${data.id}`);
        alert("Draft berhasil disimpan!");
      } catch (err) {
        console.error("Error saving:", err);
        alert("Gagal menyimpan draft: " + (err as Error).message);
      } finally {
        setLoading(false);
      }
    },
    [watch, router]
  );

  // Submit handler (final submission)
  const onSubmit = useCallback(
    async (data: RABFormData, hasil?: any) => {
      if (!supabase) {
        alert("Database not configured");
        return;
      }

      try {
        setLoading(true);

        const submitData = {
          no_ref: data.no_ref,
          project_name: data.project_name,
          location_provinsi: data.location_provinsi,
          location_kabupaten: data.location_kabupaten,
          location_address: data.location_address,
          status: "draft" as "draft" | "sent" | "approved",
          snapshot: {
            ...data,
            items: hasil?.items || [], // Include items in snapshot
            total: hasil?.grandTotal || 0,
          },
          total: hasil?.grandTotal || 0, // Use total instead of total_cost
        };

        // #region agent log
        if (typeof window !== "undefined") {
          fetch(
            "http://127.0.0.1:7242/ingest/49f537d8-251b-4d1b-9021-92d0eb2d1e91",
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                sessionId: "debug-session",
                runId: "kabupaten-submit",
                hypothesisId: "K1",
                location: "useRABForm.ts:256",
                message: "Submitting new RAB - payload",
                data: {
                  no_ref: data.no_ref,
                  project_name: data.project_name,
                  location_provinsi: data.location_provinsi,
                  location_kabupaten: data.location_kabupaten,
                  location_address: data.location_address,
                  submitDataKeys: Object.keys(submitData),
                },
                timestamp: Date.now(),
              }),
            }
          ).catch(() => {});
        }
        // #endregion

        // Create new RAB
        const { data: result, error } = await (supabase as any)
          .from("rab_documents")
          .insert([submitData] as any)
          .select()
          .single();

        if (error) throw error;

        // Return the created record ID for redirect logic
        return { id: result.id };
      } catch (err) {
        console.error("Error submitting:", err);
        alert("Gagal membuat RAB: " + (err as Error).message);
      } finally {
        setLoading(false);
      }
    },
    [router]
  );

  // Add bidang field
  const tambahBidang = useCallback(() => {
    append({
      panjang: 0,
      lebar: 0,
    });
  }, [append]);

  // Initialize form on mount
  useEffect(() => {
    if (!noRef && !loading) {
      generateNoRef();
    }
  }, [noRef, loading, generateNoRef]);

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
    hasil, // Add hasil to return
    onSubmit,
    saveHandler,
    generateNoRef,
  };
}
