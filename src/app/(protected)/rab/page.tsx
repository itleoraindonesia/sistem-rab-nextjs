"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { supabase } from "../../../lib/supabaseClient";
import RABTable from "../../../components/tables/RABTable";

export default function ListRAB() {
  const [dokumen, setDokumen] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Fetch data RAB - Live from Supabase only
  const loadDokumen = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      if (!supabase) {
        throw new Error(
          "Supabase client tidak tersedia. Periksa konfigurasi environment variables."
        );
      }

      const { data: documentsData, error: documentsError } = await supabase
        .from("rab_documents")
        .select(
          "id, no_ref, project_name, location_kabupaten, client_profile, status, total, created_at"
        )
        .is("deleted_at", null)
        .order("created_at", { ascending: false });

      if (documentsError) {
        console.error(
          "Error fetching documents from Supabase:",
          documentsError
        );
        throw new Error(
          `Database error: ${documentsError.message || "Unknown error"}`
        );
      }

      // Set data langsung dari database (bisa kosong array)
      setDokumen(documentsData || []);
    } catch (err) {
      console.error("Gagal load dokumen:", err);
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Terjadi kesalahan yang tidak diketahui";
      setError(errorMessage);
      setDokumen([]); // Pastikan array kosong saat error
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDokumen();
  }, [loadDokumen]);

  const handleDelete = async (
    id: string,
    projectName: string,
    status?: string
  ) => {
    // Check if document can be deleted
    if (status === "approved") {
      alert("Dokumen yang sudah disetujui tidak dapat dihapus.");
      return;
    }

    if (!confirm(`Hapus dokumen "${projectName}"?`)) return;

    try {
      setLoading(true);

      if (supabase) {
        // Soft delete: set deleted_at instead of hard delete
        const { error } = await (supabase as any)
          .from("rab_documents")
          .update({ deleted_at: new Date().toISOString() })
          .eq("id", id);

        if (error) throw error;
      }

      alert("Dokumen berhasil dihapus");
      loadDokumen(); // refresh list
    } catch (err) {
      console.error("Gagal hapus:", err);
      alert("Gagal menghapus: " + (err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='max-w-7xl mx-auto p-4 md:p-6'>
      <div className='mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4'>
        <div>
          <h1 className='text-xl md:text-2xl font-bold text-brand-primary'>
            Dokumen RAB
          </h1>
          <p className='text-gray-600 text-sm md:text-base'>
            Kelola semua penawaran Anda
          </p>
        </div>

        <button
          onClick={() => router.push("/rab/baru")}
          className='flex items-center gap-2  bg-brand-primary hover:bg-brand-dark text-white px-3 py-2 md:px-4 md:py-2 rounded-lg text-sm md:text-base'
        >
          <Plus size={16} />
          <span>Buat Baru</span>
        </button>
      </div>

      {error ? (
        <div className='bg-red-50 border border-red-200 rounded-lg p-6 text-center'>
          <div className='text-red-600 text-4xl mb-4'>⚠️</div>
          <h3 className='text-lg font-medium text-red-900 mb-2'>
            Gagal Memuat Data
          </h3>
          <p className='text-red-700 mb-4'>{error}</p>
          <button
            onClick={loadDokumen}
            className='bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg'
          >
            Coba Lagi
          </button>
        </div>
      ) : (
        <RABTable
          data={dokumen}
          loading={loading}
          search={search}
          onSearchChange={setSearch}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
}
