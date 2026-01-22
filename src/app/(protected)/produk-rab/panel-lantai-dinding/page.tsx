"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Plus, FileDown, AlertTriangle } from "lucide-react";
import * as XLSX from "xlsx";
import { supabase } from "@/lib/supabaseClient";
import { RABDataTable } from "@/components/tables/RABDataTable";
import { Card, CardContent } from "@/components/ui";
import Button from "@/components/ui/Button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { getCurrentWIBISO } from "@/lib/utils/dateUtils";

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
          "id, no_ref, project_name, location_kabupaten, client_profile, snapshot, status, total, created_at"
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
          .update({ deleted_at: getCurrentWIBISO() })
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
    <div className="container mx-auto">
      <div className="space-y-6">
        {/* Header */}
        <div className='mb-4'>
          <h1 className='text-2xl font-bold text-brand-primary'>Panel Lantai & Dinding</h1>
          <p className='text-gray-600'>Kelola dokumen RAB panel lantai dan dinding</p>
        </div>

        {/* Statistik */}
        <div className='grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-8'>
          {[
            {
              name: "Total Dokumen",
              value: dokumen.length,
              bgColor: "bg-blue-50",
              textColor: "text-blue-800",
              dotColor: "text-blue-500",
            },
            {
              name: "Draft",
              value: dokumen.filter(d => d.status === "draft").length,
              bgColor: "bg-yellow-50",
              textColor: "text-yellow-800",
              dotColor: "text-yellow-500",
            },
            {
              name: "Terkirim",
              value: dokumen.filter(d => d.status === "sent").length,
              bgColor: "bg-indigo-50",
              textColor: "text-indigo-800",
              dotColor: "text-indigo-500",
            },
            {
              name: "Disetujui",
              value: dokumen.filter(d => d.status === "approved").length,
              bgColor: "bg-green-50",
              textColor: "text-green-800",
              dotColor: "text-green-500",
            },
          ].map((stat) => (
            <div
              key={stat.name}
              className={`${stat.bgColor} rounded-lg shadow p-4 md:p-6 border border-gray-100`}
            >
              <div className='flex items-center justify-between'>
                <div>
                  <p
                    className={`text-xs md:text-sm font-medium ${stat.textColor}`}
                  >
                    {stat.name}
                  </p>
                  <p className='text-xl md:text-2xl font-bold text-gray-900'>
                    {stat.value}
                  </p>
                </div>
                <div className={`text-sm font-medium ${stat.dotColor}`}>•</div>
              </div>
            </div>
          ))}
        </div>

        {/* Actions Row */}
        <div className="flex flex-col gap-4 sm:flex-row sm:justify-end">
          <Button variant="outline" onClick={exportToExcel}>
            <FileDown className="mr-2 h-4 w-4" />
            Export Excel
          </Button>
          <Button onClick={() => router.push("/produk-rab/baru")}>
            <Plus className="mr-2 h-4 w-4" />
            Buat Baru
          </Button>
        </div>

        {/* Table */}
        <Card>
          <CardContent className="p-0">
            {error ? (
              <div className="p-6">
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Gagal Memuat Data</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                  <Button
                    variant="outline"
                    onClick={loadDokumen}
                    className="mt-4"
                  >
                    Coba Lagi
                  </Button>
                </Alert>
              </div>
            ) : (
              <RABDataTable
                data={dokumen}
                loading={loading}
                onDelete={handleDelete}
              />
            )}

          </CardContent>
        </Card>
      </div>
    </div>
  );
}
