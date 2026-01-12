"use client"

import * as React from "react"
import Link from "next/link"
import { FileText, Mail, MessageSquare, Calendar, ClipboardCheck, CheckSquare, TrendingUp, Clock } from "lucide-react"
import { Card, CardContent } from "../../../components/ui"
import Button from "../../../components/ui/Button"

// Mock statistics data
const stats = {
  suratKeluar: {
    total: 45,
    draft: 5,
    underReview: 3,
    approved: 2,
    published: 35,
  },
  memo: {
    total: 28,
    draft: 3,
    underReview: 2,
    approved: 1,
    published: 22,
  },
  mom: {
    total: 15,
    draft: 2,
    published: 13,
  },
  review: {
    pending: 3,
    reviewedToday: 5,
  },
  approval: {
    pending: 2,
    approvedToday: 3,
  },
}

const recentDocuments = [
  {
    id: "1",
    type: "Surat Keluar",
    title: "Surat Penawaran Proyek Mall",
    status: "Under Review",
    date: "2026-01-12T10:00:00Z",
  },
  {
    id: "2",
    type: "Internal Memo",
    title: "Pengumuman Libur Akhir Tahun",
    status: "Published",
    date: "2026-01-11T15:00:00Z",
  },
  {
    id: "3",
    type: "MoM Meeting",
    title: "Meeting Evaluasi Q4 2025",
    status: "Published",
    date: "2026-01-10T14:00:00Z",
  },
]

export default function DokumenDashboardPage() {
  return (
    <div className="container mx-auto">
      <div className="space-y-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-brand-primary">Dashboard Dokumen</h1>
          <p className="text-gray-600 mt-2">Overview dan statistik semua dokumen perusahaan</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Dokumen</p>
                  <p className="text-3xl font-bold text-brand-primary mt-1">
                    {stats.suratKeluar.total + stats.memo.total + stats.mom.total}
                  </p>
                </div>
                <FileText className="h-12 w-12 text-blue-500 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Pending Review</p>
                  <p className="text-3xl font-bold text-orange-600 mt-1">{stats.review.pending}</p>
                </div>
                <ClipboardCheck className="h-12 w-12 text-orange-500 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Pending Approval</p>
                  <p className="text-3xl font-bold text-green-600 mt-1">{stats.approval.pending}</p>
                </div>
                <CheckSquare className="h-12 w-12 text-green-500 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Published Bulan Ini</p>
                  <p className="text-3xl font-bold text-blue-600 mt-1">
                    {stats.suratKeluar.published + stats.memo.published + stats.mom.published}
                  </p>
                </div>
                <TrendingUp className="h-12 w-12 text-blue-500 opacity-20" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Document Types Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Surat Keluar */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Mail className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Surat Keluar</h3>
                  <p className="text-sm text-gray-600">Outgoing Letters</p>
                </div>
              </div>
              
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Total:</span>
                  <span className="font-semibold">{stats.suratKeluar.total}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Draft:</span>
                  <span className="font-semibold">{stats.suratKeluar.draft}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Under Review:</span>
                  <span className="font-semibold text-orange-600">{stats.suratKeluar.underReview}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Published:</span>
                  <span className="font-semibold text-green-600">{stats.suratKeluar.published}</span>
                </div>
              </div>

              <Link href="/dokumen/surat-keluar">
                <Button className="w-full" variant="outline">
                  Lihat Semua
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Internal Memo */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <MessageSquare className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Internal Memo</h3>
                  <p className="text-sm text-gray-600">Internal Communication</p>
                </div>
              </div>
              
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Total:</span>
                  <span className="font-semibold">{stats.memo.total}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Draft:</span>
                  <span className="font-semibold">{stats.memo.draft}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Under Review:</span>
                  <span className="font-semibold text-orange-600">{stats.memo.underReview}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Published:</span>
                  <span className="font-semibold text-green-600">{stats.memo.published}</span>
                </div>
              </div>

              <Link href="/dokumen/memo">
                <Button className="w-full" variant="outline">
                  Lihat Semua
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* MoM Meeting */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-green-100 rounded-lg">
                  <Calendar className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">MoM Meeting</h3>
                  <p className="text-sm text-gray-600">Minutes of Meeting</p>
                </div>
              </div>
              
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Total:</span>
                  <span className="font-semibold">{stats.mom.total}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Draft:</span>
                  <span className="font-semibold">{stats.mom.draft}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Published:</span>
                  <span className="font-semibold text-green-600">{stats.mom.published}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">&nbsp;</span>
                  <span>&nbsp;</span>
                </div>
              </div>

              <Link href="/dokumen/mom">
                <Button className="w-full" variant="outline">
                  Lihat Semua
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Recent Documents */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Dokumen Terbaru
              </h3>
            </div>
            
            <div className="space-y-3">
              {recentDocuments.map((doc) => (
                <div
                  key={doc.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-semibold">
                        {doc.type}
                      </span>
                      <span
                        className={`px-2 py-1 rounded text-xs font-semibold ${
                          doc.status === "Published"
                            ? "bg-green-100 text-green-800"
                            : "bg-orange-100 text-orange-800"
                        }`}
                      >
                        {doc.status}
                      </span>
                    </div>
                    <p className="font-medium">{doc.title}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(doc.date).toLocaleDateString("id-ID", {
                        day: "2-digit",
                        month: "long",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                  <Button variant="ghost" size="sm">
                    Detail
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Link href="/dokumen/surat-keluar/baru">
                <Button className="w-full" variant="outline">
                  <Mail className="mr-2 h-4 w-4" />
                  Buat Surat Baru
                </Button>
              </Link>
              <Link href="/dokumen/memo/baru">
                <Button className="w-full" variant="outline">
                  <MessageSquare className="mr-2 h-4 w-4" />
                  Buat Memo Baru
                </Button>
              </Link>
              <Link href="/dokumen/review">
                <Button className="w-full" variant="outline">
                  <ClipboardCheck className="mr-2 h-4 w-4" />
                  Review ({stats.review.pending})
                </Button>
              </Link>
              <Link href="/dokumen/approval">
                <Button className="w-full" variant="outline">
                  <CheckSquare className="mr-2 h-4 w-4" />
                  Approval ({stats.approval.pending})
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
