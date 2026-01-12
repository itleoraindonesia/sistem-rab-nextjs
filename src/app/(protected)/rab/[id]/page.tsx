"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Download, Edit3, Trash2, Printer, FileText, Calendar, MapPin } from "lucide-react";
import { supabase } from "../../../../lib/supabaseClient";
import { useMasterData } from "../../../../context/MasterDataContext";
import { pdf } from "@react-pdf/renderer";
import RABDocument from "../../../../components/RABDocument";
import { Card, CardContent } from "../../../../components/ui";
import Button from "../../../../components/ui/Button";
import { Alert, AlertDescription, AlertTitle } from "../../../../components/ui/alert";

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

interface RABDoc {
  id: number;
  no_ref: string;
  project_name: string;
  location_kabupaten: string;
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
  const [dokumen, setDokumen] = useState<RABDoc | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

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

  // Calculate items from document
  const calculateItemsFromDocument = (doc: RABDoc) => {
    if (!doc || !panels || !ongkir || !parameters) return [];

    const items: any[] = [];

    const bidangData = doc.form_data?.bidang || [{ panjang: 10, lebar: 5 }];
    const luasLantai = bidangData.reduce(
      (sum: number, b: any) => sum + (b.panjang || 0) * (b.lebar || 0),
      0
    );
    const luasDinding =
      (doc.form_data?.perimeter || 50) * (doc.form_data?.tinggi_lantai || 3);

    const panelDindingId = doc.form_data?.panel_dinding_id || "d-75-60-300";
    const panelLantaiId = doc.form_data?.panel_lantai_id || "l-75-60-300";

    const panelDinding = panels.find((p) => p.id.toString() === panelDindingId);
    const panelLantai = panels.find((p) => p.id.toString() === panelLantaiId);
    const ongkirData = ongkir.find((o) => o.provinsi === doc.location_kabupaten);

    // Hitung dinding
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

    // Hitung lantai
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
        desc: `Ongkos Kirim ke ${doc.location_kabupaten}`,
        qty: 1,
        unit: "unit",
        unit_price: ongkirData.biaya,
        amount: ongkirData.biaya,
      });
    }

    return items.filter((item) => item.amount > 0);
  };

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
      // Transform dokumen to match RABDocumentData interface
      const dokumenForPDF = {
        ...dokumen,
        location: dokumen.location_kabupaten || "Tidak ada lokasi", // Add required location field
      };

      const blob = await pdf(<RABDocument dokumen={dokumenForPDF} />).toBlob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `RAB_${dokumen.no_ref}_${dokumen.project_name}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Download failed:", error);
      alert("Gagal mengunduh PDF: " + (error as Error).message);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDelete = async () => {
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

      const { error } = await (supabase as any)
        .from("rab_documents")
        .update({ deleted_at: new Date().toISOString() })
        .eq("id", id);

      if (error) throw error;

      alert("Dokumen berhasil dihapus");
      router.push("/rab");
    } catch (err) {
      console.error("Error deleting document:", err);
      alert("Gagal menghapus dokumen: " + (err as Error).message);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-10 text-center">
        <div className="text-gray-600">Memuat data...</div>
      </div>
    );
  }

  if (error && !dokumen) {
    return (
      <div className="container mx-auto p-10">
        <Alert variant="destructive">
          <AlertTitle>Error Memuat Dokumen</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <Button onClick={() => router.push("/rab")} className="mt-4">
          Kembali ke List
        </Button>
      </div>
    );
  }

  if (!dokumen) {
    return <div className="container mx-auto p-10 text-center">Memuat...</div>;
  }

  const total =
    (dokumen as any)?.snapshot?.total !== undefined
      ? (dokumen as any).snapshot.total
      : items && items.length > 0
      ? items.reduce((sum: number, item: any) => sum + (item.amount || 0), 0)
      : dokumen?.total_cost || 0;

  return (
    <div className="container mx-auto">
      <div className="space-y-6">
        {/* Header with actions */}
        <div className="flex items-center justify-between mb-6 no-print">
          <Button variant="ghost" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Kembali
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handlePrint}>
              <Printer className="mr-2 h-4 w-4" />
              Print
            </Button>
            <Button variant="outline" onClick={handleDownloadPDF}>
              <Download className="mr-2 h-4 w-4" />
              Download PDF
            </Button>
            {dokumen.status === "draft" && (
              <>
                <Button
                  variant="outline"
                  onClick={() => router.push(`/rab/edit/${id}`)}
                >
                  <Edit3 className="mr-2 h-4 w-4" />
                  Edit
                </Button>
                <Button variant="destructive" onClick={handleDelete}>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Summary Card */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-brand-primary mb-2">
                  {dokumen.project_name}
                </h1>
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    <span>{dokumen.location_kabupaten}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>
                      {new Date(dokumen.created_at).toLocaleDateString("id-ID", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">No Ref</p>
                <p className="text-xl font-bold mb-2">{dokumen.no_ref}</p>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-semibold ${
                    dokumen.status === "draft"
                      ? "bg-yellow-100 text-yellow-800"
                      : dokumen.status === "sent"
                      ? "bg-blue-100 text-blue-800"
                      : "bg-green-100 text-green-800"
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

            <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm text-gray-600 mb-1">Total Biaya</p>
              <p className="text-3xl font-bold text-blue-600">{formatRupiah(total)}</p>
            </div>
          </CardContent>
        </Card>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Items</p>
                  <p className="text-2xl font-bold">{items.length}</p>
                </div>
                <FileText className="h-8 w-8 text-blue-500 opacity-20" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Status</p>
                  <p className="text-lg font-semibold">
                    {dokumen.status === "draft"
                      ? "Draft"
                      : dokumen.status === "sent"
                      ? "Terkirim"
                      : "Disetujui"}
                  </p>
                </div>
                <Calendar className="h-8 w-8 text-green-500 opacity-20" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Location</p>
                  <p className="text-lg font-semibold">{dokumen.location_kabupaten}</p>
                </div>
                <MapPin className="h-8 w-8 text-orange-500 opacity-20" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Calculation Details */}
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-4">Detail Perhitungan</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-4 font-semibold">Deskripsi</th>
                    <th className="text-center p-4 font-semibold w-24">Qty</th>
                    <th className="text-center p-4 font-semibold w-20">Unit</th>
                    <th className="text-right p-4 font-semibold w-32">Harga Satuan</th>
                    <th className="text-right p-4 font-semibold w-40">Jumlah</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item: any, index: number) => (
                    <tr key={index} className="border-b hover:bg-gray-50">
                      <td className="p-4">{item.desc}</td>
                      <td className="p-4 text-center">{item.qty}</td>
                      <td className="p-4 text-center">{item.unit}</td>
                      <td className="p-4 text-right">{formatRupiah(item.unit_price)}</td>
                      <td className="p-4 text-right font-medium">{formatRupiah(item.amount)}</td>
                    </tr>
                  ))}
                  <tr className="bg-gray-50 font-bold">
                    <td colSpan={4} className="p-4 text-right">
                      GRAND TOTAL
                    </td>
                    <td className="p-4 text-right text-lg text-blue-600">
                      {formatRupiah(total)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Metadata */}
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-4">Informasi Dokumen</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-600">No Referensi</p>
                <p className="font-medium">{dokumen.no_ref}</p>
              </div>
              <div>
                <p className="text-gray-600">Status</p>
                <p className="font-medium">
                  {dokumen.status === "draft"
                    ? "Draft"
                    : dokumen.status === "sent"
                    ? "Terkirim"
                    : "Disetujui"}
                </p>
              </div>
              <div>
                <p className="text-gray-600">Tanggal Dibuat</p>
                <p className="font-medium">
                  {new Date(dokumen.created_at).toLocaleDateString("id-ID", {
                    day: "2-digit",
                    month: "long",
                    year: "numeric",
                  })}
                </p>
              </div>
              <div>
                <p className="text-gray-600">Total Items</p>
                <p className="font-medium">{items.length} item</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Print Styles */}
      <style jsx global>{`
        @media print {
          .no-print {
            display: none !important;
          }
          body {
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
          }
        }
      `}</style>
    </div>
  );
}
