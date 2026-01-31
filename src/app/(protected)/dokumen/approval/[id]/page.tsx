"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, CheckCircle, XCircle, MessageSquare, BarChart3 } from "lucide-react"
import { Card, CardContent } from "../../../../../components/ui"
import Button from "../../../../../components/ui/Button"
import { Label } from "../../../../../components/ui/label"
import { Alert, AlertDescription, AlertTitle } from "../../../../../components/ui/alert"
import { SuratDetailView } from "../../../../../components/SuratDetailView"

// Mock document data - in real app, this would come from URL params and database
const mockDocument = {
  id: "1",
  type: "Surat Keluar",
  
  // Section 1: Identitas Surat
  no_ref: null, // akan di-generate setelah approved
  instansi: "PT Leora Konstruksi Indonesia",
  kategori_surat: "Surat Penawaran",
  tanggal: "2026-01-10T10:00:00Z",
  
  // Section 2: Konten Surat
  perihal: "Penawaran Proyek Perumahan Griya Asri",
  isi_surat: {
    pembuka: "Kepada Yth,\nDirektur PT Maju Jaya Konstruksi\nDi tempat\n\nDengan hormat,",
    isi: `<p>Bersama surat ini, kami dari PT Leora Indonesia bermaksud mengajukan penawaran kerjasama untuk Proyek Pembangunan Perumahan Griya Asri yang berlokasi di Tangerang Selatan.</p>
<p>Kami telah melakukan survey lokasi dan menyiapkan proposal lengkap yang mencakup:</p>
<ol>
<li>Rencana Anggaran Biaya (RAB) detail</li>
<li>Timeline pengerjaan proyek</li>
<li>Spesifikasi material yang akan digunakan</li>
<li>Portfolio proyek sejenis yang telah kami kerjakan</li>
</ol>
<p>Kami berharap dapat bekerjasama dengan PT Maju Jaya Konstruksi dalam proyek ini.</p>`,
    penutup: "Demikian surat penawaran ini kami sampaikan. Atas perhatian dan kerjasamanya, kami ucapkan terima kasih.\n\nHormat kami,\nPT Leora Indonesia"
  },
  
  // Section 3: Pengirim
  pengirim: {
    dept: "Sales & Marketing",
    name: "John Doe",
    email: "john.doe@leora.co.id",
  },
  
  // Section 4: Penerima
  penerima: {
    nama_instansi: "PT Maju Jaya Konstruksi",
    nama_penerima: "Budi Santoso",
    alamat: "Jl. Sudirman No. 123, Jakarta Pusat",
    whatsapp: "+62812345678",
    email: "budi@majujaya.co.id",
  },
  
  // Section 5: Lampiran & Tanda Tangan
  has_lampiran: true,
  lampiran_files: ["proposal-griya-asri.pdf", "rab-detail.xlsx"],
  signatures: [
    { name: "John Doe", position: "Sales Manager", order: 1 },
    { name: "Jane Smith", position: "Director", order: 2 },
  ],
  
  // Workflow info
  submitter: "John Doe",
  submitted_at: "2026-01-10T10:00:00Z",
  reviewed_by: "Manager Review",
  reviewed_at: "2026-01-11T09:00:00Z",
  review_notes: "Dokumen sudah sesuai dengan format baru (5 section). Semua field terisi lengkap. Siap untuk approval final.",
  priority: "normal",
  status: "reviewed",
}

export default function ApprovalDetailPage() {
  const router = useRouter()
  const [notes, setNotes] = React.useState("")

  const handleApprove = () => {
    if (window.confirm("Yakin ingin APPROVE dokumen ini?\n\nDokumen akan dipublikasikan dan nomor surat akan di-generate.")) {
      alert("✅ Dokumen berhasil di-approve!\n\nNomor surat: 001/SK/LEORA/I/2026\nStatus: Published")
      router.push("/dokumen/approval")
    }
  }

  const handleReject = () => {
    if (!notes.trim()) {
      alert("⚠️ Mohon isi alasan penolakan terlebih dahulu!")
      return
    }
    if (window.confirm("Yakin ingin REJECT dokumen ini?\n\nDokumen akan dikembalikan ke pembuat untuk diperbaiki.")) {
      alert("❌ Dokumen ditolak!\n\nDokumen dikembalikan ke pembuat dengan alasan:\n" + notes)
      router.push("/dokumen/approval")
    }
  }

  return (
    <div className="container mx-auto max-w-5xl">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-brand-primary">Final Approval</h1>
            <p className="text-gray-600">Berikan persetujuan final untuk dokumen ini</p>
          </div>
        </div>

        {/* Status Badge */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded text-sm font-semibold">
                {mockDocument.type}
              </span>
              <span className="px-3 py-1 bg-green-100 text-green-800 rounded text-sm font-semibold">
                ✓ Sudah Di-review
              </span>
              <div className="ml-auto text-sm text-gray-600">
                Diajukan oleh: <strong>{mockDocument.submitter}</strong> pada{" "}
                {new Date(mockDocument.submitted_at).toLocaleDateString("id-ID", {
                  day: "2-digit",
                  month: "long",
                  year: "numeric",
                })}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Review Notes */}
        <Card className="bg-green-50 border-green-200">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-3 text-green-900 flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Catatan dari Reviewer
            </h3>
            <div className="bg-white p-4 rounded-md border border-green-200">
              <p className="text-sm italic text-gray-700">"{mockDocument.review_notes}"</p>
              <p className="text-xs text-gray-500 mt-2">
                - {mockDocument.reviewed_by}, {new Date(mockDocument.reviewed_at).toLocaleDateString("id-ID")}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Document Detail - Using Reusable Component */}
        <SuratDetailView data={mockDocument} showSectionNumbers={true} />

        {/* Approval Action Panel */}
        <Card className="border-2 border-blue-200">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-4">✅ Berikan Approval Final</h3>
            
            <Alert className="mb-4 bg-blue-50 border-blue-200">
              <AlertTitle className="text-blue-900">Instruksi Approval</AlertTitle>
              <AlertDescription className="text-blue-800">
                <ul className="list-disc list-inside space-y-1 text-sm mt-2">
                  <li>Dokumen sudah melalui tahap review dan dinyatakan sesuai</li>
                  <li>Periksa kembali kelengkapan 5 section (Identitas, Konten, Pengirim, Penerima, Lampiran & TTD)</li>
                  <li>Jika Anda setuju, klik "Approve" untuk mempublikasikan dokumen</li>
                  <li>Jika ada yang tidak sesuai, klik "Reject" dan berikan alasan penolakan</li>
                  <li><strong>Setelah di-approve, nomor surat akan otomatis di-generate</strong></li>
                </ul>
              </AlertDescription>
            </Alert>

            <div className="space-y-4">
              <div>
                <Label htmlFor="notes" className="text-base font-semibold">
                  Catatan Approval (Opsional untuk Approve, Wajib untuk Reject)
                </Label>
                <textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={4}
                  className="w-full border rounded-md p-3 mt-2 text-base"
                  placeholder="Tulis catatan atau alasan penolakan di sini..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                <Button
                  size="lg"
                  variant="outline"
                  className="h-16 text-base border-2 border-red-300 hover:bg-red-50 text-red-700"
                  onClick={handleReject}
                >
                  <XCircle className="mr-2 h-6 w-6" />
                  Reject (Tolak)
                </Button>
                <Button
                  size="lg"
                  className="h-16 text-base bg-green-600 hover:bg-green-700"
                  onClick={handleApprove}
                >
                  <CheckCircle className="mr-2 h-6 w-6" />
                  Approve (Setujui)
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Workflow Info */}
        <Card>
          <CardContent className="p-6">
            <h3 className="font-semibold mb-4 flex items-center gap-2"><BarChart3 className="h-5 w-5" /> Workflow Progress</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-green-500 flex items-center justify-center text-white font-bold">
                  ✓
                </div>
                <div>
                  <p className="font-medium">Draft Created</p>
                  <p className="text-sm text-gray-600">By {mockDocument.submitter}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-green-500 flex items-center justify-center text-white font-bold">
                  ✓
                </div>
                <div>
                  <p className="font-medium">Submitted for Review</p>
                  <p className="text-sm text-gray-600">{new Date(mockDocument.submitted_at).toLocaleDateString("id-ID")}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-green-500 flex items-center justify-center text-white font-bold">
                  ✓
                </div>
                <div>
                  <p className="font-medium">Reviewed & Approved by Reviewer</p>
                  <p className="text-sm text-gray-600">By {mockDocument.reviewed_by} - {new Date(mockDocument.reviewed_at).toLocaleDateString("id-ID")}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-orange-500 flex items-center justify-center text-white font-bold">
                  ⏳
                </div>
                <div>
                  <p className="font-medium">Final Approval</p>
                  <p className="text-sm text-gray-600">Waiting for your decision</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center text-white font-bold">
                  •
                </div>
                <div>
                  <p className="font-medium text-gray-400">Published</p>
                  <p className="text-sm text-gray-400">After approval (nomor surat di-generate)</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
