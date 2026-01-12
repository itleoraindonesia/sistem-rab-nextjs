"use client"

import * as React from "react"
import Link from "next/link"
import { AlertTriangle, CheckCircle, User, Calendar, Send, Info } from "lucide-react"
import { Card, CardContent } from "../../../../components/ui"
import Button from "../../../../components/ui/Button"
import { Alert, AlertDescription, AlertTitle } from "../../../../components/ui/alert"

// Mock data for documents pending review
const mockPendingReview = [
  {
    id: "1",
    type: "Surat Keluar",
    no_ref: "Pending",
    title: "Surat Penawaran Proyek Perumahan Griya Asri",
    recipient: "PT Maju Jaya Konstruksi",
    submitter: "John Doe",
    submitted_at: "2026-01-10T10:00:00Z",
    priority: "normal",
  },
  {
    id: "2",
    type: "Surat Keluar",
    no_ref: "Pending",
    title: "Surat Kontrak Kerjasama Proyek Gedung Perkantoran",
    recipient: "CV Berkah Abadi",
    submitter: "Jane Smith",
    submitted_at: "2026-01-09T14:30:00Z",
    priority: "high",
  },
  {
    id: "3",
    type: "Surat Keluar",
    no_ref: "Pending",
    title: "Surat Pemberitahuan Perubahan Harga Material",
    recipient: "PT Sumber Makmur",
    submitter: "Bob Wilson",
    submitted_at: "2026-01-08T09:15:00Z",
    priority: "urgent",
  },
]

export default function ReviewPage() {
  return (
    <div className="container mx-auto">
      <div className="space-y-6">
        {/* Header */}
        <div className="mb-4">
          <h1 className="text-2xl font-bold text-brand-primary">Review Dokumen</h1>
          <p className="text-gray-600">Dokumen yang menunggu review dari Anda</p>
        </div>

        {/* Info Alert */}
        <Alert className="bg-rose-50 border-rose-200">
          <AlertTriangle className="h-4 w-4 text-rose-600" />
          <AlertTitle className="text-rose-900">Preview Mode - Mock Data</AlertTitle>
          <AlertDescription className="text-rose-800">
            Halaman ini menampilkan dokumen yang perlu di-review. Klik "Review Sekarang" untuk melihat detail dan memberikan review.
          </AlertDescription>
        </Alert>

        {/* Stats Card */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-orange-600">{mockPendingReview.length}</p>
                <p className="text-sm text-gray-600 mt-1">Total Pending Review</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-red-600">
                  {mockPendingReview.filter(d => d.priority === "urgent").length}
                </p>
                <p className="text-sm text-gray-600 mt-1">Urgent</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-green-600">0</p>
                <p className="text-sm text-gray-600 mt-1">Reviewed Today</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Documents List */}
        <div className="space-y-4">
          {mockPendingReview.map((doc) => (
            <Card key={doc.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  {/* Document Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-semibold">
                        {doc.type}
                      </span>
                      <span
                        className={`px-2 py-1 rounded text-xs font-semibold ${
                          doc.priority === "urgent"
                            ? "bg-red-100 text-red-800"
                            : doc.priority === "high"
                            ? "bg-orange-100 text-orange-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {doc.priority === "urgent"
                          ? "🔴 URGENT"
                          : doc.priority === "high"
                          ? "🟠 HIGH"
                          : "Normal"}
                      </span>
                    </div>
                    <h3 className="text-lg font-semibold mb-1">{doc.title}</h3>
                    <div className="text-sm text-gray-600 space-y-1">
                      <p className="flex items-center gap-1"><Send className="h-3 w-3" /> Penerima: {doc.recipient}</p>
                      <p className="flex items-center gap-1"><User className="h-3 w-3" /> Diajukan oleh: {doc.submitter}</p>
                      <p className="flex items-center gap-1"><Calendar className="h-3 w-3" /> Tanggal: {new Date(doc.submitted_at).toLocaleDateString("id-ID", {
                        day: "2-digit",
                        month: "long",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}</p>
                    </div>
                  </div>

                  {/* Action Button */}
                  <div className="flex flex-col gap-2">
                    <Link href={`/dokumen/review/${doc.id}`}>
                      <Button size="lg" className="w-full md:w-auto">
                        <CheckCircle className="mr-2 h-5 w-5" />
                        Review Sekarang
                      </Button>
                    </Link>
                    <p className="text-xs text-gray-500 text-center">
                      {Math.floor((Date.now() - new Date(doc.submitted_at).getTime()) / (1000 * 60 * 60))} jam yang lalu
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Empty State (when no documents) */}
        {mockPendingReview.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Semua Dokumen Sudah Di-review</h3>
              <p className="text-gray-600">Tidak ada dokumen yang menunggu review dari Anda saat ini.</p>
            </CardContent>
          </Card>
        )}

        {/* Info Box */}
        <Card>
          <CardContent className="p-6">
            <h3 className="font-semibold mb-4 flex items-center gap-2"><Info className="h-5 w-5" /> Tugas Reviewer</h3>
            <div className="space-y-2 text-sm text-gray-600">
              <p className="flex items-center gap-2"><CheckCircle className="h-4 w-4" /> Periksa kelengkapan dan kebenaran isi dokumen</p>
              <p className="flex items-center gap-2"><CheckCircle className="h-4 w-4" /> Berikan feedback jika ada yang perlu diperbaiki</p>
              <p className="flex items-center gap-2"><CheckCircle className="h-4 w-4" /> Approve untuk lanjut ke tahap Approval, atau Request Revision untuk perbaikan</p>
              <p>⚠️ Dokumen dengan priority URGENT sebaiknya di-review dalam 24 jam</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
