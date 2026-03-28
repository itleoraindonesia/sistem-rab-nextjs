import { Card, CardContent } from "@/components/ui"
import { FileText, Users, Clock, CheckCircle, AlertTriangle, TrendingUp } from "lucide-react"
import { getDashboardStats } from "@/lib/supabase/dashboard-stats"
import { formatDistanceToNow } from "date-fns"
import { id } from "date-fns/locale"
import { cn } from "@/lib/utils"

export default async function AdministrasiDashboardPage() {
  const { stats, recentDocuments } = await getDashboardStats()

  const getStatusColor = (status: string) => {
    switch (status.toUpperCase()) {
      case 'DRAFT': return 'bg-gray-100 text-gray-800'
      case 'SUBMITTED_TO_REVIEW': return 'bg-yellow-100 text-yellow-800'
      case 'REVIEWED': return 'bg-blue-100 text-blue-800'
      case 'APPROVED': return 'bg-green-100 text-green-800'
      case 'REJECTED': return 'bg-red-100 text-red-800'
      case 'REVISION_REQUESTED': return 'bg-orange-100 text-orange-800'
      default: return 'bg-blue-100 text-blue-800'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status.toUpperCase()) {
      case 'DRAFT': return 'Draft'
      case 'SUBMITTED_TO_REVIEW': return 'Menunggu Review'
      case 'REVIEWED': return 'Telah Direview'
      case 'APPROVED': return 'Disetujui'
      case 'REJECTED': return 'Ditolak'
      case 'REVISION_REQUESTED': return 'Revisi'
      default: return status
    }
  }

  return (
    <div className="min-h-screen bg-white">
      <div>
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Dashboard Administrasi</h1>
          <p className="text-gray-600">Ringkasan keseluruhan data administrasi & dokumen</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Surat Keluar</p>
                  <p className="text-2xl font-bold">{stats.totalLetters}</p>
                  <p className="text-xs text-green-600 flex items-center mt-1">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    Data terbaru
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
                  <p className="text-sm text-gray-600">Meeting & MoM</p>
                  <p className="text-2xl font-bold">{stats.totalMemos}</p>
                  <p className="text-xs text-green-600 flex items-center mt-1">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    Total MoM
                  </p>
                </div>
                <div className="p-3 bg-green-100 rounded-full">
                  <Users className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Menunggu Review</p>
                  <p className="text-2xl font-bold">{stats.pendingReviews}</p>
                  <p className="text-xs text-orange-600 flex items-center mt-1">
                    <Clock className="w-3 h-3 mr-1" />
                    Perlu perhatian
                  </p>
                </div>
                <div className="p-3 bg-orange-100 rounded-full">
                  <Clock className="w-6 h-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Disetujui Bulan Ini</p>
                  <p className="text-2xl font-bold">{stats.approvedThisMonth}</p>
                  <p className="text-xs text-green-600 flex items-center mt-1">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Target tercapai
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
          {/* Recent Documents */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Dokumen Terbaru</h3>
                <a href="/documents/outgoing-letter" className="text-sm text-blue-600 hover:underline">Lihat semua</a>
              </div>
              <div className="space-y-3">
                {recentDocuments.length > 0 ? (
                  recentDocuments.map((doc) => (
                    <div key={doc.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center">
                          <FileText className="w-4 h-4 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium text-sm line-clamp-1">{doc.title}</p>
                          <p className="text-xs text-gray-500">
                            {formatDistanceToNow(new Date(doc.time), { addSuffix: true, locale: id })} • {doc.type}
                          </p>
                        </div>
                      </div>
                      <span className={cn("px-2 py-1 text-xs rounded-full whitespace-nowrap", getStatusColor(doc.status))}>
                        {getStatusLabel(doc.status)}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <p>Belum ada dokumen terbaru</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4">Aksi Cepat</h3>
              <div className="space-y-3">
                <a
                  href="/documents/outgoing-letter/new"
                  className="flex items-center justify-between p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <FileText className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium">Buat Surat Keluar Baru</p>
                      <p className="text-sm text-gray-600">Surat resmi ke pihak eksternal</p>
                    </div>
                  </div>
                  <span className="text-blue-600">→</span>
                </a>

                <a
                  href="/documents/memo/baru"
                  className="flex items-center justify-between p-4 bg-green-50 hover:bg-green-100 rounded-lg transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <Users className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium">Buat Memo Internal</p>
                      <p className="text-sm text-gray-600">Komunikasi internal perusahaan</p>
                    </div>
                  </div>
                  <span className="text-green-600">→</span>
                </a>

                <a
                  href="/documents/mom/baru"
                  className="flex items-center justify-between p-4 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                      <Users className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="font-medium">Buat MoM Meeting</p>
                      <p className="text-sm text-gray-600">Rekaman hasil rapat</p>
                    </div>
                  </div>
                  <span className="text-purple-600">→</span>
                </a>
              </div>

              {/* Alerts */}
              {stats.pendingReviews > 0 && (
                <div className="mt-6 p-4 bg-orange-50 border border-orange-200 rounded-lg">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-orange-600 mt-0.5" />
                    <div>
                      <p className="font-medium text-orange-900">Perhatian</p>
                      <p className="text-sm text-orange-800 mt-1">
                        Ada {stats.pendingReviews} dokumen menunggu review. Segera lakukan approval untuk mempercepat proses.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
