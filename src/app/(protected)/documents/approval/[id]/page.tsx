"use client"

import * as React from "react"
import { useRouter, useParams } from "next/navigation"
import { ArrowLeft, CheckCircle, XCircle, BarChart3, MessageSquare, AlertCircle } from "lucide-react"
import { Card, CardContent } from "../../../../../components/ui"
import Button from "../../../../../components/ui/Button"
import { Label } from "../../../../../components/ui/label"
import { Alert, AlertDescription, AlertTitle } from "../../../../../components/ui/alert"
import { useLetterWorkflow, useApproveLetter, useRejectLetter } from "../../../../../hooks/useLetters"
import { useUser } from "../../../../../hooks/useUser"

export default function ApprovalDetailPage() {
  const router = useRouter()
  const params = useParams()
  const id = params?.id as string
  const user = useUser()
  
  // Hooks
  const { letter, trackings, canApprove } = useLetterWorkflow(id, user?.id)
  const approveLetter = useApproveLetter()
  const rejectLetter = useRejectLetter()
  
  const [notes, setNotes] = React.useState("")
  const [loading, setLoading] = React.useState(false)

  const handleApprove = async () => {
    if (!window.confirm("Yakin ingin APPROVE dokumen ini?\n\nDokumen akan dipublikasikan dan nomor surat akan di-generate.")) {
      return
    }

    setLoading(true)
    try {
      await approveLetter.mutateAsync(id)
      alert("✅ Dokumen berhasil di-approve & Published!")
      router.push("/documents/approval")
    } catch (error: any) {
      alert("Gagal melakukan approve: " + error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleReject = async () => {
    if (!notes.trim()) {
      alert("⚠️ Mohon isi alasan penolakan terlebih dahulu!")
      return
    }

    if (!window.confirm("Yakin ingin REJECT dokumen ini?\n\nDokumen akan ditolak secara permanen.")) {
      return
    }

    setLoading(true)
    try {
      await rejectLetter.mutateAsync({
        letterId: id,
        notes: notes
      })
      alert("❌ Dokumen ditolak!")
      router.push("/documents/approval")
    } catch (error: any) {
      alert("Gagal menolak dokumen: " + error.message)
    } finally {
      setLoading(false)
    }
  }

  if (!letter) {
    return <div className="p-8 text-center">Memuat data...</div>
  }

  // Get reviewer notes
  const reviewerTrackings = trackings?.filter((t: any) => t.stage_type === 'REVIEW' && t.status === 'APPROVED');

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
                {letter.document_type?.name}
              </span>
              <span className={`px-3 py-1 rounded text-sm font-semibold ${
                canApprove 
                  ? "bg-green-100 text-green-800"
                  : "bg-gray-100 text-gray-800"
              }`}>
                {canApprove ? "✓ Menunggu Approval Anda" : `Status: ${letter.status}`}
              </span>
              <div className="ml-auto text-sm text-gray-600">
                Diajukan oleh: <strong>{letter.created_by?.nama}</strong> pada{" "}
                {new Date(letter.created_at).toLocaleDateString("id-ID", {
                  day: "2-digit",
                  month: "long",
                  year: "numeric",
                })}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Review Notes */}
        {reviewerTrackings && reviewerTrackings.length > 0 && (
          <Card className="bg-green-50 border-green-200">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-3 text-green-900 flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Catatan dari Reviewer
              </h3>
              <div className="space-y-2">
                 {reviewerTrackings.map((t: any, idx: number) => (
                    <div key={idx} className="bg-white p-4 rounded-md border border-green-200">
                      <p className="text-sm italic text-gray-700">"{t.notes || "Disetujui tanpa catatan"}"</p>
                      <p className="text-xs text-gray-500 mt-2">
                        - {t.assigned_to?.nama}, {t.action_at ? new Date(t.action_at).toLocaleDateString("id-ID") : "-"}
                      </p>
                    </div>
                 ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Document Detail View (Manual Mapping) */}
        <Card className="shadow-lg">
          <CardContent className="p-0">
            <div className="bg-white" style={{ aspectRatio: "210/297" }}>
              {/* Header */}
              <div className="border-b-4 border-brand-primary p-8">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                     <div className="w-16 h-16 bg-brand-primary rounded-lg flex items-center justify-center text-white font-bold text-2xl">L</div>
                     <div>
                        <h2 className="text-2xl font-bold text-brand-primary">PT LEORA INDONESIA</h2>
                        <p className="text-sm text-gray-600 mt-1">Solar Panel & Renewable Energy Solutions</p>
                     </div>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-8 space-y-6">
                 <div className="flex justify-between text-sm">
                    <div>
                      <p>Nomor: <strong>{letter.document_number || "Draft (Belum digenerate)"}</strong></p>
                      <p>Perihal: <strong>{letter.subject}</strong></p>
                    </div>
                    <div className="text-right">
                       <p>Jakarta, {new Date(letter.letter_date).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}</p>
                    </div>
                 </div>

                 <div className="text-sm">
                    <p>Kepada Yth,</p>
                    <p className="font-semibold">{letter.recipient_name}</p>
                    <p className="font-semibold">{letter.recipient_company}</p>
                    <p>{letter.recipient_address}</p>
                 </div>

                 <div className="text-sm leading-relaxed whitespace-pre-line">
                    <p>{letter.opening}</p>
                    <div dangerouslySetInnerHTML={{ __html: letter.body }} className="my-4" />
                    <p>{letter.closing}</p>
                 </div>
                 
                 {letter.attachments && letter.attachments.length > 0 && (
                   <div className="text-sm mt-4 p-4 bg-gray-50 rounded">
                     <p className="font-semibold mb-2">Lampiran:</p>
                     <ul className="list-disc list-inside">
                       {letter.attachments.map((file: any, idx: number) => (
                         <li key={idx}>{file.name} ({file.size})</li>
                       ))}
                     </ul>
                   </div>
                 )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Approval Action Panel */}
        {canApprove ? (
          <Card className="border-2 border-blue-200">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4">✅ Berikan Approval Final</h3>
              
              <Alert className="mb-4 bg-blue-50 border-blue-200">
                <AlertTitle className="text-blue-900">Instruksi Approval</AlertTitle>
                <AlertDescription className="text-blue-800">
                  <ul className="list-disc list-inside space-y-1 text-sm mt-2">
                    <li>Dokumen sudah melalui tahap review dan dinyatakan sesuai</li>
                    <li>Jika Anda setuju, klik "Approve" untuk mempublikasikan dokumen</li>
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
                    disabled={loading}
                  >
                    <XCircle className="mr-2 h-6 w-6" />
                    {loading ? "Memproses..." : "Reject (Tolak)"}
                  </Button>
                  <Button
                    size="lg"
                    className="h-16 text-base bg-green-600 hover:bg-green-700"
                    onClick={handleApprove}
                    disabled={loading}
                  >
                    <CheckCircle className="mr-2 h-6 w-6" />
                    {loading ? "Memproses..." : "Approve (Setujui)"}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
           <Card className="bg-gray-50">
             <CardContent className="p-6 text-center text-gray-500">
                <p>Anda tidak memiliki akses approval untuk dokumen ini atau sudah melakukan approval.</p>
             </CardContent>
          </Card>
        )}

        {/* Workflow Info */}
        <Card>
          <CardContent className="p-6">
            <h3 className="font-semibold mb-4 flex items-center gap-2"><BarChart3 className="h-5 w-5" /> Workflow Progress</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-green-500 flex items-center justify-center text-white font-bold">✓</div>
                <div>
                  <p className="font-medium">Draft Created</p>
                  <p className="text-sm text-gray-600">By {letter.created_by?.nama}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                 <div className={`h-8 w-8 rounded-full flex items-center justify-center text-white font-bold bg-green-500`}>✓</div>
                 <div>
                    <p className="font-medium">Submitted for Review</p>
                 </div>
              </div>
              {/* Reviewers */}
              {trackings?.filter((t: any) => t.stage_type === 'REVIEW').map((t: any, i: number) => (
                 <div key={i} className="flex items-center gap-3">
                    <div className={`h-8 w-8 rounded-full flex items-center justify-center text-white font-bold ${t.status === 'APPROVED' ? 'bg-green-500' : 'bg-orange-500'}`}>
                       {t.status === 'APPROVED' ? '✓' : '⏳'}
                    </div>
                    <div>
                       <p className="font-medium">Review by {t.assigned_to?.nama}</p>
                       <p className="text-sm text-gray-600">{t.status === 'APPROVED' ? 'Approved' : 'Pending/Revision'}</p>
                    </div>
                 </div>
              ))}
               {/* Approvers */}
              {trackings?.filter((t: any) => t.stage_type === 'APPROVAL').map((t: any, i: number) => (
                 <div key={i} className="flex items-center gap-3">
                    <div className={`h-8 w-8 rounded-full flex items-center justify-center text-white font-bold ${t.status === 'APPROVED' ? 'bg-green-500' : (t.status === 'REJECTED' ? 'bg-red-500' : 'bg-orange-500')}`}>
                       {t.status === 'APPROVED' ? '✓' : (t.status === 'REJECTED' ? '✕' : '⏳')}
                    </div>
                    <div>
                       <p className="font-medium">Approval by {t.assigned_to?.nama}</p>
                       <p className="text-sm text-gray-600">{t.status === 'APPROVED' ? 'Approved' : (t.status === 'REJECTED' ? 'Rejected' : 'Pending Approval')}</p>
                    </div>
                 </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
