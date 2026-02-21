"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Download, Printer, MessageSquare, Hash, BarChart3 } from "lucide-react"
import { Card, CardContent } from "../../../../../components/ui"
import Button from "../../../../../components/ui/Button"

// Mock document data
const mockMemo = {
  id: "1",
  no_ref: "MEMO/HR/001/I/2026",
  type: "Internal Memo",
  title: "Pengumuman Libur Akhir Tahun 2026",
  priority: "normal",
  recipients: [
    { name: "All Staff", department: "Semua Departemen" },
    { name: "Management", department: "Management" },
  ],
  content: `Kepada Seluruh Karyawan PT Leora Indonesia,

Dengan hormat,

Sehubungan dengan perayaan Akhir Tahun 2026, kami informasikan jadwal libur kantor sebagai berikut:

**Jadwal Libur:**
• Tanggal 24 Desember 2026 (Selasa) - Libur Nasional Natal
• Tanggal 25 Desember 2026 (Rabu) - Cuti Bersama
• Tanggal 31 Desember 2026 (Selasa) - Cuti Bersama Tahun Baru
• Tanggal 1 Januari 2027 (Rabu) - Libur Nasional Tahun Baru

**Operasional Kantor:**
• Kantor akan tutup mulai 24 Desember 2026 - 1 Januari 2027
• Kantor akan beroperasi kembali normal pada tanggal 4 Januari 2027 (Senin)
• Security dan maintenance tetap bertugas selama masa libur

**Hal-hal yang Perlu Diperhatikan:**
1. Pastikan semua pekerjaan urgent diselesaikan sebelum tanggal 23 Desember 2026
2. Matikan semua peralatan elektronik sebelum meninggalkan kantor
3. Pastikan ruangan terkunci dengan baik
4. Untuk keperluan mendesak, hubungi security kantor

Kami mengucapkan Selamat Natal dan Tahun Baru 2027 kepada seluruh karyawan dan keluarga. Semoga tahun yang akan datang membawa kesuksesan dan kebahagiaan bagi kita semua.

Terima kasih atas perhatian dan kerjasamanya.`,
  created_by: "HR Department",
  created_at: "2026-01-10T10:00:00Z",
  reviewed_by: "HR Manager",
  reviewed_at: "2026-01-10T14:00:00Z",
  approved_by: "Director",
  approved_at: "2026-01-11T09:00:00Z",
  published_at: "2026-01-11T15:00:00Z",
  status: "published",
}

export default function MemoDetailPage() {
  const router = useRouter()

  return (
 <div >
      <div className="space-y-6">
        {/* Header Actions */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => router.back()}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-brand-primary">Preview Internal Memo</h1>
              <p className="text-gray-600">{mockMemo.no_ref}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <Printer className="mr-2 h-4 w-4" />
              Print
            </Button>
            <Button>
              <Download className="mr-2 h-4 w-4" />
              Download PDF
            </Button>
          </div>
        </div>

        {/* Memo Preview - A4 Format */}
        <Card className="shadow-lg">
          <CardContent className="p-0">
            {/* A4 Paper Simulation */}
            <div className="bg-white" style={{ aspectRatio: "210/297" }}>
              {/* HEADER - Company Letterhead */}
              <div className="border-b-4 border-brand-primary p-8">
                <div className="flex items-start justify-between">
                  {/* Logo & Company Info */}
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-brand-primary rounded-lg flex items-center justify-center text-white font-bold text-2xl">
                      L
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-brand-primary">PT LEORA INDONESIA</h2>
                      <p className="text-sm text-gray-600 mt-1">Solar Panel & Renewable Energy Solutions</p>
                    </div>
                  </div>
                  {/* Contact Info */}
                  <div className="text-right text-sm text-gray-600">
                    <p>Jl. Raya Industri No. 456</p>
                    <p>Jakarta Selatan 12345</p>
                    <p className="mt-2">Tel: (021) 1234-5678</p>
                    <p>Email: info@leora.co.id</p>
                  </div>
                </div>
              </div>

              {/* MEMO HEADER */}
              <div className="p-8">
                <div className="text-center border-b-2 border-gray-300 pb-4 mb-6">
                  <h3 className="text-2xl font-bold text-brand-primary">INTERNAL MEMO</h3>
                  <div className="mt-2 flex items-center justify-center gap-2">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        mockMemo.priority === "urgent"
                          ? "bg-red-100 text-red-800"
                          : mockMemo.priority === "high"
                          ? "bg-orange-100 text-orange-800"
                          : "bg-blue-100 text-blue-800"
                      }`}
                    >
                      {mockMemo.priority === "urgent"
                        ? "🔴 URGENT"
                        : mockMemo.priority === "high"
                        ? "🟠 HIGH PRIORITY"
                        : "NORMAL"}
                    </span>
                  </div>
                </div>

                {/* Memo Info */}
                <div className="space-y-3 mb-6 text-sm">
                  <div className="grid grid-cols-4 gap-2">
                    <div className="font-semibold">Nomor:</div>
                    <div className="col-span-3 font-mono">{mockMemo.no_ref}</div>
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    <div className="font-semibold">Tanggal:</div>
                    <div className="col-span-3">
                      {new Date(mockMemo.published_at).toLocaleDateString("id-ID", {
                        day: "2-digit",
                        month: "long",
                        year: "numeric"
                      })}
                    </div>
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    <div className="font-semibold">Dari:</div>
                    <div className="col-span-3">{mockMemo.created_by}</div>
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    <div className="font-semibold">Kepada:</div>
                    <div className="col-span-3">
                      {mockMemo.recipients.map((r, i) => (
                        <div key={i}>• {r.name} ({r.department})</div>
                      ))}
                    </div>
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    <div className="font-semibold">Perihal:</div>
                    <div className="col-span-3 font-semibold">{mockMemo.title}</div>
                  </div>
                </div>

                <div className="border-t-2 border-gray-200 pt-4"></div>

                {/* Body */}
                <div className="text-sm leading-relaxed whitespace-pre-line mt-6">
                  {mockMemo.content}
                </div>

                {/* Signature Section */}
                <div className="mt-12 grid grid-cols-2 gap-8">
                  {/* Reviewed By */}
                  <div className="text-center">
                    <p className="text-sm mb-16">Diperiksa oleh,</p>
                    <div className="border-t-2 border-gray-800 pt-2">
                      <p className="font-semibold">{mockMemo.reviewed_by}</p>
                      <p className="text-sm text-gray-600">Reviewer</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(mockMemo.reviewed_at).toLocaleDateString("id-ID")}
                      </p>
                    </div>
                  </div>

                  {/* Approved By */}
                  <div className="text-center">
                    <p className="text-sm mb-16">Disetujui oleh,</p>
                    <div className="border-t-2 border-gray-800 pt-2">
                      <p className="font-semibold">{mockMemo.approved_by}</p>
                      <p className="text-sm text-gray-600">Approver</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(mockMemo.approved_at).toLocaleDateString("id-ID")}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* FOOTER */}
              <div className="border-t-2 border-brand-primary p-4 mt-8">
                <div className="flex justify-between items-center text-xs text-gray-600">
                  <p>© 2026 PT Leora Indonesia - Internal Communication</p>
                  <p>Halaman 1 dari 1</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Audit Trail / Document Flow */}
        <Card>
          <CardContent className="p-6">
            <h3 className="font-semibold mb-6 flex items-center gap-2"><BarChart3 className="h-5 w-5" /> Audit Trail - Alur Dokumen</h3>
            <div className="space-y-4">
              {/* Timeline */}
              <div className="relative">
                {/* Vertical Line */}
                <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200"></div>

                {/* Timeline Items */}
                <div className="space-y-6">
                  {/* 1. Created */}
                  <div className="relative flex gap-4">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-white font-bold z-10">
                      ✓
                    </div>
                    <div className="flex-1 pb-4">
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-semibold text-green-900">Draft Created</p>
                            <p className="text-sm text-green-700 mt-1">
                              Memo dibuat oleh <strong>{mockMemo.created_by}</strong>
                            </p>
                          </div>
                          <span className="text-xs text-green-600 font-medium">
                            {new Date(mockMemo.created_at).toLocaleDateString("id-ID", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit"
                            })}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 2. Submitted */}
                  <div className="relative flex gap-4">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-white font-bold z-10">
                      ✓
                    </div>
                    <div className="flex-1 pb-4">
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-semibold text-green-900">Submitted for Review</p>
                            <p className="text-sm text-green-700 mt-1">
                              Memo disubmit untuk review
                            </p>
                          </div>
                          <span className="text-xs text-green-600 font-medium">
                            {new Date("2026-01-10T11:00:00Z").toLocaleDateString("id-ID", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit"
                            })}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 3. Reviewed */}
                  <div className="relative flex gap-4">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-white font-bold z-10">
                      ✓
                    </div>
                    <div className="flex-1 pb-4">
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-semibold text-green-900">Reviewed</p>
                            <p className="text-sm text-green-700 mt-1">
                              Direview oleh <strong>{mockMemo.reviewed_by}</strong>
                            </p>
                            <p className="text-xs text-green-600 mt-2 italic flex items-center gap-1">
                              <MessageSquare className="h-3 w-3" />
                              Catatan: "Informasi sudah lengkap dan jelas"
                            </p>
                          </div>
                          <span className="text-xs text-green-600 font-medium">
                            {new Date(mockMemo.reviewed_at).toLocaleDateString("id-ID", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit"
                            })}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 4. Approved */}
                  <div className="relative flex gap-4">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-white font-bold z-10">
                      ✓
                    </div>
                    <div className="flex-1 pb-4">
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-semibold text-green-900">Approved</p>
                            <p className="text-sm text-green-700 mt-1">
                              Disetujui oleh <strong>{mockMemo.approved_by}</strong>
                            </p>
                            <p className="text-xs text-green-600 mt-2 flex items-center gap-1">
                              <Hash className="h-3 w-3" />
                              Nomor memo: <strong className="font-mono">{mockMemo.no_ref}</strong>
                            </p>
                          </div>
                          <span className="text-xs text-green-600 font-medium">
                            {new Date(mockMemo.approved_at).toLocaleDateString("id-ID", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit"
                            })}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 5. Published */}
                  <div className="relative flex gap-4">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold z-10">
                      ✓
                    </div>
                    <div className="flex-1">
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-semibold text-blue-900">Published</p>
                            <p className="text-sm text-blue-700 mt-1">
                              Memo telah dipublikasikan ke {mockMemo.recipients.length} penerima
                            </p>
                            <div className="mt-2">
                              {mockMemo.recipients.map((r, i) => (
                                <span key={i} className="inline-block text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded mr-2 mb-1">
                                  {r.name}
                                </span>
                              ))}
                            </div>
                          </div>
                          <span className="text-xs text-blue-600 font-medium">
                            {new Date(mockMemo.published_at).toLocaleDateString("id-ID", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit"
                            })}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Summary Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6 pt-6 border-t">
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <p className="text-2xl font-bold text-gray-900">5</p>
                  <p className="text-sm text-gray-600">Total Steps</p>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <p className="text-2xl font-bold text-gray-900">
                    {Math.floor((new Date(mockMemo.published_at).getTime() - new Date(mockMemo.created_at).getTime()) / (1000 * 60 * 60))}h
                  </p>
                  <p className="text-sm text-gray-600">Processing Time</p>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <p className="text-2xl font-bold text-green-600">100%</p>
                  <p className="text-sm text-gray-600">Completion</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Document Metadata */}
        <Card>
          <CardContent className="p-6">
            <h3 className="font-semibold mb-4">📋 Informasi Dokumen</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-600">Status:</p>
                <p className="font-medium">
                  <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">
                    ✅ Published
                  </span>
                </p>
              </div>
              <div>
                <p className="text-gray-600">Nomor Memo:</p>
                <p className="font-medium font-mono">{mockMemo.no_ref}</p>
              </div>
              <div>
                <p className="text-gray-600">Priority:</p>
                <p className="font-medium capitalize">{mockMemo.priority}</p>
              </div>
              <div>
                <p className="text-gray-600">Dibuat oleh:</p>
                <p className="font-medium">{mockMemo.created_by}</p>
              </div>
              <div>
                <p className="text-gray-600">Di-review oleh:</p>
                <p className="font-medium">{mockMemo.reviewed_by}</p>
              </div>
              <div>
                <p className="text-gray-600">Disetujui oleh:</p>
                <p className="font-medium">{mockMemo.approved_by}</p>
              </div>
              <div>
                <p className="text-gray-600">Tanggal Publish:</p>
                <p className="font-medium">
                  {new Date(mockMemo.published_at).toLocaleDateString("id-ID", {
                    day: "2-digit",
                    month: "long",
                    year: "numeric"
                  })}
                </p>
              </div>
              <div>
                <p className="text-gray-600">Jumlah Penerima:</p>
                <p className="font-medium">{mockMemo.recipients.length} grup</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Template Info */}
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-6">
            <h3 className="font-semibold mb-4">💡 Template Information - Internal Memo</h3>
            <div className="space-y-2 text-sm">
              <p><strong>Header:</strong> Company letterhead dengan logo dan kontak</p>
              <p><strong>Memo Header:</strong> "INTERNAL MEMO" dengan priority badge</p>
              <p><strong>Memo Info:</strong> Nomor, Tanggal, Dari, Kepada (multi-recipient), Perihal</p>
              <p><strong>Body:</strong> Konten memo dengan formatting</p>
              <p><strong>Signature:</strong> Dual signature (Reviewer & Approver) dengan tanggal</p>
              <p><strong>Footer:</strong> Copyright dan nomor halaman</p>
              <p className="mt-4 text-blue-800">
                ⚠️ <strong>Note:</strong> Template ini hardcoded untuk MVP. Format berbeda dari Surat Keluar karena memo bersifat internal.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
