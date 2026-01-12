"use client"

import * as React from "react"
import Link from "next/link"
import { AlertTriangle, CheckCircle, User, Calendar, Send, Info, AlertCircle } from "lucide-react"
import { Card, CardContent } from "../../../../components/ui"
import Button from "../../../../components/ui/Button"
import { Alert, AlertDescription, AlertTitle } from "../../../../components/ui/alert"

// Mock data for documents pending approval
const mockPendingApproval = [
  {
    id: "1",
    type: "Surat Keluar",
    no_ref: "Pending",
    title: "Surat Penawaran Proyek Mall Terbaru",
    recipient: "PT Mega Konstruksi",
    submitter: "Alice Johnson",
    reviewer: "Manager Review",
    reviewed_at: "2026-01-11T15:00:00Z",
    priority: "high",
    review_notes: "Sudah diperiksa, siap untuk approval",
  },
  {
    id: "2",
    type: "Surat Keluar",
    no_ref: "Pending",
    title: "Surat Kerjasama Vendor Material",
    recipient: "CV Sumber Jaya",
    submitter: "David Lee",
    reviewer: "Manager Review",
    reviewed_at: "2026-01-10T11:30:00Z",
    priority: "normal",
    review_notes: "Konten sudah sesuai standar",
  },
]

export default function ApprovalPage() {
  return (
    <div className="container mx-auto">
      <div className="space-y-6">
        {/* Header */}
        <div className="mb-4">
          <h1 className="text-2xl font-bold text-brand-primary">Approval Dokumen</h1>
          <p className="text-gray-600">Dokumen yang menunggu approval final dari Anda</p>
        </div>

        {/* Info Alert */}
        <Alert className="bg-rose-50 border-rose-200">
          <AlertTriangle className="h-4 w-4 text-rose-600" />
          <AlertTitle className="text-rose-900">Preview Mode - Mock Data</AlertTitle>
          <AlertDescription className="text-rose-800">
            Halaman ini menampilkan dokumen yang sudah di-review dan menunggu approval final. Klik "Approve Sekarang" untuk memberikan persetujuan.
          </AlertDescription>
        </Alert>

        {/* Stats Card */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-blue-600">{mockPendingApproval.length}</p>
                <p className="text-sm text-gray-600 mt-1">Total Pending Approval</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-orange-600">
                  {mockPendingApproval.filter(d => d.priority === "high").length}
                </p>
                <p className="text-sm text-gray-600 mt-1">High Priority</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-green-600">0</p>
                <p className="text-sm text-gray-600 mt-1">Approved Today</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Documents List */}
        <div className="space-y-4">
          {mockPendingApproval.map((doc) => (
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
                          doc.priority === "high"
                            ? "bg-orange-100 text-orange-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {doc.priority === "high" ? "HIGH" : "Normal"}
                      </span>
                      <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-semibold">
                        ✅ Reviewed
                      </span>
                    </div>
                    <h3 className="text-lg font-semibold mb-1">{doc.title}</h3>
                    <div className="text-sm text-gray-600 space-y-1">
                      <p className="flex items-center gap-1"><Send className="h-3 w-3" /> Penerima: {doc.recipient}</p>
                      <p className="flex items-center gap-1"><User className="h-3 w-3" /> Diajukan oleh: {doc.submitter}</p>
                      <p className="flex items-center gap-1"><CheckCircle className="h-3 w-3" /> Di-review oleh: {doc.reviewer}</p>
                      <p className="flex items-center gap-1"><Calendar className="h-3 w-3" /> Tanggal Review: {new Date(doc.reviewed_at).toLocaleDateString("id-ID", {
                        day: "2-digit",
                        month: "long",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}</p>
                      {doc.review_notes && (
                        <p className="mt-2 p-2 bg-green-50 rounded border border-green-200">
                          💬 Catatan Review: {doc.review_notes}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Action Button */}
                  <div className="flex flex-col gap-2">
                    <Link href={`/dokumen/approval/${doc.id}`}>
                      <Button size="lg" className="w-full md:w-auto bg-green-600 hover:bg-green-700">
                        <CheckCircle className="mr-2 h-5 w-5" />
                        Approve Sekarang
                      </Button>
                    </Link>
                    <p className="text-xs text-gray-500 text-center">
                      {Math.floor((Date.now() - new Date(doc.reviewed_at).getTime()) / (1000 * 60 * 60))} jam sejak review
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Empty State (when no documents) */}
        {mockPendingApproval.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Semua Dokumen Sudah Di-approve</h3>
              <p className="text-gray-600">Tidak ada dokumen yang menunggu approval dari Anda saat ini.</p>
            </CardContent>
          </Card>
        )}

        {/* Info Box */}
        <Card>
          <CardContent className="p-6">
            <h3 className="font-semibold mb-4 flex items-center gap-2"><Info className="h-5 w-5" /> Tugas Approver</h3>
            <div className="space-y-2 text-sm text-gray-600">
              <p className="flex items-center gap-2"><CheckCircle className="h-4 w-4" /> Dokumen sudah melalui tahap review dan dinyatakan siap</p>
              <p className="flex items-center gap-2"><CheckCircle className="h-4 w-4" /> Berikan approval final untuk menerbitkan dokumen</p>
              <p className="flex items-center gap-2"><CheckCircle className="h-4 w-4" /> Setelah di-approve, nomor surat akan di-generate otomatis</p>
              <p className="flex items-center gap-2"><CheckCircle className="h-4 w-4" /> Dokumen yang di-approve akan berstatus "Published" dan siap dikirim</p>
              <p className="flex items-center gap-2"><AlertCircle className="h-4 w-4" /> Anda bisa reject jika masih ada yang perlu diperbaiki</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
