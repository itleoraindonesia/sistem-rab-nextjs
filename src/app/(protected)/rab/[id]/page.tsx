"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, Download, Edit3, Trash2 } from "lucide-react";
import { supabase } from "../../../../lib/supabaseClient";
import { useMasterData } from "../../../../context/MasterDataContext";
import { pdf } from "@react-pdf/renderer";
import RABDocument from "../../../../components/RABDocument";

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

interface RABDocument {
  id: number;
  no_ref: string;
  project_name: string;
  location: string;
  status: string;
  created_at: string;
  total_cost?: number;
  form_data?: any;
  calculation_results?: any;
  description?: string;
  snapshot?: {
    items: any[];
    total: number;
    timestamp: string;
  };
}

export default function DetailRAB({ params }: PageProps) {
  const [id, setId] = useState<string>("");
  const [dokumen, setDokumen] = useState<RABDocument | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const pathname = usePathname();

  const {
    panels,
    ongkir,
    parameters,
    loading: masterLoading,
  } = useMasterData();

  // Load params
  useEffect(() => {
    params.then(({ id: paramId }) => {
      setId(paramId);
    });
  }, [params]);

  // Fetch document data
  useEffect(() => {
    const fetchDokumen = async () => {
      if (!supabase) {
        setError("Database not configured");
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

        if (error) {
          if (error.code === "PGRST116") {
            // No rows returned
            setError("Dokumen tidak ditemukan");
          } else {
            throw error;
          }
          return;
        }

        setDokumen(data);
      } catch (err) {
        console.error("Error fetching document:", err);
        setError(
          "Gagal memuat dokumen: " +
            (err instanceof Error ? err.message : String(err))
        );
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchDokumen();
    }
  }, [id]);

  // Detect if this is print route
  const isPrintRoute = pathname.includes("/print/");

  // Fungsi untuk menghitung items dari dokumen draft
  const calculateItemsFromDocument = (doc: RABDocument) => {
    if (!doc || !panels || !ongkir || !parameters) return [];

    const items: any[] = [];

    // Hitung luas - dengan fallback data untuk dokumen lama
    const bidangData = doc.form_data?.bidang || [{ panjang: 10, lebar: 5 }]; // Fallback: 1 ruangan 10x5m
    const luasLantai = bidangData.reduce(
      (sum: number, b: any) => sum + (b.panjang || 0) * (b.lebar || 0),
      0
    );
    const luasDinding =
      (doc.form_data?.perimeter || 50) * (doc.form_data?.tinggi_lantai || 3); // Fallback: perimeter 50m, tinggi 3m

    // Debug: Log form data and panels with actual values
    console.log("🔍 DEBUG PANEL LOOKUP:");
    console.log("Form data panel IDs:", {
      panel_dinding_id: doc.form_data?.panel_dinding_id,
      panel_lantai_id: doc.form_data?.panel_lantai_id,
      type_dinding: typeof doc.form_data?.panel_dinding_id,
      type_lantai: typeof doc.form_data?.panel_lantai_id,
    });

    console.log(
      "Available panels:",
      panels.map((p) => ({
        id: p.id,
        name: p.name,
        type: typeof p.id,
        type_label: p.type,
      }))
    );

    // Use fallback panel IDs when undefined - use actual panel IDs from database
    const panelDindingId = doc.form_data?.panel_dinding_id || "d-75-60-300"; // Default to Dinding Panel 7,5 x 60 x 300
    const panelLantaiId = doc.form_data?.panel_lantai_id || "l-75-60-300"; // Default to Lantai Panel 7,5 x 60 x 300

    // Ambil data panel dari master data - use fallback IDs
    const panelDinding = panels.find((p) => {
      const match = p.id.toString() === panelDindingId;
      if (match) {
        console.log(`✅ FOUND Panel dinding: ${p.name} (ID: ${p.id})`);
      }
      return match;
    });

    const panelLantai = panels.find((p) => {
      const match = p.id.toString() === panelLantaiId;
      if (match) {
        console.log(`✅ FOUND Panel lantai: ${p.name} (ID: ${p.id})`);
      }
      return match;
    });

    console.log("📐 Area calculations:", {
      luasLantai,
      luasDinding,
      bidang: doc.form_data?.bidang,
      perimeter: doc.form_data?.perimeter,
      tinggi_lantai: doc.form_data?.tinggi_lantai,
    });

    console.log("🎯 Final result:", {
      panelDinding: panelDinding
        ? `${panelDinding.name} (ID: ${panelDinding.id})`
        : "NOT FOUND",
      panelLantai: panelLantai
        ? `${panelLantai.name} (ID: ${panelLantai.id})`
        : "NOT FOUND",
    });
    const ongkirData = ongkir.find((o) => o.provinsi === doc.location);

    // Hitung dinding jika ada panel dinding
    if (panelDindingId && panelDinding) {
      const lembarDinding = Math.ceil(
        (luasDinding / (panelDinding.luas_per_lembar || 1.8)) *
          parameters.wasteFactor
      );
      const titikJointDinding = Math.round(
        luasDinding * parameters.jointFactorDinding
      );

      items.push({
        desc: `Panel ${panelDinding.name}`,
        qty: lembarDinding,
        unit: "lembar",
        unit_price: panelDinding.harga,
        amount: lembarDinding * panelDinding.harga,
      });

      if (luasDinding > 0) {
        items.push({
          desc: "Upah Pasang Dinding",
          qty: luasDinding,
          unit: "m²",
          unit_price: parameters.upahPasang,
          amount: luasDinding * parameters.upahPasang,
        });

        items.push({
          desc: "Joint/Angkur Dinding",
          qty: titikJointDinding,
          unit: "titik",
          unit_price: parameters.hargaJoint,
          amount: titikJointDinding * parameters.hargaJoint,
        });
      }
    }

    // Hitung lantai jika ada panel lantai
    if (panelLantaiId && panelLantai) {
      const lembarLantai = Math.ceil(
        (luasLantai / (panelLantai.luas_per_lembar || 1.8)) *
          parameters.wasteFactor
      );
      const titikJointLantai = Math.ceil(
        luasLantai * parameters.jointFactorLantai
      );

      items.push({
        desc: `Panel ${panelLantai.name}`,
        qty: lembarLantai,
        unit: "lembar",
        unit_price: panelLantai.harga,
        amount: lembarLantai * panelLantai.harga,
      });

      if (luasLantai > 0) {
        items.push({
          desc: "Upah Pasang Lantai",
          qty: luasLantai,
          unit: "m²",
          unit_price: parameters.upahPasang,
          amount: luasLantai * parameters.upahPasang,
        });

        items.push({
          desc: "Joint/Angkur Lantai",
          qty: titikJointLantai,
          unit: "titik",
          unit_price: parameters.hargaJoint,
          amount: titikJointLantai * parameters.hargaJoint,
        });
      }
    }

    // Tambahkan ongkir
    if (ongkirData) {
      items.push({
        desc: `Ongkos Kirim ke ${doc.location}`,
        qty: 1,
        unit: "unit",
        unit_price: ongkirData.biaya,
        amount: ongkirData.biaya,
      });
    }

    const filteredItems = items.filter((item) => item.amount > 0);
    console.log("📦 Final items:", {
      totalItems: items.length,
      filteredItems: filteredItems.length,
      items: filteredItems,
    });

    return filteredItems;
  };

  // Data untuk tampilan detail (untuk semua status) - useMemo to prevent infinite re-renders
  // MUST be called before any early returns to follow Rules of Hooks
  const items = useMemo(() => {
    if ((dokumen as any)?.snapshot) {
      return (dokumen as any).snapshot.items;
    }
    if (masterLoading) {
      return [];
    }
    return dokumen ? calculateItemsFromDocument(dokumen) : [];
  }, [dokumen, masterLoading, panels, ongkir, parameters]);

  const formatRupiah = (angka: number) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(angka);

  const handleDownloadPDF = async () => {
    if (!dokumen) {
      alert("Data dokumen tidak tersedia");
      return;
    }

    if (!(dokumen as any)?.snapshot) {
      alert(
        "Dokumen masih draft. Ubah status ke 'Terkirim' untuk mengunci harga."
      );
      return;
    }

    try {
      // Generate PDF using React PDF
      const blob = await pdf(<RABDocument dokumen={dokumen} />).toBlob();

      // Create download link
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `RAB_${dokumen.no_ref}_${dokumen.project_name}.pdf`;

      // Trigger download
      document.body.appendChild(link);
      link.click();

      // Clean up
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Download failed:", error);
      alert("Gagal mengunduh PDF: " + (error as Error).message);
    }
  };

  const handleDelete = async () => {
    // Check if document can be deleted
    if (dokumen?.status === "approved") {
      alert("Dokumen yang sudah disetujui tidak dapat dihapus.");
      return;
    }

    if (
      !confirm(
        "Hapus dokumen ini? Dokumen akan disembunyikan dan dapat dikembalikan."
      )
    )
      return;

    try {
      if (!supabase) {
        throw new Error("Database not configured");
      }

      // Soft delete: set deleted_at instead of hard delete
      const { error } = await (supabase as any)
        .from("rab_documents")
        .update({ deleted_at: new Date().toISOString() })
        .eq("id", id);

      if (error) throw error;

      alert("Dokumen berhasil dihapus (disembunyikan)");
      router.push("/rab");
    } catch (err) {
      console.error("Error deleting document:", err);
      alert("Gagal menghapus dokumen: " + (err as Error).message);
    }
  };

  if (loading) {
    return <div className='p-10 text-center'>Memuat data...</div>;
  }

  if (error && !dokumen) {
    return (
      <div className='max-w-4xl mx-auto p-10'>
        <div className='bg-red-50 border border-red-200 rounded-lg p-6 text-center'>
          <div className='text-red-600 text-5xl mb-4'>⚠️</div>
          <h3 className='text-lg font-medium text-red-900 mb-2'>
            Error Memuat Dokumen
          </h3>
          <p className='text-red-700 mb-4'>{error}</p>
          <Link href='/rab'>
            <button className='bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg'>
              Kembali ke List
            </button>
          </Link>
        </div>
      </div>
    );
  }

  if (!dokumen) {
    return <div className='p-10 text-center'>Memuat...</div>;
  }

  // Calculate total: snapshot total, or sum of items, or stored total_cost
  const total =
    (dokumen as any)?.snapshot?.total !== undefined
      ? (dokumen as any).snapshot.total
      : items && items.length > 0
      ? items.reduce((sum: number, item: any) => sum + (item.amount || 0), 0)
      : dokumen?.total_cost || 0;

  console.log("💰 Total calculation:", {
    hasSnapshot: !!(dokumen as any)?.snapshot,
    snapshotTotal: (dokumen as any)?.snapshot?.total,
    itemsLength: items?.length || 0,
    itemsSum:
      items?.reduce((sum: number, item: any) => sum + (item.amount || 0), 0) ||
      0,
    storedTotal: dokumen?.total_cost,
    finalTotal: total,
  });

  // If this is print route, show print-optimized content
  if (isPrintRoute) {
    return (
      <div
        style={{
          fontFamily: "Arial, sans-serif",
          backgroundColor: "#f4f4f4",
          margin: 0,
          padding: "16px",
          color: "#333",
          width: "100%",
          maxWidth: "210mm",
          minHeight: "auto",
          height: "auto",
          marginLeft: "auto",
          marginRight: "auto",
          boxShadow: "0 0 10px rgba(0,0,0,0.1)",
          boxSizing: "border-box",
        }}
      >
        {/* Header Section */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            marginBottom: "20px",
          }}
        >
          <div
            style={{
              textDecoration: "underline",
              marginBottom: "15px",
              fontSize: "18px",
              fontWeight: "bold",
            }}
          >
            <h2
              style={{
                margin: 0,
                fontSize: "18px",
                fontWeight: "bold",
                textDecoration: "underline",
              }}
            >
              RENCANA ANGGARAN BIAYA
            </h2>
            <table
              style={{
                marginTop: "15px",
              }}
            >
              <tbody>
                <tr>
                  <td
                    style={{
                      padding: "2px 10px 2px 0",
                      fontSize: "14px",
                    }}
                  >
                    No Ref
                  </td>
                  <td
                    style={{
                      padding: "2px 10px 2px 0",
                      fontSize: "14px",
                    }}
                  >
                    :
                  </td>
                  <td
                    style={{
                      padding: "2px 10px 2px 0",
                      fontSize: "14px",
                    }}
                  >
                    {dokumen.no_ref}
                  </td>
                </tr>
                <tr>
                  <td
                    style={{
                      padding: "2px 10px 2px 0",
                      fontSize: "14px",
                    }}
                  >
                    Project
                  </td>
                  <td
                    style={{
                      padding: "2px 10px 2px 0",
                      fontSize: "14px",
                    }}
                  >
                    :
                  </td>
                  <td
                    style={{
                      padding: "2px 10px 2px 0",
                      fontSize: "14px",
                    }}
                  >
                    {dokumen.project_name}
                  </td>
                </tr>
                <tr>
                  <td
                    style={{
                      padding: "2px 10px 2px 0",
                      fontSize: "14px",
                    }}
                  >
                    Location
                  </td>
                  <td
                    style={{
                      padding: "2px 10px 2px 0",
                      fontSize: "14px",
                    }}
                  >
                    :
                  </td>
                  <td
                    style={{
                      padding: "2px 10px 2px 0",
                      fontSize: "14px",
                    }}
                  >
                    {dokumen.location}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div
            style={{
              textAlign: "right",
            }}
          >
            <h1
              style={{
                fontFamily: "'Arial Black', sans-serif",
                fontSize: "36px",
                margin: 0,
                letterSpacing: "-1px",
                color: "#000",
              }}
            >
              LEORA{" "}
              <span
                style={{
                  color: "#555",
                  fontSize: "20px",
                }}
              >
                &#9776;
              </span>
            </h1>
          </div>
        </div>

        {/* Table with categorized items */}
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            marginTop: "20px",
            fontSize: "12px",
          }}
        >
          <thead>
            <tr style={{ backgroundColor: "#e0e0e0" }}>
              <th
                style={{
                  border: "1px solid #999",
                  padding: "8px",
                  textAlign: "left",
                  fontWeight: "bold",
                  verticalAlign: "middle",
                }}
              >
                Deskripsi
              </th>
              <th
                style={{
                  border: "1px solid #999",
                  padding: "8px",
                  textAlign: "center",
                  fontWeight: "bold",
                  width: "80px",
                  verticalAlign: "middle",
                }}
              >
                Qty
              </th>
              <th
                style={{
                  border: "1px solid #999",
                  padding: "8px",
                  textAlign: "center",
                  fontWeight: "bold",
                  width: "60px",
                  verticalAlign: "middle",
                }}
              >
                Unit
              </th>
              <th
                style={{
                  border: "1px solid #999",
                  padding: "8px",
                  textAlign: "right",
                  fontWeight: "bold",
                  width: "100px",
                  verticalAlign: "middle",
                }}
              >
                Harga Satuan
              </th>
              <th
                style={{
                  border: "1px solid #999",
                  padding: "8px",
                  textAlign: "right",
                  fontWeight: "bold",
                  width: "120px",
                  verticalAlign: "middle",
                }}
              >
                Jumlah
              </th>
            </tr>
          </thead>
          <tbody>
            {dokumen.snapshot?.items?.map((item, index) => (
              <tr key={index}>
                <td
                  style={{
                    border: "1px solid #ccc",
                    padding: "8px",
                    verticalAlign: "middle",
                  }}
                >
                  {item.desc}
                </td>
                <td
                  style={{
                    border: "1px solid #ccc",
                    padding: "8px",
                    textAlign: "center",
                    verticalAlign: "middle",
                  }}
                >
                  {item.qty}
                </td>
                <td
                  style={{
                    border: "1px solid #ccc",
                    padding: "8px",
                    textAlign: "center",
                    verticalAlign: "middle",
                  }}
                >
                  {item.unit}
                </td>
                <td
                  style={{
                    border: "1px solid #ccc",
                    padding: "8px",
                    textAlign: "right",
                    verticalAlign: "middle",
                  }}
                >
                  {new Intl.NumberFormat("id-ID", {
                    style: "currency",
                    currency: "IDR",
                    minimumFractionDigits: 0,
                  }).format(item.unit_price)}
                </td>
                <td
                  style={{
                    border: "1px solid #ccc",
                    padding: "8px",
                    textAlign: "right",
                    verticalAlign: "middle",
                  }}
                >
                  {new Intl.NumberFormat("id-ID", {
                    style: "currency",
                    currency: "IDR",
                    minimumFractionDigits: 0,
                  }).format(item.amount)}
                </td>
              </tr>
            ))}
            <tr style={{ backgroundColor: "#f0f0f0", fontWeight: "bold" }}>
              <td
                colSpan={4}
                style={{
                  border: "1px solid #999",
                  padding: "10px",
                  textAlign: "right",
                  verticalAlign: "middle",
                }}
              >
                GRAND TOTAL
              </td>
              <td
                style={{
                  border: "1px solid #999",
                  padding: "10px",
                  textAlign: "right",
                  fontSize: "14px",
                  verticalAlign: "middle",
                }}
              >
                {new Intl.NumberFormat("id-ID", {
                  style: "currency",
                  currency: "IDR",
                  minimumFractionDigits: 0,
                }).format(Number(dokumen.snapshot?.total) || 0)}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  }

  // Regular detail view
  return (
    <div className='max-w-4xl mx-auto p-4 lg:p-3'>
      <div className='mb-6 flex items-center justify-between'>
        <button
          onClick={() => router.back()}
          className='flex items-center gap-2 text-gray-600 hover:text-gray-900'
        >
          <ChevronLeft size={20} />
          <span>Kembali</span>
        </button>
        <h1 className='text-2xl font-bold text-brand-primary'>
          Detail Penawaran
        </h1>
      </div>

      <div className='bg-white rounded-lg shadow overflow-hidden'>
        {/* Header Dokumen */}
        <div className='p-6 border-b bg-gradient-to-r from-brand-primary to-brand-dark text-white'>
          <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4'>
            <div>
              <div className='text-lg font-bold'>{dokumen.project_name}</div>
              <div className='text-sm opacity-90'>{dokumen.location}</div>
            </div>
            <div className='text-right'>
              <div className='text-sm opacity-90'>No Ref</div>
              <div className='text-xl font-bold'>{dokumen.no_ref}</div>
              <div className='text-sm mt-1'>
                {new Date(dokumen.created_at).toLocaleDateString("id-ID", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </div>
            </div>
          </div>

          <div className='mt-4 flex flex-wrap gap-2'>
            <span
              className={`px-3 py-1 rounded-full text-sm font-medium ${
                dokumen.status === "draft"
                  ? "bg-yellow-200 text-yellow-800"
                  : dokumen.status === "sent"
                  ? "bg-blue-200 text-blue-800"
                  : "bg-green-200 text-green-800"
              }`}
            >
              {dokumen.status === "draft"
                ? "DRAFT"
                : dokumen.status === "sent"
                ? "TERKIRIM"
                : "DISETUJUI"}
            </span>
          </div>
        </div>

        {/* Konten Utama */}
        <div className='p-6'>
          {masterLoading ? (
            <div className='text-center py-8'>
              <div className='animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-primary mx-auto mb-4'></div>
              <p className='text-gray-600'>Memuat data master...</p>
            </div>
          ) : (
            <>
              {/* Tabel Rincian */}
              <div className='overflow-x-auto mb-6'>
                <table className='min-w-full divide-y divide-gray-200'>
                  <thead className='bg-gray-50'>
                    <tr>
                      <th className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase'>
                        Deskripsi
                      </th>
                      <th className='px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase'>
                        Jumlah
                      </th>
                      <th className='px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase'>
                        Harga
                      </th>
                      <th className='px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase'>
                        Total
                      </th>
                    </tr>
                  </thead>
                  <tbody className='divide-y divide-gray-200'>
                    {items && items.length > 0 ? (
                      items
                        .filter((item: any) => item.amount > 0)
                        .map((item: any, i: number) => (
                          <tr
                            key={i}
                            className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}
                          >
                            <td className='px-4 py-3 text-sm text-gray-700'>
                              {item.desc}
                            </td>
                            <td className='px-4 py-3 text-right text-sm text-gray-700'>
                              {item.qty} {item.unit || "lembar"}
                            </td>
                            <td className='px-4 py-3 text-right text-sm text-gray-700'>
                              {formatRupiah(item.unit_price)}
                            </td>
                            <td className='px-4 py-3 text-right font-medium text-gray-900'>
                              {formatRupiah(item.amount)}
                            </td>
                          </tr>
                        ))
                    ) : (
                      <tr>
                        <td
                          colSpan={4}
                          className='px-4 py-8 text-center text-gray-500'
                        >
                          Tidak ada data rincian harga
                        </td>
                      </tr>
                    )}
                    {total > 0 && (
                      <tr className='bg-brand-primary/10 font-bold'>
                        <td
                          colSpan={3}
                          className='px-4 py-3 text-right text-brand-primary'
                        >
                          GRAND TOTAL
                        </td>
                        <td className='px-4 py-3 text-right text-brand-primary text-xl'>
                          {formatRupiah(total)}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Informasi tambahan untuk draft */}
              {!(dokumen as any)?.snapshot && (
                <div className='bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6'>
                  <div className='flex items-start gap-3'>
                    <div className='text-yellow-600 mt-0.5'>📝</div>
                    <div>
                      <h4 className='font-medium text-yellow-800 mb-1'>
                        Dokumen dalam Status Draft
                      </h4>
                      <p className='text-yellow-700 text-sm'>
                        Harga dihitung berdasarkan master data terbaru. Ubah
                        status ke "Terkirim" untuk mengunci harga dan
                        mengaktifkan fitur unduh PDF.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          {/* Tombol Aksi */}
          <div className='flex flex-wrap gap-3'>
            {/* Tombol Download PDF hanya untuk dokumen non-draft */}
            {dokumen.status !== "draft" && (
              <button
                onClick={handleDownloadPDF}
                className='flex items-center gap-2 bg-gray-800 hover:bg-gray-900 text-white px-4 py-2.5 rounded-lg'
              >
                <Download size={18} />
                <span>Unduh PDF</span>
              </button>
            )}

            {/* Tombol Edit untuk semua status */}
            <Link href={`/rab/edit/${dokumen.id}`}>
              <button className='flex items-center gap-2 bg-brand-primary hover:bg-brand-dark text-white px-4 py-2.5 rounded-lg'>
                <Edit3 size={18} />
                <span>Edit</span>
              </button>
            </Link>

            {/* Tombol Hapus untuk semua status */}
            <button
              onClick={handleDelete}
              className='flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2.5 rounded-lg'
            >
              <Trash2 size={18} />
              <span>Hapus</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
