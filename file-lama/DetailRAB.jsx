import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useMasterData } from "../context/MasterDataContext";
import supabase from "../lib/supabaseClient";
import { ChevronLeft, Download, Edit3, Trash2 } from "lucide-react";
import { pdf } from "@react-pdf/renderer";
import RABDocument from "../components/RABDocument";

export default function DetailRAB() {
  const { id } = useParams();
  const navigate = useNavigate();
  const {
    panels,
    ongkir,
    parameters,
    loading: masterLoading,
  } = useMasterData();
  const [dokumen, setDokumen] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Detect if this is print route
  const isPrintRoute = window.location.pathname.includes("/print/");

  // Fetch real data from Supabase
  useEffect(() => {
    const fetchDokumen = async () => {
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
        setError("Gagal memuat dokumen: " + err.message);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchDokumen();
    }
  }, [id]);

  const formatRupiah = (angka) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(angka);

  // Fungsi untuk menghitung items dari dokumen draft
  const calculateItemsFromDocument = (doc) => {
    if (!doc || !panels || !ongkir || !parameters) return [];

    const items = [];

    // Hitung luas
    const luasLantai = doc.bidang
      ? doc.bidang.reduce((sum, b) => sum + b.panjang * b.lebar, 0)
      : 0;
    const luasDinding = (doc.perimeter || 0) * (doc.tinggi_lantai || 0);

    // Ambil data panel dari master data
    const panelDinding = doc.panel_dinding_id
      ? panels.find((p) => p.id === doc.panel_dinding_id)
      : null;
    const panelLantai = doc.panel_lantai_id
      ? panels.find((p) => p.id === doc.panel_lantai_id)
      : null;
    const ongkirData = ongkir.find((o) => o.provinsi === doc.location);

    // Hitung dinding jika ada panel dinding
    if (doc.panel_dinding_id && panelDinding) {
      const lembarDinding = Math.ceil(
        (luasDinding / (panelDinding.luasPerLembar || 1.8)) *
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
    if (doc.panel_lantai_id && panelLantai) {
      const lembarLantai = Math.ceil(
        (luasLantai / (panelLantai.luasPerLembar || 1.8)) *
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

    return items.filter((item) => item.amount > 0);
  };

  const handleDownloadPDF = async () => {
    if (!dokumen?.snapshot) {
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
      alert("Gagal mengunduh PDF: " + error.message);
    }
  };

  if (loading) {
    return <div className='p-10 text-center'>Memuat data...</div>;
  }

  if (error) {
    return (
      <div className='max-w-4xl mx-auto p-10'>
        <div className='bg-red-50 border border-red-200 rounded-lg p-6 text-center'>
          <div className='text-red-600 text-5xl mb-4'>⚠️</div>
          <h3 className='text-lg font-medium text-red-900 mb-2'>
            Error Memuat Dokumen
          </h3>
          <p className='text-red-700 mb-4'>{error}</p>
          <button
            onClick={() => navigate("/rab")}
            className='bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg'
          >
            Kembali ke List
          </button>
        </div>
      </div>
    );
  }

  if (!dokumen) {
    return <div className='p-10 text-center'>Memuat...</div>;
  }

  // Data untuk tampilan detail (untuk semua status)
  const items = dokumen?.snapshot
    ? dokumen.snapshot.items
    : masterLoading
    ? []
    : calculateItemsFromDocument(dokumen);
  const total = dokumen?.snapshot
    ? dokumen.snapshot.total
    : dokumen?.total || 0;

  // If this is print route, show only print-optimized content
  if (isPrintRoute) {
    if (!dokumen?.snapshot) {
      return (
        <div
          style={{
            padding: "8px",
            textAlign: "center",
            fontFamily: "Arial, sans-serif",
          }}
        >
          <h2>Dokumen tidak tersedia untuk print</h2>
          <p>Dokumen masih dalam status draft.</p>
        </div>
      );
    }

    // Show print-optimized layout
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
                colSpan='4'
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
                }).format(dokumen.snapshot?.total || 0)}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  }

  // Regular detail view
  return (
    <div
      className='max-w-4xl mx-auto p-4 lg:p-3
    '
    >
      <div className='mb-6 flex items-center justify-between'>
        <button
          onClick={() => navigate(-1)}
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
        <div className='p-6 border-b bg-linear-to-r from-brand-primary to-brand-dark text-white'>
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
                          colSpan='4'
                          className='px-4 py-8 text-center text-gray-500'
                        >
                          Tidak ada data rincian harga
                        </td>
                      </tr>
                    )}
                    {total > 0 && (
                      <tr className='bg-brand-primary/10 font-bold'>
                        <td
                          colSpan='3'
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
              {!dokumen.snapshot && (
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

              {/* Tombol Aksi */}
              <div className='flex flex-wrap gap-3'>
                {/* Tombol Download PDF hanya untuk dokumen dengan snapshot */}
                {dokumen.snapshot && (
                  <button
                    onClick={handleDownloadPDF}
                    className='flex items-center gap-2 bg-gray-800 hover:bg-gray-900 text-white px-4 py-2.5 rounded-lg'
                  >
                    <Download size={18} />
                    <span>Unduh PDF</span>
                  </button>
                )}

                {/* Tombol Edit untuk semua status */}
                <button
                  onClick={() => navigate(`/rab/edit/${dokumen.id}`)}
                  className='flex items-center gap-2 bg-brand-primary hover:bg-brand-dark text-white px-4 py-2.5 rounded-lg'
                >
                  <Edit3 size={18} />
                  <span>Edit</span>
                </button>

                {/* Tombol Hapus untuk semua status */}
                <button
                  onClick={async () => {
                    if (
                      confirm(
                        "Hapus dokumen ini? Tindakan tidak bisa dibatalkan."
                      )
                    ) {
                      try {
                        const { error } = await supabase
                          .from("rab_documents")
                          .delete()
                          .eq("id", dokumen.id);

                        if (error) throw error;

                        alert("Dokumen berhasil dihapus");
                        navigate("/rab");
                      } catch (err) {
                        console.error("Error deleting document:", err);
                        alert("Gagal menghapus dokumen: " + err.message);
                      }
                    }
                  }}
                  className='flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2.5 rounded-lg'
                >
                  <Trash2 size={18} />
                  <span>Hapus</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
