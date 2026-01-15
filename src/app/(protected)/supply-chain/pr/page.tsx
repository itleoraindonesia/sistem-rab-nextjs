import { Card, CardContent } from "@/components/ui"
import { FileText, Clock, AlertTriangle, CheckCircle, TrendingUp, Users } from "lucide-react"

export default function PRPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Purchase Request (PR)</h1>
          <p className="text-gray-600">Permintaan pembelian material dan barang</p>
        </div>

        {/* Coming Soon Notice */}
        <Card className="mb-8">
          <CardContent className="p-8 text-center">
            <div className="flex flex-col items-center gap-4">
              <div className="p-4 bg-blue-100 rounded-full">
                <FileText className="w-12 h-12 text-blue-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Purchase Request</h2>
                <p className="text-gray-600 mb-4">
                  Modul Purchase Request sedang dalam pengembangan. Fitur ini akan membantu Anda membuat permintaan pembelian dengan mudah.
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
                  <p className="text-sm text-gray-600">PR Pending</p>
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

          <Card className="opacity-60">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">PR Approved</p>
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
                  <p className="text-sm text-gray-600">Total Value</p>
                  <p className="text-2xl font-bold">-</p>
                  <p className="text-xs text-gray-400 mt-1">
                    Coming soon
                  </p>
                </div>
                <div className="p-3 bg-blue-100 rounded-full">
                  <TrendingUp className="w-6 h-6 text-blue-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="opacity-60">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Active Requests</p>
                  <p className="text-2xl font-bold">-</p>
                  <p className="text-xs text-gray-400 mt-1">
                    Coming soon
                  </p>
                </div>
                <div className="p-3 bg-purple-100 rounded-full">
                  <FileText className="w-6 h-6 text-purple-400" />
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
                <h4 className="font-medium text-gray-900">Request Management</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Buat PR dengan mudah dan cepat</li>
                  <li>• Template PR untuk berbagai jenis material</li>
                  <li>• Auto-calculation untuk quantity dan budget</li>
                  <li>• Approval workflow otomatis</li>
                </ul>
              </div>

              <div className="space-y-3">
                <h4 className="font-medium text-gray-900">Tracking & Monitoring</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Real-time status tracking</li>
                  <li>• Notification system untuk approver</li>
                  <li>• History dan audit trail lengkap</li>
                  <li>• Integration dengan inventory system</li>
                </ul>
              </div>

              <div className="space-y-3">
                <h4 className="font-medium text-gray-900">Budget Control</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Budget validation otomatis</li>
                  <li>• Cost center allocation</li>
                  <li>• Multi-currency support</li>
                  <li>• Budget utilization reports</li>
                </ul>
              </div>

              <div className="space-y-3">
                <h4 className="font-medium text-gray-900">Vendor Management</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Preferred vendor database</li>
                  <li>• Quotation comparison tools</li>
                  <li>• Contract reference system</li>
                  <li>• Performance tracking</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
