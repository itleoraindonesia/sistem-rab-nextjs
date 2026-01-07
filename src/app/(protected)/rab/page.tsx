"use client";

import { useState, useCallback, useMemo, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, FileDown, Plus, Search } from "lucide-react";
import * as XLSX from "xlsx";
import { supabase } from "../../../lib/supabaseClient";

export default function ListRAB() {
  const [dokumen, setDokumen] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Fetch data RAB
  const loadDokumen = useCallback(async () => {
    setLoading(true);
    try {
      if (supabase) {
        // Load documents directly from Supabase (exclude soft deleted)
        const { data: documentsData, error: documentsError } = await supabase
          .from("rab_documents")
          .select("*")
          .is("deleted_at", null)
          .order("created_at", { ascending: false });

        if (documentsError) {
          console.error(
            "Error fetching documents from Supabase:",
            documentsError
          );
        } else {
          // Use database data if available, otherwise fallback to mock data
          setDokumen(
            documentsData && documentsData.length > 0
              ? documentsData
              : [
                  {
                    id: 1,
                    no_ref: "RAB-001",
                    project_name: "Proyek Gedung A",
                    location: "Jakarta",
                    status: "draft",
                    total: 150000000,
                    created_at: "2024-01-15T10:00:00Z",
                  },
                  {
                    id: 2,
                    no_ref: "RAB-002",
                    project_name: "Renovasi Kantor B",
                    location: "Bandung",
                    status: "sent",
                    total: 75000000,
                    created_at: "2024-01-10T10:00:00Z",
                  },
                  {
                    id: 3,
                    no_ref: "RAB-003",
                    project_name: "Pembangunan Warehouse",
                    location: "Surabaya",
                    status: "approved",
                    total: 200000000,
                    created_at: "2024-01-05T10:00:00Z",
                  },
                ]
          );
        }
      } else {
        // Supabase not configured, use fallback data
        console.log("Supabase not configured, using fallback data");
        setDokumen([
          {
            id: 1,
            no_ref: "RAB-001",
            project_name: "Proyek Gedung A",
            location: "Jakarta",
            status: "draft",
            total: 150000000,
            created_at: "2024-01-15T10:00:00Z",
          },
          {
            id: 2,
            no_ref: "RAB-002",
            project_name: "Renovasi Kantor B",
            location: "Bandung",
            status: "sent",
            total: 75000000,
            created_at: "2024-01-10T10:00:00Z",
          },
          {
            id: 3,
            no_ref: "RAB-003",
            project_name: "Pembangunan Warehouse",
            location: "Surabaya",
            status: "approved",
            total: 200000000,
            created_at: "2024-01-05T10:00:00Z",
          },
        ]);
      }
    } catch (err) {
      console.error("Gagal load dokumen:", err);
      // Fallback to mock data if everything fails
      setDokumen([
        {
          id: 1,
          no_ref: "RAB-001",
          project_name: "Proyek Gedung A",
          location: "Jakarta",
          status: "draft",
          total: 150000000,
          created_at: "2024-01-15T10:00:00Z",
        },
        {
          id: 2,
          no_ref: "RAB-002",
          project_name: "Renovasi Kantor B",
          location: "Bandung",
          status: "sent",
          total: 75000000,
          created_at: "2024-01-10T10:00:00Z",
        },
        {
          id: 3,
          no_ref: "RAB-003",
          project_name: "Pembangunan Warehouse",
          location: "Surabaya",
          status: "approved",
          total: 200000000,
          created_at: "2024-01-05T10:00:00Z",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDokumen();
  }, [loadDokumen]);

  const filteredDokumen = useMemo(() => {
    const searchTerm = (search || "").toLowerCase();
    return dokumen.filter(
      (doc) =>
        (doc.project_name || "").toLowerCase().includes(searchTerm) ||
        (doc.location || "").toLowerCase().includes(searchTerm) ||
        (doc.no_ref || "").toLowerCase().includes(searchTerm)
    );
  }, [search, dokumen]);

  const formatRupiah = (angka: number) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(angka);

  const exportToExcel = () => {
    const data = filteredDokumen.map((doc) => ({
      "No Ref": doc.no_ref || "-",
      "Proyek": doc.project_name,
      "Lokasi": doc.location,
      "Total":
        doc.total !== null && doc.total !== undefined
          ? formatRupiah(doc.total)
          : "-",
      "Status": doc.status,
      "Tanggal": new Date(doc.created_at).toLocaleDateString("id-ID"),
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Dokumen RAB");

    XLSX.writeFile(
      workbook,
      `dokumen_rab_${new Date().toISOString().split("T")[0]}.xlsx`
    );
  };

  const hapusDokumen = async (
    id: string,
    namaProyek: string,
    status?: string
  ) => {
    // Check if document can be deleted
    if (status === "approved") {
      alert("Dokumen yang sudah disetujui tidak dapat dihapus.");
      return;
    }

    if (!confirm(`Hapus dokumen "${namaProyek}"? `)) return;

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

  if (loading) {
    return <div className='p-10 text-center'>Memuat data...</div>;
  }

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

        <div className='flex flex-wrap gap-2'>
          <button
            onClick={exportToExcel}
            className='flex items-center gap-2 bg-white border border-gray-300 text-gray-700 px-3 py-2 md:px-4 md:py-2 rounded-lg hover:bg-gray-50 text-sm md:text-base'
          >
            <FileDown size={16} />
            <span>Export Excel</span>
          </button>

          <button
            onClick={() => router.push("/rab/baru")}
            className='flex items-center gap-2 bg-brand-primary hover:bg-brand-dark text-white px-3 py-2 md:px-4 md:py-2 rounded-lg text-sm md:text-base'
          >
            <Plus size={16} />
            <span>Buat Baru</span>
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className='mb-3 md:mb-6 w-full bg-white'>
        <div className='relative'>
          <Search
            className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400'
            size={16}
          />
          <input
            type='text'
            placeholder='Cari proyek, lokasi, atau no ref...'
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className='w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-accent focus:border-transparent text-sm md:text-base'
          />
        </div>
      </div>

      {/* Dokumen List */}
      {filteredDokumen.length === 0 ? (
        <div className='bg-white rounded-lg shadow p-12 text-center'>
          <div className='text-gray-400 mb-4'>📁</div>
          <h3 className='text-lg font-medium text-gray-900 mb-2'>
            Tidak ada dokumen
          </h3>
          <p className='text-gray-500 mb-4'>
            {search
              ? 'Tidak ada hasil untuk pencarian "' + search + '"'
              : "Belum ada dokumen RAB"}
          </p>
          <button
            onClick={() => router.push("/rab/baru")}
            className='text-brand-primary font-medium hover:text-brand-dark'
          >
            + Buat Dokumen Pertama
          </button>
        </div>
      ) : (
        <>
          {/* Desktop/Tablet View - Table */}
          <div className='hidden md:block bg-white rounded-lg shadow overflow-hidden'>
            <div className='overflow-x-auto'>
              <table className='min-w-full divide-y divide-gray-200'>
                <thead className='bg-gray-50'>
                  <tr>
                    <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                      No
                    </th>
                    <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                      Proyek
                    </th>
                    <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                      Lokasi
                    </th>
                    <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                      Total
                    </th>
                    <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                      Status
                    </th>
                    <th className='px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider'>
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody className='bg-white divide-y divide-gray-200'>
                  {filteredDokumen.map((doc, i) => (
                    <tr key={doc.id} className='hover:bg-gray-50'>
                      <td className='px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900'>
                        {doc.no_ref || `#${i + 1}`}
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-700'>
                        <div className='font-medium'>{doc.project_name}</div>
                        <div className='text-xs text-gray-500'>
                          {new Date(doc.created_at).toLocaleDateString("id-ID")}
                        </div>
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-700'>
                        {doc.location}
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900'>
                        {doc.total !== null && doc.total !== undefined
                          ? formatRupiah(doc.total)
                          : "-"}
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap'>
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            doc.status === "draft"
                              ? "bg-yellow-100 text-yellow-800"
                              : doc.status === "sent"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-green-100 text-green-800"
                          }`}
                        >
                          {doc.status === "draft"
                            ? "Draft"
                            : doc.status === "sent"
                            ? "Terkirim"
                            : "Disetujui"}
                        </span>
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap text-right text-sm font-medium'>
                        <button
                          onClick={() => router.push(`/rab/${doc.id}`)}
                          className='text-brand-primary hover:text-brand-dark mr-3'
                        >
                          Lihat
                        </button>
                        <button
                          onClick={() => router.push(`/rab/edit/${doc.id}`)}
                          className='text-brand-accent hover:text-brand-primary mr-3'
                        >
                          Edit
                        </button>
                        <button
                          onClick={() =>
                            hapusDokumen(doc.id, doc.project_name, doc.status)
                          }
                          className='text-red-600 hover:text-red-900'
                        >
                          Hapus
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile View - Compact List */}
          <div className='md:hidden'>
            {filteredDokumen.map((doc, i) => (
              <div
                key={doc.id}
                className='min-h-fit border-b border-gray-200 p-4 bg-white hover:bg-gray-50 border'
                onClick={() => router.push(`/rab/${doc.id}`)}
              >
                <div className='flex h-full'>
                  {/* Left Column - Main Content (tanpa status) */}
                  <div className='flex-1 flex flex-col justify-between'>
                    {/* Kode di kiri atas */}
                    <div className='mb-1'>
                      <span className='font-semibold text-sm text-gray-900'>
                        {doc.no_ref || `#${i + 1}`}
                      </span>
                    </div>

                    {/* Middle: Project Name (Prioritized) */}
                    <h3 className='font-bold text-base text-gray-900 line-clamp-2 mb-1'>
                      {doc.project_name}
                    </h3>

                    {/* Bottom: Location, Date & Total */}
                    <div className='space-y-1'>
                      <div className='flex items-center text-xs text-gray-600'>
                        <span className='mr-1'>📍</span>
                        <span className='truncate'>{doc.location}</span>
                        <span className='mx-1'>•</span>
                        <span>
                          📅{" "}
                          {new Date(doc.created_at).toLocaleDateString("id-ID")}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right Column - Status & Action Button Group */}
                  <div className='flex flex-col justify-between items-end pl-3'>
                    {/* Status badge di atas */}
                    <span
                      className={`px-2 py-0.5 text-xs font-semibold rounded-full ${
                        doc.status === "draft"
                          ? "bg-yellow-100 text-yellow-800"
                          : doc.status === "sent"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-green-100 text-green-800"
                      }`}
                    >
                      {doc.status === "draft"
                        ? "Draft"
                        : doc.status === "sent"
                        ? "Terkirim"
                        : "Disetujui"}
                    </span>{" "}
                    <div className=' text-gray-500'>
                      <span className='font-semibold text-gray-900'>
                        {doc.total !== null && doc.total !== undefined
                          ? formatRupiah(doc.total)
                          : "-"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
