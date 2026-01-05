'use client';

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, Download, Edit3, Trash2 } from "lucide-react";

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
  description?: string;
}

export default function DetailRAB({ params }: PageProps) {
  const [id, setId] = useState<string>("");
  const [dokumen, setDokumen] = useState<RABDocument | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const pathname = usePathname();

  // Load params
  useEffect(() => {
    params.then(({ id: paramId }) => {
      setId(paramId);
    });
  }, [params]);

  // Fetch document data
  useEffect(() => {
    if (!id) return;

    const fetchDokumen = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`/api/rab/${id}`);

        if (!response.ok) {
          throw new Error('Failed to load RAB data');
        }

        const data = await response.json();
        const rab = data.data;

        if (!rab) {
          throw new Error('RAB not found');
        }

        setDokumen(rab);
      } catch (err) {
        console.error('Error fetching document:', err);
        setError(err instanceof Error ? err.message : 'Gagal memuat dokumen');

        // Fallback to mock data
        const mockData: RABDocument = {
          id: parseInt(id),
          no_ref: `RAB-${id.padStart(3, '0')}`,
          project_name: `Proyek Demo ${id}`,
          location: "Jakarta",
          status: "draft",
          created_at: "2024-01-15T10:00:00Z",
          total_cost: 150000000,
          description: "Deskripsi proyek demo untuk testing",
          form_data: {
            wall_panels: [
              {
                panel_name: "Panel Dinding Standard",
                quantity: 10,
                length: 3.0,
                height: 2.5,
                price_per_unit: 150000,
              }
            ],
            floor_panels: [],
            additional_costs: [],
            ongkir: 50000,
          }
        };
        setDokumen(mockData);
      } finally {
        setLoading(false);
      }
    };

    fetchDokumen();
  }, [id]);

  // Detect if this is print route
  const isPrintRoute = pathname.includes("/print/");

  // Calculate items from document data
  const calculateItemsFromDocument = (doc: RABDocument) => {
    if (!doc || !doc.form_data) return [];

    const items = [];

    // Calculate wall panels
    if (doc.form_data.wall_panels && doc.form_data.wall_panels.length > 0) {
      doc.form_data.wall_panels.forEach((panel: any, index: number) => {
        const totalArea = panel.quantity * panel.length * panel.height;
        const totalCost = totalArea * panel.price_per_unit;

        items.push({
          desc: `${panel.panel_name} (Dinding)`,
          qty: panel.quantity,
          unit: "lembar",
          unit_price: panel.price_per_unit,
          amount: totalCost,
        });

        // Add installation cost
        if (totalArea > 0) {
          items.push({
            desc: "Upah Pasang Dinding",
            qty: totalArea,
            unit: "m²",
            unit_price: 50000, // Mock installation cost
            amount: totalArea * 50000,
          });
        }
      });
    }

    // Calculate floor panels
    if (doc.form_data.floor_panels && doc.form_data.floor_panels.length > 0) {
      doc.form_data.floor_panels.forEach((panel: any, index: number) => {
        const totalCost = panel.area * panel.price_per_m2;

        items.push({
          desc: `${panel.panel_name} (Lantai)`,
          qty: panel.area,
          unit: "m²",
          unit_price: panel.price_per_m2,
          amount: totalCost,
        });

        // Add installation cost
        if (panel.area > 0) {
          items.push({
            desc: "Upah Pasang Lantai",
            qty: panel.area,
            unit: "m²",
            unit_price: 30000, // Mock installation cost
            amount: panel.area * 30000,
          });
        }
      });
    }

    // Add shipping cost
    if (doc.form_data.ongkir && doc.form_data.ongkir > 0) {
      items.push({
        desc: `Ongkos Kirim ke ${doc.location}`,
        qty: 1,
        unit: "unit",
        unit_price: doc.form_data.ongkir,
        amount: doc.form_data.ongkir,
      });
    }

    return items.filter((item) => item.amount > 0);
  };

  const formatRupiah = (angka: number) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(angka);

  const handleDownloadPDF = async () => {
    alert("Fitur unduh PDF akan diimplementasi selanjutnya");
  };

  const handleDelete = async () => {
    if (!confirm("Hapus dokumen ini? Tindakan tidak bisa dibatalkan.")) return;

    try {
      const response = await fetch(`/api/rab/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete');

      alert("Dokumen berhasil dihapus");
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
          <Link href="/rab">
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

  // Data untuk tampilan detail
  const items = calculateItemsFromDocument(dokumen);
  const total = dokumen.total_cost || items.reduce((sum, item) => sum + item.amount, 0);

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

        {/* Table with items */}
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
            {items.map((item, index) => (
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
                  {formatRupiah(item.unit_price)}
                </td>
                <td
                  style={{
                    border: "1px solid #ccc",
                    padding: "8px",
                    textAlign: "right",
                    verticalAlign: "middle",
                  }}
                >
                  {formatRupiah(item.amount)}
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
                {formatRupiah(total)}
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
                {items.length > 0 ? (
                  items
                    .filter((item) => item.amount > 0)
                    .map((item, i) => (
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
          {dokumen.status === "draft" && (
            <div className='bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6'>
              <div className='flex items-start gap-3'>
                <div className='text-yellow-600 mt-0.5'>📝</div>
                <div>
                  <h4 className='font-medium text-yellow-800 mb-1'>
                    Dokumen dalam Status Draft
                  </h4>
                  <p className='text-yellow-700 text-sm'>
                    Harga dihitung berdasarkan data form. Ubah
                    status ke "Terkirim" untuk mengunci harga dan
                    mengaktifkan fitur unduh PDF.
                  </p>
                </div>
              </div>
            </div>
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
