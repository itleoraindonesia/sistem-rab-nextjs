"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, CheckCircle, XCircle, FileDown, BarChart3 } from "lucide-react"
import { Card, CardContent } from "../../../../../components/ui"
import Button from "../../../../../components/ui/Button"
import { Label } from "../../../../../components/ui/label"
import { Alert, AlertDescription, AlertTitle } from "../../../../../components/ui/alert"

// Mock document data - in real app, this would come from URL params and database
const mockDocument = {
  id: "1",
  type: "Surat Keluar",
  title: "Surat Penawaran Proyek Perumahan Griya Asri",
  recipient: "PT Maju Jaya Konstruksi",
  content: `Kepada Yth,
Direktur PT Maju Jaya Konstruksi
Di tempat

Dengan hormat,

Bersama surat ini, kami dari PT Leora Indonesia bermaksud mengajukan penawaran kerjasama untuk Proyek Pembangunan Perumahan Griya Asri yang berlokasi di Tangerang Selatan.

Kami telah melakukan survey lokasi dan menyiapkan proposal lengkap yang mencakup:
1. Rencana Anggaran Biaya (RAB) detail
2. Timeline pengerjaan proyek
3. Spesifikasi material yang akan digunakan
4. Portfolio proyek sejenis yang telah kami kerjakan

Kami berharap dapat bekerjasama dengan PT Maju Jaya Konstruksi dalam proyek ini.

Demikian surat penawaran ini kami sampaikan. Atas perhatian dan kerjasamanya, kami ucapkan terima kasih.

Hormat kami,
PT Leora Indonesia`,
  attachment: {
    name: "proposal-griya-asri.pdf",
    size: "2.3 MB",
  },
  submitter: "John Doe",
  submitted_at: "2026-01-10T10:00:00Z",
  priority: "normal",
  status: "under_review",
}

export default function ReviewDetailPage() {
  const router = useRouter()
  const [notes, setNotes] = React.useState("")
  const [showConfirm, setShowConfirm] = React.useState<"approve" | "reject" | null>(null)

  const handleApprove = () => {
    if (window.confirm("Yakin ingin APPROVE dokumen ini?\n\nDokumen akan diteruskan ke Approver untuk approval final.")) {
      alert("✅ Dokumen berhasil di-approve!\n\nDokumen akan diteruskan ke tahap Approval.")
      router.push("/dokumen/review")
    }
  }

  const handleReject = () => {
    if (!notes.trim()) {
      alert("⚠️ Mohon isi catatan revisi terlebih dahulu!")
      return
    }
    if (window.confirm("Yakin ingin REQUEST REVISION untuk dokumen ini?\n\nDokumen akan dikembalikan ke pembuat untuk diperbaiki.")) {
      alert("📝 Request Revision berhasil!\n\nDokumen dikembalikan ke pembuat dengan catatan:\n" + notes)
      router.push("/dokumen/review")
    }
  }

  return (
    <div className="container mx-auto max-w-4xl">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-brand-primary">Review Dokumen</h1>
            <p className="text-gray-600">Periksa dan berikan review untuk dokumen ini</p>
          </div>
        </div>

        {/* Document Info Card */}
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded text-sm font-semibold">
                  {mockDocument.type}
                </span>
                <span className="px-3 py-1 bg-orange-100 text-orange-800 rounded text-sm font-semibold">
                  🟡 Menunggu Review Anda
                </span>
              </div>

              <div>
                <h2 className="text-xl font-bold mb-2">{mockDocument.title}</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-gray-600">Penerima:</span>
                    <p className="font-medium">{mockDocument.recipient}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Diajukan oleh:</span>
                    <p className="font-medium">{mockDocument.submitter}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Tanggal Pengajuan:</span>
                    <p className="font-medium">
                      {new Date(mockDocument.submitted_at).toLocaleDateString("id-ID", {
                        day: "2-digit",
                        month: "long",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-600">Priority:</span>
                    <p className="font-medium capitalize">{mockDocument.priority}</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Document Content */}
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-4">Isi Surat</h3>
            <div className="bg-gray-50 p-6 rounded-md border border-gray-200">
              <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed">
                {mockDocument.content}
              </pre>
            </div>
          </CardContent>
        </Card>

        {/* Attachment */}
        {mockDocument.attachment && (
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4">Lampiran</h3>
              <div className="flex items-center justify-between p-4 bg-blue-50 rounded-md border border-blue-200">
                <div className="flex items-center gap-3">
                  <FileDown className="h-8 w-8 text-blue-600" />
                  <div>
                    <p className="font-medium">{mockDocument.attachment.name}</p>
                    <p className="text-sm text-gray-600">{mockDocument.attachment.size}</p>
                  </div>
                </div>
                <Button variant="outline">Lihat File</Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Review Action Panel */}
        <Card className="border-2 border-orange-200">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-4">🔍 Berikan Review Anda</h3>
            
            <Alert className="mb-4">
              <AlertTitle>Instruksi Review</AlertTitle>
              <AlertDescription>
                <ul className="list-disc list-inside space-y-1 text-sm mt-2">
                  <li>Periksa kelengkapan dan kebenaran isi dokumen</li>
                  <li>Jika ada yang perlu diperbaiki, pilih "Request Revision" dan isi catatan</li>
                  <li>Jika sudah sesuai, pilih "Approve" untuk lanjut ke tahap Approval</li>
                </ul>
              </AlertDescription>
            </Alert>

            <div className="space-y-4">
              <div>
                <Label htmlFor="notes" className="text-base font-semibold">
                  Catatan Review (Opsional untuk Approve, Wajib untuk Revision)
                </Label>
                <textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={5}
                  className="w-full border rounded-md p-3 mt-2 text-base"
                  placeholder="Tulis catatan atau feedback Anda di sini..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                <Button
                  size="lg"
                  variant="outline"
                  className="h-16 text-base border-2 border-red-300 hover:bg-red-50"
                  onClick={handleReject}
                >
                  <XCircle className="mr-2 h-6 w-6" />
                  Request Revision
                </Button>
                <Button
                  size="lg"
                  className="h-16 text-base bg-green-600 hover:bg-green-700"
                  onClick={handleApprove}
                >
                  <CheckCircle className="mr-2 h-6 w-6" />
                  Approve untuk Lanjut
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
                <div className="h-8 w-8 rounded-full bg-orange-500 flex items-center justify-center text-white font-bold">
                  ⏳
                </div>
                <div>
                  <p className="font-medium">Under Review</p>
                  <p className="text-sm text-gray-600">Waiting for your action</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center text-white font-bold">
                  •
                </div>
                <div>
                  <p className="font-medium text-gray-400">Approval</p>
                  <p className="text-sm text-gray-400">Next step after review</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center text-white font-bold">
                  •
                </div>
                <div>
                  <p className="font-medium text-gray-400">Published</p>
                  <p className="text-sm text-gray-400">Final step</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
