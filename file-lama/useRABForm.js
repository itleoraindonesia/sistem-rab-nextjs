import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useFormContext } from "../App";
import supabase from "../lib/supabaseClient";
import { rabSchema } from "../schemas/rabSchema";

export function useRABForm(id, panels, hasil, parameters) {
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  const { setFormSaveHandler, updateFormValidity } = useFormContext();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [noRefGenerated, setNoRefGenerated] = useState("");

  // RHF Setup
  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting, isValid },
  } = useForm({
    resolver: zodResolver(rabSchema),
    mode: "onChange",
    defaultValues: {
      no_ref: "",
      project_name: "",
      location: "",
      bidang: [{ panjang: 0, lebar: 0 }],
      perimeter: 0,
      tinggi_lantai: 0,
      panel_dinding_id: "",
      panel_lantai_id: "",
      hitung_dinding: false,
      hitung_lantai: false,
      status: "draft",
    },
  });

  // Update form validity in App context when isValid, loading, or error changes
  useEffect(() => {
    if (updateFormValidity) {
      // Form is valid jika tidak loading, tidak error, dan form dari react-hook-form valid
      const isFormValid = !loading && !error && isValid;
      updateFormValidity(isFormValid);
    }
  }, [loading, error, updateFormValidity, isValid]);

  // Watch form values for calculations
  const watchedValues = watch();
  const { fields, append, remove } = useFieldArray({
    control,
    name: "bidang",
  });

  // Define onSubmit first, before it's used by saveHandler
  const onSubmit = useCallback(
    async (formData) => {
      setLoading(true);

      try {
        // Validasi panel sebelum save
        const validPanelDinding = formData.hitung_dinding
          ? panels.find((p) => p.id === formData.panel_dinding_id)
          : null;
        const validPanelLantai = formData.hitung_lantai
          ? panels.find((p) => p.id === formData.panel_lantai_id)
          : null;

        // Cek validasi panel
        if (formData.hitung_dinding && !validPanelDinding) {
          alert(
            "Panel dinding yang dipilih tidak tersedia. Silakan pilih panel yang valid."
          );
          setLoading(false);
          return;
        }

        if (formData.hitung_lantai && !validPanelLantai) {
          alert(
            "Panel lantai yang dipilih tidak tersedia. Silakan pilih panel yang valid."
          );
          setLoading(false);
          return;
        }

        // Siapkan data
        const data = {
          no_ref: formData.no_ref,
          project_name: formData.project_name,
          location: formData.location,
          bidang: formData.bidang,
          perimeter: formData.perimeter || 0,
          tinggi_lantai: formData.tinggi_lantai || 0,
          panel_dinding_id: validPanelDinding
            ? formData.panel_dinding_id
            : null,
          panel_lantai_id: validPanelLantai ? formData.panel_lantai_id : null,
          status: formData.status,
          updated_at: new Date().toISOString(),
          total: hasil?.grandTotal || 0,
        };

        // Jika status bukan draft, buat snapshot
        if (formData.status !== "draft" && hasil) {
          data.snapshot = {
            panel_dinding: validPanelDinding
              ? {
                  name: validPanelDinding.name,
                  harga: validPanelDinding.harga,
                  luasPerLembar: validPanelDinding.luasPerLembar || 1.8,
                }
              : null,
            panel_lantai: validPanelLantai
              ? {
                  name: validPanelLantai.name,
                  harga: validPanelLantai.harga,
                  luasPerLembar: validPanelLantai.luasPerLembar || 1.8,
                }
              : null,
            upahPasang: parameters.upahPasang,
            hargaJoint: parameters.hargaJoint,
            wasteFactor: parameters.wasteFactor,
            total: hasil.grandTotal,
            items: hasil.items,
          };
        }

        let result;
        if (isEdit) {
          // Update existing document
          result = await supabase
            .from("rab_documents")
            .update(data)
            .eq("id", id)
            .select();
        } else {
          // Create new document
          data.created_at = new Date().toISOString();
          result = await supabase.from("rab_documents").insert(data).select();
        }

        if (result.error) throw result.error;

        alert(isEdit ? "Berhasil diperbarui!" : "Berhasil disimpan!");
        // Navigasi langsung tanpa refresh data master yang tidak perlu
        navigate("/rab");
      } catch (err) {
        console.error("Gagal simpan:", err);
        alert("Gagal menyimpan: " + err.message);
      } finally {
        setLoading(false);
      }
    },
    [panels, hasil, parameters, isEdit, id, navigate]
  );

  // Define saveHandler setelah onSubmit didefinisikan
  const saveHandler = useCallback(() => {
    handleSubmit(onSubmit)();
  }, [handleSubmit, onSubmit]);

  // Register save handler for navbar
  useEffect(() => {
    setFormSaveHandler(() => saveHandler);
    return () => setFormSaveHandler(null);
  }, [saveHandler, setFormSaveHandler]);

  // Generate no_ref untuk dokumen baru
  const generateNoRef = useCallback(async () => {
    try {
      // Ambil semua dokumen untuk menghitung total
      const { count, error } = await supabase
        .from("rab_documents")
        .select("*", { count: "exact", head: true });

      if (error) throw error;

      // Nomor urut = total dokumen + 1
      const urut = (count || 0) + 1;

      // Format: 003/SPB/LEORA/XII/2025 (3 digit dengan leading zeros)
      const bulanRomawi = [
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
      const noRef = `${urut.toString().padStart(3, "0")}/SPB/LEORA/${
        bulanRomawi[now.getMonth()]
      }/${now.getFullYear()}`;

      setValue("no_ref", noRef);
      setNoRefGenerated(noRef);
    } catch (err) {
      console.error("Error generate no_ref:", err);
      // Fallback: gunakan tanggal dan random number
      const bulanRomawi = [
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
      const randomNum = Math.floor(Math.random() * 900) + 100; // 100-999
      const fallbackNoRef = `${randomNum}/SPB/LEORA/${
        bulanRomawi[now.getMonth()]
      }/${now.getFullYear()}`;

      setValue("no_ref", fallbackNoRef);
      setNoRefGenerated(fallbackNoRef);
    }
  }, [setValue]);

  // Load existing data for edit mode
  const loadExistingData = useCallback(
    async (docId) => {
      try {
        setLoading(true);
        setError(null);

        const { data, error } = await supabase
          .from("rab_documents")
          .select("*")
          .eq("id", docId)
          .single();

        if (error) throw error;
        if (!data) throw new Error("Dokumen tidak ditemukan");

        // Reset form with existing data
        const formData = {
          no_ref: data.no_ref || "",
          project_name: data.project_name || "",
          location: data.location || "",
          bidang:
            data.bidang && Array.isArray(data.bidang) && data.bidang.length > 0
              ? data.bidang
              : [{ panjang: 0, lebar: 0 }],
          perimeter: data.perimeter || 0,
          tinggi_lantai: data.tinggi_lantai || 0,
          panel_dinding_id: data.panel_dinding_id || "",
          panel_lantai_id: data.panel_lantai_id || "",
          hitung_dinding: Boolean(data.panel_dinding_id),
          hitung_lantai: Boolean(data.panel_lantai_id),
          status: data.status || "draft",
        };

        // Use reset to set the entire form at once
        reset(formData);
        setNoRefGenerated(data.no_ref);
      } catch (err) {
        console.error("Error loading existing data:", err);
        setError("Gagal memuat data: " + err.message);
      } finally {
        setLoading(false);
      }
    },
    [reset]
  );

  // Add bidang field
  const tambahBidang = () => {
    append({ panjang: 0, lebar: 0 });
  };

  return {
    // Form state
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting, isValid },

    // Custom state
    loading,
    error,
    noRefGenerated,
    watchedValues,
    fields,
    remove,

    // Actions
    onSubmit,
    saveHandler,
    generateNoRef,
    loadExistingData,
    tambahBidang,
  };
}
