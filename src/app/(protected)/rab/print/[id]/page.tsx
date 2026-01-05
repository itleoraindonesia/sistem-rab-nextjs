import Link from "next/link";
import { notFound } from "next/navigation";
import Button from "../../../../../components/ui/Button";
import Card, { CardHeader, CardTitle, CardContent } from "../../../../../components/ui/Card";

interface PageProps {
  params: {
    id: string;
  };
}

export default function PrintRAB({ params }: PageProps) {
  const { id } = params;

  // Mock data - in real app this would come from database
  const mockRAB = {
    id: parseInt(id),
    no_ref: `RAB-${id.padStart(3, '0')}`,
    project_name: `Proyek Demo ${id}`,
    location: "Jakarta",
    status: "approved",
    created_at: "2024-01-15",
    description: "Dokumen RAB siap untuk dicetak",
    total_cost: 150000000,
    panels: [
      { name: "Panel Dinding Standard", quantity: 50, area: 100, cost: 75000000 },
      { name: "Panel Lantai Premium", quantity: 30, area: 75, cost: 56250000 },
      { name: "Biaya Tambahan", quantity: 1, area: 0, cost: 18750000 },
    ]
  };

  if (!mockRAB) {
    notFound();
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // Auto print on mount (client-side only)
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-white print:bg-white">
      {/* Print Header - Hidden on screen */}
      <div className="hidden print:block mb-8">
        <div className="text-center border-b-2 border-gray-300 pb-4 mb-6">
          <h1 className="text-2xl font-bold text-brand-primary mb-2">
            SISTEM RAB LEORA
          </h1>
          <p className="text-sm text-gray-600">Dokumen RAB - {mockRAB.no_ref}</p>
          <p className="text-xs text-gray-500 mt-1">
            Dicetak pada: {new Date().toLocaleDateString('id-ID')}
          </p>
        </div>
      </div>

      {/* Screen Controls - Hidden on print */}
      <div className="print:hidden mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-brand-primary">Print RAB</h1>
          <p className="text-gray-600 mt-2">ID: {id}</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handlePrint} className="bg-brand-primary hover:bg-brand-dark">
            🖨️ Cetak
          </Button>
          <Link href={`/rab/${id}`}>
            <Button variant="outline">
              ← Kembali ke Detail
            </Button>
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Project Information */}
        <Card>
          <CardHeader>
            <CardTitle className="text-center text-brand-primary">
              DOKUMEN RAB
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Informasi Proyek</h4>
                <div className="space-y-1 text-sm">
                  <p><span className="font-medium">No. Referensi:</span> {mockRAB.no_ref}</p>
                  <p><span className="font-medium">Nama Proyek:</span> {mockRAB.project_name}</p>
                  <p><span className="font-medium">Lokasi:</span> {mockRAB.location}</p>
                  <p><span className="font-medium">Status:</span> {mockRAB.status}</p>
                  <p><span className="font-medium">Tanggal:</span> {mockRAB.created_at}</p>
                </div>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Ringkasan Biaya</h4>
                <div className="space-y-1 text-sm">
                  <p><span className="font-medium">Total RAB:</span></p>
                  <p className="text-xl font-bold text-brand-primary">
                    {formatCurrency(mockRAB.total_cost)}
                  </p>
                </div>
              </div>
            </div>
            {mockRAB.description && (
              <div className="mt-4">
                <h4 className="font-semibold text-gray-900 mb-2">Deskripsi</h4>
                <p className="text-sm text-gray-700">{mockRAB.description}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Detailed Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="text-brand-primary">Rincian Biaya</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-300">
                    <th className="text-left py-2 font-semibold">Item</th>
                    <th className="text-center py-2 font-semibold">Qty</th>
                    <th className="text-center py-2 font-semibold">Area (m²)</th>
                    <th className="text-right py-2 font-semibold">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {mockRAB.panels.map((panel, index) => (
                    <tr key={index} className="border-b border-gray-200">
                      <td className="py-2">{panel.name}</td>
                      <td className="text-center py-2">{panel.quantity}</td>
                      <td className="text-center py-2">{panel.area}</td>
                      <td className="text-right py-2 font-medium">
                        {formatCurrency(panel.cost)}
                      </td>
                    </tr>
                  ))}
                  <tr className="border-t-2 border-gray-300 font-semibold">
                    <td colSpan={3} className="py-3 text-right">TOTAL:</td>
                    <td className="text-right py-3 text-brand-primary">
                      {formatCurrency(mockRAB.total_cost)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Terms & Signatures */}
        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-2 gap-8">
              <div>
                <h4 className="font-semibold text-gray-900 mb-4">Disetujui Oleh:</h4>
                <div className="space-y-8">
                  <div>
                    <p className="text-sm mb-12">___________________________</p>
                    <p className="text-xs text-gray-600">Klien</p>
                  </div>
                </div>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-4">Dibuat Oleh:</h4>
                <div className="space-y-8">
                  <div>
                    <p className="text-sm mb-12">___________________________</p>
                    <p className="text-xs text-gray-600">PT. Leora Indonesia</p>
                    <p className="text-xs text-gray-600 mt-1">
                      {new Date().toLocaleDateString('id-ID')}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center text-xs text-gray-500 mt-8 pb-8">
          <p>© 2025 PT. Leora Indonesia - Sistem RAB Professional</p>
          <p>Dokumen ini dicetak secara elektronik dan memiliki kekuatan hukum yang sama</p>
        </div>
      </div>

      {/* Print Styles */}
      <style dangerouslySetInnerHTML={{
        __html: `
          @media print {
            body {
              font-size: 12px;
            }
            .print-hidden {
              display: none !important;
            }
            .print-block {
              display: block !important;
            }
          }
        `
      }} />
    </div>
  );
}
