import { Card, CardContent } from "@/components/ui"
import { Package, Calculator, TrendingUp, CheckCircle, Clock, AlertTriangle, FileText } from "lucide-react"

export default function ProdukRABDashboardPage() {
  return (
    <div className="min-h-screen bg-white">
 <div >
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
                  href="/products/baru"
                  className="group flex items-center justify-between p-4 bg-white border border-gray-200 shadow-sm rounded-xl hover:border-blue-300 hover:shadow-md hover:ring-1 hover:ring-blue-100 transition-all duration-200"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-xl flex items-center justify-center border border-blue-100/50 text-blue-600 shadow-sm">
                      <FileText className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 group-hover:text-blue-700 transition-colors">Buat RAB Baru</p>
                      <p className="text-sm text-gray-500">Hitung estimasi biaya proyek</p>
                    </div>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-blue-600 group-hover:text-white transition-all shadow-sm">
                    <span>→</span>
                  </div>
                </a>

                <a
                  href="/products/kalkulator-harga"
                  className="group flex items-center justify-between p-4 bg-white border border-gray-200 shadow-sm rounded-xl hover:border-emerald-300 hover:shadow-md hover:ring-1 hover:ring-emerald-100 transition-all duration-200"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-emerald-50 to-emerald-100/50 rounded-xl flex items-center justify-center border border-emerald-100/50 text-emerald-600 shadow-sm">
                      <Calculator className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 group-hover:text-emerald-700 transition-colors">Kalkulator Harga</p>
                      <p className="text-sm text-gray-500">Estimasi biaya proyek</p>
                    </div>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-emerald-600 group-hover:text-white transition-all shadow-sm">
                    <span>→</span>
                  </div>
                </a>

                <a
                  href="/products/panel-lantai-dinding"
                  className="group flex items-center justify-between p-4 bg-white border border-gray-200 shadow-sm rounded-xl hover:border-violet-300 hover:shadow-md hover:ring-1 hover:ring-violet-100 transition-all duration-200"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-violet-50 to-violet-100/50 rounded-xl flex items-center justify-center border border-violet-100/50 text-violet-600 shadow-sm">
                      <Package className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 group-hover:text-violet-700 transition-colors">Panel Lantai & Dinding</p>
                      <p className="text-sm text-gray-500">Kelola dokumen panel</p>
                    </div>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-violet-600 group-hover:text-white transition-all shadow-sm">
                    <span>→</span>
                  </div>
                </a>

                <a
                  href="/products/pagar-beton"
                  className="group flex items-center justify-between p-4 bg-white border border-gray-200 shadow-sm rounded-xl hover:border-orange-300 hover:shadow-md hover:ring-1 hover:ring-orange-100 transition-all duration-200"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-orange-50 to-orange-100/50 rounded-xl flex items-center justify-center border border-orange-100/50 text-orange-600 shadow-sm">
                      <Package className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 group-hover:text-orange-700 transition-colors">Pagar Beton</p>
                      <p className="text-sm text-gray-500">Sistem pagar beton (soon)</p>
                    </div>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-orange-600 group-hover:text-white transition-all shadow-sm">
                    <span>→</span>
                  </div>
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
                <div className="relative overflow-hidden p-5 bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 group">
                  <div className="absolute -top-4 -right-4 p-4 opacity-[0.03] group-hover:scale-110 transition-transform duration-500">
                    <Package className="w-32 h-32 text-blue-900" />
                  </div>
                  <div className="relative z-10">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-xl flex items-center justify-center mb-4 border border-blue-100/50">
                      <Package className="w-6 h-6 text-blue-600" />
                    </div>
                    <h4 className="font-semibold text-gray-900 mb-1">Panel Lantai & Dinding</h4>
                    <p className="text-sm text-gray-500 mb-6 h-10">Panel beton prefabrikasi untuk konstruksi</p>
                    <div className="flex items-center justify-between text-sm pt-4 border-t border-gray-100">
                      <span className="font-medium text-gray-700">45 Dokumen</span>
                      <span className="px-2.5 py-1 bg-green-50 text-green-700 font-medium rounded-full text-xs border border-green-100/50">Aktif</span>
                    </div>
                  </div>
                </div>

                <div className="relative overflow-hidden p-5 bg-white border border-gray-100 rounded-xl shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 group">
                  <div className="absolute -top-4 -right-4 p-4 opacity-[0.03] group-hover:scale-110 transition-transform duration-500">
                    <Package className="w-32 h-32 text-orange-900" />
                  </div>
                  <div className="relative z-10">
                    <div className="w-12 h-12 bg-gradient-to-br from-orange-50 to-orange-100/50 rounded-xl flex items-center justify-center mb-4 border border-orange-100/50">
                      <Package className="w-6 h-6 text-orange-600" />
                    </div>
                    <h4 className="font-semibold text-gray-900 mb-1">Pagar Beton</h4>
                    <p className="text-sm text-gray-500 mb-6 h-10">Sistem pagar beton prefabrikasi</p>
                    <div className="flex items-center justify-between text-sm pt-4 border-t border-gray-100">
                      <span className="font-medium text-gray-700">0 Dokumen</span>
                      <span className="px-2.5 py-1 bg-gray-100 text-gray-600 font-medium rounded-full text-xs border border-gray-200">Segera Hadir</span>
                    </div>
                  </div>
                </div>

                <div className="relative overflow-hidden p-5 bg-white border border-gray-100 rounded-xl shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 group">
                  <div className="absolute -top-4 -right-4 p-4 opacity-[0.03] group-hover:scale-110 transition-transform duration-500">
                    <Calculator className="w-32 h-32 text-emerald-900" />
                  </div>
                  <div className="relative z-10">
                    <div className="w-12 h-12 bg-gradient-to-br from-emerald-50 to-emerald-100/50 rounded-xl flex items-center justify-center mb-4 border border-emerald-100/50">
                      <Calculator className="w-6 h-6 text-emerald-600" />
                    </div>
                    <h4 className="font-semibold text-gray-900 mb-1">Kalkulator RAB</h4>
                    <p className="text-sm text-gray-500 mb-6 h-10">Tools perhitungan otomatis biaya proyek</p>
                    <div className="flex items-center justify-between text-sm pt-4 border-t border-gray-100">
                      <span className="font-medium text-gray-700">89x Dipakai</span>
                      <span className="px-2.5 py-1 bg-green-50 text-green-700 font-medium rounded-full text-xs border border-green-100/50">Aktif</span>
                    </div>
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
