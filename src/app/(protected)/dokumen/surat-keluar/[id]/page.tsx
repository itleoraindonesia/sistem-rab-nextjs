"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Download, Printer, FileDown, MessageSquare, Hash, Send, BarChart3 } from "lucide-react"
import { Card, CardContent } from "../../../../../components/ui"
import Button from "../../../../../components/ui/Button"

// Mock document data - in real app, this would come from URL params and database
const mockDocument = {
  id: "1",
  no_ref: "001/SK/LEORA/I/2026",
  type: "Surat Keluar",
  title: "Surat Penawaran Proyek Perumahan Griya Asri",
  recipient: {
    name: "PT Maju Jaya Konstruksi",
    address: "Jl. Raya Serpong No. 123, Tangerang Selatan",
    attention: "Direktur Utama",
  },
  content: `Dengan hormat,

Bersama surat ini, kami dari PT Leora Indonesia bermaksud mengajukan penawaran kerjasama untuk Proyek Pembangunan Perumahan Griya Asri yang berlokasi di Tangerang Selatan.

Kami telah melakukan survey lokasi dan menyiapkan proposal lengkap yang mencakup:

1. Rencana Anggaran Biaya (RAB) detail untuk seluruh pekerjaan
2. Timeline pengerjaan proyek selama 12 bulan
3. Spesifikasi material berkualitas tinggi yang akan digunakan
4. Portfolio proyek sejenis yang telah kami kerjakan dengan sukses
5. Sertifikasi dan legalitas perusahaan

Beberapa keunggulan kami:
• Pengalaman lebih dari 10 tahun di bidang konstruksi perumahan
• Tim profesional dan bersertifikat
• Penggunaan material berkualitas dengan harga kompetitif
• Garansi pekerjaan dan after-sales service

Kami sangat berharap dapat bekerjasama dengan PT Maju Jaya Konstruksi dalam proyek ini. Untuk pembahasan lebih lanjut, kami siap mengadakan pertemuan di waktu yang Bapak/Ibu tentukan.

Demikian surat penawaran ini kami sampaikan. Atas perhatian dan kerjasamanya, kami ucapkan terima kasih.`,
  attachment: [
    {
      name: "proposal-griya-asri.pdf",
      size: "2.3 MB",
    },
    {
      name: "rab-detail.xlsx",
      size: "1.8 MB",
    },
    {
      name: "site-plan.jpg",
      size: "3.1 MB",
    },
  ],
  submitter: "John Doe",
  created_at: "2026-01-10T10:00:00Z",
  status: "published",
  approved_by: "Director",
  approved_at: "2026-01-11T14:00:00Z",
}

export default function SuratDetailPage() {
  const router = useRouter()

  return (
    <div className="container mx-auto max-w-5xl">
      <div className="space-y-6">
        {/* Header Actions */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => router.back()}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-brand-primary">Preview Surat</h1>
              <p className="text-gray-600">{mockDocument.no_ref}</p>
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

        {/* Letter Preview - A4 Format */}
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
                    <p>www.leora.co.id</p>
                  </div>
                </div>
              </div>

              {/* LETTER CONTENT */}
              <div className="p-8 space-y-6">
                {/* Reference Number & Date */}
                <div className="flex justify-between text-sm">
                  <div>
                    <p>Nomor: <strong>{mockDocument.no_ref}</strong></p>
                    <p>Lampiran: {mockDocument.attachment.length} file</p>
                    <p>Perihal: <strong>{mockDocument.title}</strong></p>
                  </div>
                  <div className="text-right">
                    <p>Jakarta, {new Date(mockDocument.created_at).toLocaleDateString("id-ID", {
                      day: "2-digit",
                      month: "long",
                      year: "numeric"
                    })}</p>
                  </div>
                </div>

                {/* Recipient */}
                <div className="text-sm">
                  <p>Kepada Yth,</p>
                  <p className="font-semibold">{mockDocument.recipient.attention}</p>
                  <p className="font-semibold">{mockDocument.recipient.name}</p>
                  <p>{mockDocument.recipient.address}</p>
                </div>

                {/* Body */}
                <div className="text-sm leading-relaxed whitespace-pre-line">
                  {mockDocument.content}
                </div>

                {/* Signature */}
                <div className="flex justify-end mt-12">
                  <div className="text-center">
                    <p className="text-sm mb-16">Hormat kami,</p>
                    <div className="border-t-2 border-gray-800 pt-2 min-w-[200px]">
                      <p className="font-semibold">{mockDocument.approved_by}</p>
                      <p className="text-sm text-gray-600">Direktur Utama</p>
                      <p className="text-sm text-gray-600">PT Leora Indonesia</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* FOOTER */}
              <div className="border-t-2 border-brand-primary p-4 mt-8">
                <div className="flex justify-between items-center text-xs text-gray-600">
                  <p>© 2026 PT Leora Indonesia - All Rights Reserved</p>
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
                              Dokumen dibuat oleh <strong>{mockDocument.submitter}</strong>
                            </p>
                          </div>
                          <span className="text-xs text-green-600 font-medium">
                            {new Date(mockDocument.created_at).toLocaleDateString("id-ID", {
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
                              Dokumen disubmit untuk review
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

                  {/* 3. Under Review */}
                  <div className="relative flex gap-4">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-white font-bold z-10">
                      ✓
                    </div>
                    <div className="flex-1 pb-4">
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-semibold text-green-900">Under Review</p>
                            <p className="text-sm text-green-700 mt-1">
                              Direview oleh <strong>Manager Review</strong>
                            </p>
                            <p className="text-xs text-green-600 mt-2 italic flex items-center gap-1">
                              <MessageSquare className="h-3 w-3" />
                              Catatan: "Dokumen sudah sesuai, siap untuk approval"
                            </p>
                          </div>
                          <span className="text-xs text-green-600 font-medium">
                            {new Date("2026-01-11T09:00:00Z").toLocaleDateString("id-ID", {
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
                              Disetujui oleh <strong>{mockDocument.approved_by}</strong>
                            </p>
                            <p className="text-xs text-green-600 mt-2 flex items-center gap-1">
                              <Hash className="h-3 w-3" />
                              Nomor surat di-generate: <strong className="font-mono">{mockDocument.no_ref}</strong>
                            </p>
                          </div>
                          <span className="text-xs text-green-600 font-medium">
                            {new Date(mockDocument.approved_at).toLocaleDateString("id-ID", {
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
                              Dokumen telah dipublikasikan dan siap dikirim
                            </p>
                            <p className="text-xs text-blue-600 mt-2 flex items-center gap-1">
                              <Send className="h-3 w-3" />
                              Status: <strong>Ready to Send</strong>
                            </p>
                          </div>
                          <span className="text-xs text-blue-600 font-medium">
                            {new Date(mockDocument.approved_at).toLocaleDateString("id-ID", {
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
                    {Math.floor((new Date(mockDocument.approved_at).getTime() - new Date(mockDocument.created_at).getTime()) / (1000 * 60 * 60))}h
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
                <p className="text-gray-600">Nomor Surat:</p>
                <p className="font-medium font-mono">{mockDocument.no_ref}</p>
              </div>
              <div>
                <p className="text-gray-600">Dibuat oleh:</p>
                <p className="font-medium">{mockDocument.submitter}</p>
              </div>
              <div>
                <p className="text-gray-600">Tanggal Dibuat:</p>
                <p className="font-medium">
                  {new Date(mockDocument.created_at).toLocaleDateString("id-ID", {
                    day: "2-digit",
                    month: "long",
                    year: "numeric"
                  })}
                </p>
              </div>
              <div>
                <p className="text-gray-600">Disetujui oleh:</p>
                <p className="font-medium">{mockDocument.approved_by}</p>
              </div>
              <div>
                <p className="text-gray-600">Tanggal Approval:</p>
                <p className="font-medium">
                  {new Date(mockDocument.approved_at).toLocaleDateString("id-ID", {
                    day: "2-digit",
                    month: "long",
                    year: "numeric"
                  })}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Attachments */}
        {mockDocument.attachment && mockDocument.attachment.length > 0 && (
          <Card>
            <CardContent className="p-6">
              <h3 className="font-semibold mb-4">📎 Lampiran ({mockDocument.attachment.length} file)</h3>
              <div className="space-y-3">
                {mockDocument.attachment.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 bg-blue-50 rounded-md border border-blue-200"
                  >
                    <div className="flex items-center gap-3">
                      <FileDown className="h-8 w-8 text-blue-600" />
                      <div>
                        <p className="font-medium">{file.name}</p>
                        <p className="text-sm text-gray-600">{file.size}</p>
                      </div>
                    </div>
                    <Button variant="outline">Lihat File</Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Template Info */}
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-6">
            <h3 className="font-semibold mb-4">💡 Template Information</h3>
            <div className="space-y-2 text-sm">
              <p><strong>Header Template:</strong> Company letterhead dengan logo, nama perusahaan, dan kontak</p>
              <p><strong>Body Format:</strong> Nomor surat, tanggal, penerima, isi surat, tanda tangan</p>
              <p><strong>Footer Template:</strong> Copyright dan nomor halaman</p>
              <p><strong>Font:</strong> Professional sans-serif untuk readability</p>
              <p><strong>Paper Size:</strong> A4 (210mm x 297mm)</p>
              <p className="mt-4 text-blue-800">
                ⚠️ <strong>Note:</strong> Template ini hardcoded untuk MVP. Nanti bisa dikustomisasi per jenis dokumen.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
