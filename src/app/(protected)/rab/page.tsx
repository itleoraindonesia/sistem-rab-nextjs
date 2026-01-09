"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Plus, FileDown } from "lucide-react";
import * as XLSX from "xlsx";
import { supabase } from "../../../lib/supabaseClient";
import RABTable from "../../../components/tables/RABTable";
import SearchBar from "../../../components/ui/SearchBar";
import { Card, CardContent } from "../../../components/ui";

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

  const exportToExcel = () => {
    const filteredData = dokumen.filter(
      (doc) =>
        (doc.project_name || "").toLowerCase().includes(search.toLowerCase()) ||
        (doc.location_kabupaten || "")
          .toLowerCase()
          .includes(search.toLowerCase()) ||
        (doc.no_ref || "").toLowerCase().includes(search.toLowerCase())
    );

    const exportData = filteredData.map((doc) => ({
      "No Ref": doc.no_ref || "-",
      "Proyek": doc.project_name,
      "Kabupaten": doc.location_kabupaten || "-",
      "Client": doc.client_profile?.nama || "-",
      "Total":
        doc.total !== null && doc.total !== undefined
          ? new Intl.NumberFormat("id-ID", {
              style: "currency",
              currency: "IDR",
              minimumFractionDigits: 0,
            }).format(doc.total)
          : "-",
      "Status": doc.status,
      "Tanggal": new Date(doc.created_at).toLocaleDateString("id-ID"),
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Dokumen RAB");

    XLSX.writeFile(
      workbook,
      `dokumen_rab_${new Date().toISOString().split("T")[0]}.xlsx`
    );
  };

  return (
    <div className='max-w-7xl mx-auto p-4 md:p-6'>
      {/* Header Section - Outside Card */}
      <div className='mb-4'>
        <div>
          <h1 className='text-xl md:text-2xl font-bold text-brand-primary'>
            Dokumen RAB
          </h1>
          <p className='text-gray-600 text-sm md:text-base'>
            Kelola semua penawaran Anda
          </p>
        </div>
      </div>

      {/* Search Bar - Outside Card */}
      <div className='mb-4 md:mb-6'>
        <SearchBar
          placeholder='Cari proyek, lokasi, atau no ref...'
          value={search}
          onChange={setSearch}
          className='w-full'
        />
      </div>

      {/* Action Buttons - Outside Card */}
      <div className='mb-6 flex gap-2 md:gap-4 md:justify-end'>
        <button
          onClick={exportToExcel}
          className='flex items-center justify-center gap-2 border border-gray-300 rounded-md btn-secondary w-1/3 md:flex-none md:w-48'
        >
          <FileDown size={16} />
          <span className='hidden sm:inline'>Export Excel</span>
          <span className='sm:hidden'>Export</span>
        </button>

        {/* Spacer untuk center alignment di mobile */}
        <div className='w-1/3 md:hidden'></div>

        <button
          onClick={() => router.push("/rab/baru")}
          className='flex items-center justify-center gap-2 bg-brand-primary hover:bg-brand-dark text-white px-3 py-2 md:px-4 md:py-2 rounded-lg text-sm md:text-base w-1/3 md:flex-none md:w-48'
        >
          <Plus size={16} />
          <span>Buat Baru</span>
        </button>
      </div>

      {/* Table Area - Inside Card Container */}
      <Card>
        <CardContent className='p-0'>
          {error ? (
            <div className='bg-red-50 border border-red-200 rounded-lg p-6 text-center m-6'>
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
        </CardContent>
      </Card>
    </div>
  );
}
