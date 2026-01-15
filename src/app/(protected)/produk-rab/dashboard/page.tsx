import { Card, CardContent } from "@/components/ui"
import { Package, Calculator, TrendingUp, CheckCircle, Clock, AlertTriangle, FileText } from "lucide-react"

export default function ProdukRABDashboardPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Dashboard Produk & RAB</h1>
          <p className="text-gray-600">Ringkasan keseluruhan data produk dan dokumen RAB</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Dokumen RAB</p>
                  <p className="text-2xl font-bold">89</p>
                  <p className="text-xs text-green-600 flex items-center mt-1">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    +15% dari bulan lalu
                  </p>
                </div>
                <div className="p-3 bg-blue-100 rounded-full">
                  <FileText className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Panel Lantai & Dinding</p>
                  <p className="text-2xl font-bold">45</p>
                  <p className="text-xs text-green-600 flex items-center mt-1">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    +22% dari bulan lalu
                  </p>
                </div>
                <div className="p-3 bg-green-100 rounded-full">
                  <Package className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Nilai RAB</p>
                  <p className="text-2xl font-bold">Rp 2.4M</p>
                  <p className="text-xs text-green-600 flex items-center mt-1">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    +18% dari bulan lalu
                  </p>
                </div>
                <div className="p-3 bg-purple-100 rounded-full">
                  <Calculator className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">RAB Disetujui</p>
                  <p className="text-2xl font-bold">67</p>
                  <p className="text-xs text-green-600 flex items-center mt-1">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    75% approval rate
                  </p>
                </div>
                <div className="p-3 bg-green-100 rounded-full">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activities & Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent RAB Documents */}
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4">Dokumen RAB Terbaru</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center">
                      <Package className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">RAB Gudang PT ABC - 500m²</p>
                      <p className="text-xs text-gray-500">3 jam yang lalu</p>
                    </div>
                  </div>
                  <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                    Draft
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-green-100 rounded flex items-center justify-center">
                      <Calculator className="w-4 h-4 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">RAB Toko Modern - 120m²</p>
                      <p className="text-xs text-gray-500">6 jam yang lalu</p>
                    </div>
                  </div>
                  <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                    Approved
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-purple-100 rounded flex items-center justify-center">
                        <Package className="w-4 h-4 text-purple-600" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">RAB Panel Lantai Mall XYZ</p>
                        <p className="text-xs text-gray-500">1 hari yang lalu</p>
                      </div>
                    </div>
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                      Published
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4">Aksi Cepat</h3>
              <div className="space-y-3">
                <a
                  href="/produk-rab/baru"
                  className="flex items-center justify-between p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <FileText className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium">Buat RAB Baru</p>
                      <p className="text-sm text-gray-600">Hitung estimasi biaya proyek</p>
                    </div>
                  </div>
                  <span className="text-blue-600">→</span>
                </a>

                <a
                  href="/produk-rab/panel-lantai-dinding"
                  className="flex items-center justify-between p-4 bg-green-50 hover:bg-green-100 rounded-lg transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <Package className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium">Panel Lantai & Dinding</p>
                      <p className="text-sm text-gray-600">Kelola dokumen panel</p>
                    </div>
                  </div>
                  <span className="text-green-600">→</span>
                </a>

                <a
                  href="/produk-rab/pagar-beton"
                  className="flex items-center justify-between p-4 bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                      <Package className="w-5 h-5 text-orange-600" />
                    </div>
                    <div>
                      <p className="font-medium">Pagar Beton</p>
                      <p className="text-sm text-gray-600">Sistem pagar beton (soon)</p>
                    </div>
                  </div>
                  <span className="text-orange-600">→</span>
                </a>
              </div>

              {/* Alerts */}
              <div className="mt-6 p-4 bg-orange-50 border border-orange-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-orange-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-orange-900">Perhatian</p>
                    <p className="text-sm text-orange-800 mt-1">
                      Ada 12 dokumen RAB menunggu approval. Pastikan review sebelum approve.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Product Categories Overview */}
        <div className="mt-8">
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4">Kategori Produk</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-center gap-3 mb-2">
                    <Package className="w-5 h-5 text-blue-600" />
                    <span className="font-medium text-blue-900">Panel Lantai & Dinding</span>
                  </div>
                  <p className="text-sm text-blue-700 mb-2">Panel beton prefabrikasi untuk konstruksi</p>
                  <div className="flex justify-between text-xs">
                    <span>Dokumen: 45</span>
                    <span className="text-green-600">Aktif</span>
                  </div>
                </div>

                <div className="p-4 bg-orange-50 rounded-lg">
                  <div className="flex items-center gap-3 mb-2">
                    <Package className="w-5 h-5 text-orange-600" />
                    <span className="font-medium text-orange-900">Pagar Beton</span>
                  </div>
                  <p className="text-sm text-orange-700 mb-2">Sistem pagar beton prefabrikasi</p>
                  <div className="flex justify-between text-xs">
                    <span>Dokumen: 0</span>
                    <span className="text-gray-600">Coming Soon</span>
                  </div>
                </div>

                <div className="p-4 bg-green-50 rounded-lg">
                  <div className="flex items-center gap-3 mb-2">
                    <Calculator className="w-5 h-5 text-green-600" />
                    <span className="font-medium text-green-900">Kalkulator RAB</span>
                  </div>
                  <p className="text-sm text-green-700 mb-2">Tools perhitungan otomatis biaya</p>
                  <div className="flex justify-between text-xs">
                    <span>Penggunaan: 89x</span>
                    <span className="text-green-600">Aktif</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
