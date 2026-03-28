import { Card, CardContent } from "@/components/ui"
import { Truck, Clock, AlertTriangle, Package, TrendingUp, FileText, ShoppingCart, Database } from "lucide-react"

export default function SupplyChainDashboardPage() {
  return (
    <div className="min-h-screen bg-white">
 <div >
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Dashboard Supply Chain</h1>
          <p className="text-gray-600">Ringkasan keseluruhan data supply chain dan logistik</p>
        </div>

        {/* Coming Soon Notice */}
        <Card className="mb-8">
          <CardContent className="p-8 text-center">
            <div className="flex flex-col items-center gap-4">
              <div className="p-4 bg-blue-100 rounded-full">
                <Truck className="w-12 h-12 text-blue-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Coming Soon</h2>
                <p className="text-gray-600 mb-4">
                  Modul Supply Chain sedang dalam pengembangan. Fitur ini akan tersedia dalam waktu dekat.
                </p>
                <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                  <Clock className="w-4 h-4" />
                  <span>Estimasi peluncuran: Q2 2026</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Preview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="opacity-60">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Supplier</p>
                  <p className="text-2xl font-bold">-</p>
                  <p className="text-xs text-gray-400 mt-1">
                    Coming soon
                  </p>
                </div>
                <div className="p-3 bg-gray-100 rounded-full">
                  <Package className="w-6 h-6 text-gray-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="opacity-60">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Order Pending</p>
                  <p className="text-2xl font-bold">-</p>
                  <p className="text-xs text-gray-400 mt-1">
                    Coming soon
                  </p>
                </div>
                <div className="p-3 bg-gray-100 rounded-full">
                  <Clock className="w-6 h-6 text-gray-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="opacity-60">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Delivery On Time</p>
                  <p className="text-2xl font-bold">-</p>
                  <p className="text-xs text-gray-400 mt-1">
                    Coming soon
                  </p>
                </div>
                <div className="p-3 bg-gray-100 rounded-full">
                  <TrendingUp className="w-6 h-6 text-gray-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="opacity-60">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Inventory Alert</p>
                  <p className="text-2xl font-bold">-</p>
                  <p className="text-xs text-gray-400 mt-1">
                    Coming soon
                  </p>
                </div>
                <div className="p-3 bg-gray-100 rounded-full">
                  <AlertTriangle className="w-6 h-6 text-gray-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Access to Modules */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-4">Modul Supply Chain</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <a
              href="/supply-chain/pr"
              className="block p-6 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors border border-blue-200"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <FileText className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-blue-900">Purchase Request</h4>
                  <p className="text-sm text-blue-700">PR Management</p>
                </div>
              </div>
              <p className="text-sm text-blue-600">Buat dan kelola permintaan pembelian</p>
            </a>

            <a
              href="/supply-chain/po"
              className="block p-6 bg-green-50 hover:bg-green-100 rounded-lg transition-colors border border-green-200"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <ShoppingCart className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-green-900">Purchase Order</h4>
                  <p className="text-sm text-green-700">PO Management</p>
                </div>
              </div>
              <p className="text-sm text-green-600">Kelola order pembelian dan delivery</p>
            </a>

            <a
              href="/supply-chain/list-material"
              className="block p-6 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors border border-purple-200"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Database className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-purple-900">List Material</h4>
                  <p className="text-sm text-purple-700">Material Database</p>
                </div>
              </div>
              <p className="text-sm text-purple-600">Katalog material dan inventory</p>
            </a>
          </div>
        </div>

        {/* Features Preview */}
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-4">Fitur Lengkap Yang Akan Tersedia</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <h4 className="font-medium text-gray-900">Manajemen Supplier</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Database supplier lengkap</li>
                  <li>• Rating dan performa supplier</li>
                  <li>• Kontrak dan SLA management</li>
                  <li>• Vendor evaluation system</li>
                </ul>
              </div>

              <div className="space-y-3">
                <h4 className="font-medium text-gray-900">Purchase Order</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• PO creation & approval workflow</li>
                  <li>• Order tracking & status monitoring</li>
                  <li>• Delivery schedule management</li>
                  <li>• Payment processing integration</li>
                </ul>
              </div>

              <div className="space-y-3">
                <h4 className="font-medium text-gray-900">Inventory Management</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Real-time stock monitoring</li>
                  <li>• Low stock alerts & notifications</li>
                  <li>• Warehouse location tracking</li>
                  <li>• Inventory valuation reports</li>
                </ul>
              </div>

              <div className="space-y-3">
                <h4 className="font-medium text-gray-900">Logistics & Delivery</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Shipment tracking & tracing</li>
                  <li>• Delivery performance analytics</li>
                  <li>• Freight cost optimization</li>
                  <li>• Customer delivery notifications</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
