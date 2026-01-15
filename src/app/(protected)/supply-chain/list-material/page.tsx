import { Card, CardContent } from "@/components/ui"
import { Package, Clock, AlertTriangle, CheckCircle, TrendingUp, Database } from "lucide-react"

export default function ListMaterialPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">List Material</h1>
          <p className="text-gray-600">Database material dan inventory management</p>
        </div>

        {/* Coming Soon Notice */}
        <Card className="mb-8">
          <CardContent className="p-8 text-center">
            <div className="flex flex-col items-center gap-4">
              <div className="p-4 bg-purple-100 rounded-full">
                <Database className="w-12 h-12 text-purple-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Material Database</h2>
                <p className="text-gray-600 mb-4">
                  Modul Material Database sedang dalam pengembangan. Fitur ini akan menyediakan katalog lengkap material dan inventory tracking.
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
                  <p className="text-sm text-gray-600">Total Materials</p>
                  <p className="text-2xl font-bold">-</p>
                  <p className="text-xs text-gray-400 mt-1">
                    Coming soon
                  </p>
                </div>
                <div className="p-3 bg-blue-100 rounded-full">
                  <Package className="w-6 h-6 text-blue-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="opacity-60">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Low Stock Items</p>
                  <p className="text-2xl font-bold">-</p>
                  <p className="text-xs text-gray-400 mt-1">
                    Coming soon
                  </p>
                </div>
                <div className="p-3 bg-orange-100 rounded-full">
                  <AlertTriangle className="w-6 h-6 text-orange-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="opacity-60">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Inventory Value</p>
                  <p className="text-2xl font-bold">-</p>
                  <p className="text-xs text-gray-400 mt-1">
                    Coming soon
                  </p>
                </div>
                <div className="p-3 bg-green-100 rounded-full">
                  <TrendingUp className="w-6 h-6 text-green-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="opacity-60">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Active Suppliers</p>
                  <p className="text-2xl font-bold">-</p>
                  <p className="text-xs text-gray-400 mt-1">
                    Coming soon
                  </p>
                </div>
                <div className="p-3 bg-purple-100 rounded-full">
                  <CheckCircle className="w-6 h-6 text-purple-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Features Preview */}
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-4">Fitur Yang Akan Tersedia</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <h4 className="font-medium text-gray-900">Material Catalog</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Comprehensive material database</li>
                  <li>• Category and sub-category organization</li>
                  <li>• Technical specifications & datasheets</li>
                  <li>• Alternative material suggestions</li>
                </ul>
              </div>

              <div className="space-y-3">
                <h4 className="font-medium text-gray-900">Inventory Management</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Real-time stock level monitoring</li>
                  <li>• Automated reorder point alerts</li>
                  <li>• Warehouse location tracking</li>
                  <li>• Batch and serial number tracking</li>
                </ul>
              </div>

              <div className="space-y-3">
                <h4 className="font-medium text-gray-900">Supplier Integration</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Supplier catalog integration</li>
                  <li>• Preferred supplier flagging</li>
                  <li>• Lead time and pricing history</li>
                  <li>• Quality rating system</li>
                </ul>
              </div>

              <div className="space-y-3">
                <h4 className="font-medium text-gray-900">Analytics & Reporting</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Material usage analytics</li>
                  <li>• Cost trend analysis</li>
                  <li>• Inventory turnover reports</li>
                  <li>• Demand forecasting tools</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
