import { Card, CardContent } from "@/components/ui"
import { ShoppingCart, Clock, AlertTriangle, CheckCircle, TrendingUp, Users } from "lucide-react"

export default function POPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Purchase Order (PO)</h1>
          <p className="text-gray-600">Order pembelian material dan barang</p>
        </div>

        {/* Coming Soon Notice */}
        <Card className="mb-8">
          <CardContent className="p-8 text-center">
            <div className="flex flex-col items-center gap-4">
              <div className="p-4 bg-green-100 rounded-full">
                <ShoppingCart className="w-12 h-12 text-green-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Purchase Order</h2>
                <p className="text-gray-600 mb-4">
                  Modul Purchase Order sedang dalam pengembangan. Fitur ini akan membantu Anda mengelola order pembelian dari approved PR.
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
                  <p className="text-sm text-gray-600">PO Active</p>
                  <p className="text-2xl font-bold">-</p>
                  <p className="text-xs text-gray-400 mt-1">
                    Coming soon
                  </p>
                </div>
                <div className="p-3 bg-blue-100 rounded-full">
                  <ShoppingCart className="w-6 h-6 text-blue-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="opacity-60">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">PO Delivered</p>
                  <p className="text-2xl font-bold">-</p>
                  <p className="text-xs text-gray-400 mt-1">
                    Coming soon
                  </p>
                </div>
                <div className="p-3 bg-green-100 rounded-full">
                  <CheckCircle className="w-6 h-6 text-green-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="opacity-60">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Order Value</p>
                  <p className="text-2xl font-bold">-</p>
                  <p className="text-xs text-gray-400 mt-1">
                    Coming soon
                  </p>
                </div>
                <div className="p-3 bg-purple-100 rounded-full">
                  <TrendingUp className="w-6 h-6 text-purple-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="opacity-60">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Pending Delivery</p>
                  <p className="text-2xl font-bold">-</p>
                  <p className="text-xs text-gray-400 mt-1">
                    Coming soon
                  </p>
                </div>
                <div className="p-3 bg-orange-100 rounded-full">
                  <Clock className="w-6 h-6 text-orange-400" />
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
                <h4 className="font-medium text-gray-900">Order Processing</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Convert PR ke PO otomatis</li>
                  <li>• Vendor selection berdasarkan kontrak</li>
                  <li>• Price negotiation tools</li>
                  <li>• Multi-item order support</li>
                </ul>
              </div>

              <div className="space-y-3">
                <h4 className="font-medium text-gray-900">Delivery Management</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Delivery schedule tracking</li>
                  <li>• Partial delivery handling</li>
                  <li>• Quality inspection workflow</li>
                  <li>• Goods receipt processing</li>
                </ul>
              </div>

              <div className="space-y-3">
                <h4 className="font-medium text-gray-900">Financial Integration</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Auto-invoice generation</li>
                  <li>• Payment terms management</li>
                  <li>• Tax calculation otomatis</li>
                  <li>• Budget impact tracking</li>
                </ul>
              </div>

              <div className="space-y-3">
                <h4 className="font-medium text-gray-900">Reporting & Analytics</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Purchase performance reports</li>
                  <li>• Vendor performance metrics</li>
                  <li>• Cost analysis tools</li>
                  <li>• Trend analysis dashboard</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
