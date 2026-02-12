"use client"

import * as React from "react"
import { useRouter, useParams } from "next/navigation"
import { ArrowLeft, CheckCircle, XCircle, BarChart3, MessageSquare, AlertCircle } from "lucide-react"
import { Card, CardContent } from "../../../../../components/ui"
import Button from "../../../../../components/ui/Button"
import { Label } from "../../../../../components/ui/label"
import { Alert, AlertDescription, AlertTitle } from "../../../../../components/ui/alert"
import { useLetterWorkflow, useReviewLetter } from "../../../../../hooks/useLetters"
import { useUser } from "../../../../../hooks/useUser"
import { useToast } from "@/components/ui/use-toast"

export default function ReviewDetailPage() {
  const router = useRouter()
  const params = useParams()
  const id = params?.id as string
  const user = useUser()
  
  // Hooks
  const { letter, histories, canReview } = useLetterWorkflow(id, user?.id)
  const reviewLetter = useReviewLetter()
  const { toast } = useToast()
  
  const [notes, setNotes] = React.useState("")
  const [loading, setLoading] = React.useState(false)

  const handleApprove = async () => {
    if (!window.confirm("Yakin ingin APPROVE dokumen ini?\n\nDokumen akan diteruskan ke Approver untuk approval final.")) {
      return
    }

    setLoading(true)
    try {
      await reviewLetter.mutateAsync({
        letterId: id,
        action: 'APPROVE',
        notes: notes || undefined
      })
      toast({
        title: "Disetujui",
        description: "Dokumen berhasil di-approve"
      })
      router.push("/documents/review")
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Gagal melakukan approve: " + error.message
      })
    } finally {
      setLoading(false)
    }
  }

  const handleReject = async () => {
    if (!notes.trim()) {
      toast({
        variant: "destructive",
        title: "Catatan Diperlukan",
        description: "Mohon isi catatan untuk permintaan revisi"
      })
      return
    }

    if (!window.confirm("Yakin ingin REQUEST REVISION untuk dokumen ini?\n\nDokumen akan dikembalikan ke pembuat untuk diperbaiki.")) {
      return
    }

    setLoading(true)
    try {
      await reviewLetter.mutateAsync({
        letterId: id,
        action: 'REQUEST_REVISION',
        notes: notes
      })
      toast({
        title: "Revisi Diminta",
        description: "Request Revision berhasil"
      })
      router.push("/documents/review")
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Gagal mengirim request revisi: " + error.message
      })
    } finally {
      setLoading(false)
    }
  }

  if (!letter) {
    return <div className="p-8 text-center">Memuat data...</div>
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
            <h1 className="text-2xl font-bold text-brand-primary">Review Dokumen</h1>
            <p className="text-gray-600">Periksa dan berikan review untuk dokumen ini</p>
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
                canReview 
                  ? "bg-orange-100 text-orange-800"
                  : "bg-gray-100 text-gray-800"
              }`}>
                {canReview ? "🟡 Menunggu Review Anda" : `Status: ${letter.status}`}
              </span>
              <div className="ml-auto text-sm text-gray-600">
                Diajukan oleh: <strong>{letter.created_by?.nama}</strong> pada{" "}
                {new Date(letter.created_at).toLocaleDateString("id-ID", {
                  day: "2-digit",
                  month: "long",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </div>
            </div>
          </CardContent>
        </Card>

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

        {/* Review Action Panel */}
        {canReview ? (
          <Card className="border-2 border-orange-200">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4">🔍 Berikan Review Anda</h3>
              
              <Alert className="mb-4">
                <AlertTitle>Instruksi Review</AlertTitle>
                <AlertDescription>
                  <ul className="list-disc list-inside space-y-1 text-sm mt-2">
                    <li>Periksa kelengkapan dan kebenaran isi dokumen</li>
                    <li>Pastikan data pengirim, penerima, dan lampiran sudah sesuai</li>
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
                    disabled={loading}
                  >
                    <XCircle className="mr-2 h-6 w-6" />
                    {loading ? "Memproses..." : "Request Revision"}
                  </Button>
                  <Button
                    size="lg"
                    className="h-16 text-base bg-green-600 hover:bg-green-700"
                    onClick={handleApprove}
                    disabled={loading}
                  >
                    <CheckCircle className="mr-2 h-6 w-6" />
                    {loading ? "Memproses..." : "Approve untuk Lanjut"}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="bg-gray-50">
             <CardContent className="p-6 text-center text-gray-500">
                <p>Anda tidak memiliki akses review untuk dokumen ini atau sudah melakukan review.</p>
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
                 <div className={`h-8 w-8 rounded-full flex items-center justify-center text-white font-bold ${letter.status !== 'DRAFT' ? 'bg-green-500' : 'bg-gray-300'}`}>{letter.status !== 'DRAFT' ? '✓' : '•'}</div>
                 <div>
                    <p className="font-medium">Submitted for Review</p>
                 </div>
              </div>
              {/* Reviewers */}
              {histories?.filter((t: any) => t.stage_type === 'REVIEW').map((t: any, i: number) => (
                 <div key={i} className="flex items-center gap-3">
                    <div className={`h-8 w-8 rounded-full flex items-center justify-center text-white font-bold ${t.status === 'APPROVED' ? 'bg-green-500' : 'bg-orange-500'}`}>
                       {t.status === 'APPROVED' ? '✓' : '⏳'}
                    </div>
                    <div>
                       <p className="font-medium">Review by {t.assigned_to?.nama}</p>
                       <p className="text-sm text-gray-600">{t.status === 'APPROVED' ? 'Approved' : 'Pending Review'}</p>
                       {t.notes && <p className="text-xs italic text-gray-500">"{t.notes}"</p>}
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
