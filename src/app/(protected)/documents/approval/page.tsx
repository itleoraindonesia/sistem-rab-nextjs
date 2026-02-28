"use client"

import * as React from "react"
import { createPortal } from "react-dom"
import { useRouter } from "next/navigation"
import { Eye, FileText, ShieldCheck, AlertCircle } from "lucide-react"
import { Card, CardContent } from "../../../../components/ui"
import Button from "../../../../components/ui/Button"
import { usePendingApprovals, useReviewLetter } from "../../../../hooks/useLetters"
import { useUser } from "../../../../hooks/useUser"
import { useToast } from "@/components/ui/use-toast"

export default function ApprovalQueuePage() {
  const router = useRouter()
  const { data: user } = useUser()
  const { data: pendingApprovals, isLoading } = usePendingApprovals(user?.id)
  const reviewLetter = useReviewLetter()
  const { toast } = useToast()

  const [selectedLetter, setSelectedLetter] = React.useState<any>(null)
  const [notes, setNotes] = React.useState('')
  const [loading, setLoading] = React.useState<string | null>(null)
  const [error, setError] = React.useState<string | null>(null)

  const handleApproval = async (
    letterId: string,
    action: 'APPROVED_FINAL' | 'REQUEST_REVISION' | 'REJECT'
  ) => {
    if ((action === 'REJECT' || action === 'REQUEST_REVISION') && !notes.trim()) {
      toast({
        variant: "destructive",
        title: "Catatan Diperlukan",
        description: action === 'REJECT'
          ? "Mohon isi catatan untuk penolakan"
          : "Mohon isi catatan untuk permintaan revisi",
      })
      setError('Mohon isi catatan')
      return
    }

    setLoading(action)
    setError(null)

    try {
      await reviewLetter.mutateAsync({ letterId, action, notes: notes || undefined })

      const label: Record<string, string> = {
        APPROVED_FINAL: 'Surat telah disetujui final dan nomor surat di-generate',
        REQUEST_REVISION: 'Surat dikembalikan untuk revisi',
        REJECT: 'Surat telah ditolak',
      }
      toast({ title: 'Berhasil', description: label[action] })

      setSelectedLetter(null)
      setNotes('')
      setLoading(null)
      router.refresh()
    } catch (err: any) {
      setError(err.message || 'Gagal melakukan approval')
      setLoading(null)
      toast({
        variant: "destructive",
        title: "Error",
        description: err.message || 'Gagal melakukan approval',
      })
    }
  }

  if (isLoading) {
    return (
      <div className="py-8">
        <div className="text-center">
          <p>Memuat antrian approval...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="py-6">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-brand-primary">Antrian Approval Surat</h1>
          <p className="text-gray-600 mt-1">
            {pendingApprovals?.length || 0} surat menunggu approval Anda
          </p>
        </div>

        {/* Empty State */}
        {!pendingApprovals || pendingApprovals.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <ShieldCheck className="h-16 w-16 mx-auto text-gray-300 mb-4" />
              <h3 className="text-lg font-semibold text-gray-700 mb-2">
                Tidak Ada Surat untuk Diapprove
              </h3>
              <p className="text-gray-500">
                Semua surat sudah diapprove atau belum ada yang masuk ke tahap approval.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {pendingApprovals?.map((tracking: any) => (
              <Card key={tracking.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-green-100 text-green-600 flex items-center justify-center">
                          <ShieldCheck className="h-5 w-5" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">
                            {tracking.letter?.subject}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {tracking.letter?.document_type?.name} • {tracking.letter?.created_by?.nama}
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-gray-500">Penerima</p>
                          <p className="font-medium">{tracking.letter?.recipient_name || '-'}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Tanggal</p>
                          <p className="font-medium">
                            {tracking.letter?.letter_date
                              ? new Date(tracking.letter.letter_date).toLocaleDateString('id-ID', {
                                  day: 'numeric', month: 'long', year: 'numeric'
                                })
                              : '-'}
                          </p>
                        </div>
                      </div>

                      <div>
                        <p className="text-gray-500 text-sm mb-1">Ringkasan Isi</p>
                        <p className="text-sm text-gray-700 line-clamp-2">
                          {tracking.letter?.body?.replace(/<[^>]*>/g, '') || '-'}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => { setSelectedLetter(tracking); setNotes(''); setError(null) }}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        Detail
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Approval Modal */}
        {selectedLetter && typeof document !== 'undefined' && createPortal(
          <div
            className="fixed top-0 left-0 w-screen h-screen z-[99999] bg-black/60 flex items-center justify-center p-4 sm:p-6 backdrop-blur-sm"
            style={{ position: 'fixed', top: 0, left: 0, bottom: 0, right: 0 }}
            onClick={() => setSelectedLetter(null)}
          >
            <Card
              className="w-full max-w-5xl max-h-[95vh] flex flex-col overflow-hidden shadow-2xl bg-white m-0"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Sticky Header */}
              <div className="p-6 border-b border-gray-100 bg-white shrink-0 flex items-start justify-between shadow-sm z-10">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-green-100 text-green-700">
                      ⚡ Approval
                    </span>
                  </div>
                  <h2 className="text-xl font-bold text-gray-900 mb-1">
                    {selectedLetter.letter?.subject}
                  </h2>
                  <p className="text-sm text-gray-600">
                    {selectedLetter.letter?.document_type?.name} • {selectedLetter.letter?.created_by?.nama}
                  </p>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setSelectedLetter(null)} className="shrink-0 -mt-2 -mr-2">
                  ✕
                </Button>
              </div>

              {/* Scrollable Content */}
              <div className="p-6 overflow-y-auto flex-1 bg-gray-50/30">
                <div className="space-y-6">
                  {/* A4 Preview */}
                  <div className="bg-white flex flex-col border border-gray-200 rounded-lg shadow-sm" style={{ aspectRatio: "210/297" }}>
                    <div className="border-b-4 border-brand-primary p-8">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-16 h-16 bg-brand-primary rounded-lg flex items-center justify-center text-white font-bold text-2xl">
                            {(selectedLetter.letter?.company?.nama || 'L').charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <h2 className="text-2xl font-bold text-brand-primary">
                              {selectedLetter.letter?.company?.nama || '-'}
                            </h2>
                          </div>
                        </div>
                        <div className="text-right text-sm text-gray-600">
                          {selectedLetter.letter?.company?.alamat && <p>{selectedLetter.letter.company.alamat}</p>}
                          {selectedLetter.letter?.company?.telepon && <p className="mt-1">Tel: {selectedLetter.letter.company.telepon}</p>}
                          {selectedLetter.letter?.company?.email && <p>Email: {selectedLetter.letter.company.email}</p>}
                        </div>
                      </div>
                    </div>

                    <div className="p-8 space-y-6 flex-1">
                      <div className="flex justify-between text-sm">
                        <div className="grid grid-cols-[80px_10px_1fr] gap-y-1">
                          <div>Nomor</div><div>:</div>
                          <div className="font-bold">{selectedLetter.letter?.document_number || "Pending"}</div>
                          <div>Lampiran</div><div>:</div>
                          <div>{Array.isArray(selectedLetter.letter?.attachments) && selectedLetter.letter.attachments.length > 0 ? `${selectedLetter.letter.attachments.length} file` : "-"}</div>
                          <div>Perihal</div><div>:</div>
                          <div className="font-bold">{selectedLetter.letter?.subject}</div>
                        </div>
                        <div className="text-right">
                          <p>Jakarta, {new Date(selectedLetter.letter?.letter_date || new Date()).toLocaleDateString("id-ID", { day: "2-digit", month: "long", year: "numeric" })}</p>
                        </div>
                      </div>

                      <div className="text-sm">
                        <p>Kepada Yth,</p>
                        <p className="font-semibold">{selectedLetter.letter?.recipient_name}</p>
                        <p className="font-semibold">{selectedLetter.letter?.recipient_company}</p>
                        <p>{selectedLetter.letter?.recipient_address}</p>
                      </div>

                      <div className="text-sm leading-relaxed">
                        {selectedLetter.letter?.opening && <p className="mb-4">{selectedLetter.letter.opening}</p>}
                        {selectedLetter.letter?.body && (
                          <div dangerouslySetInnerHTML={{ __html: selectedLetter.letter.body }} className="my-4" />
                        )}
                        {selectedLetter.letter?.closing && <p className="mt-4">{selectedLetter.letter.closing}</p>}
                      </div>

                      <div className="mt-40 px-12">
                        <div className="flex justify-end">
                          <div className="text-center min-w-[200px]">
                            <p className="text-sm mb-16">Hormat kami,</p>
                            <div className="border-t-2 border-gray-800 pt-2">
                              <p className="font-semibold">{selectedLetter.letter?.sender?.nama || selectedLetter.letter?.created_by?.nama}</p>
                              <p className="text-sm text-gray-600">{selectedLetter.letter?.sender?.jabatan || "Staff"}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="border-t-2 border-brand-primary p-4">
                      <div className="flex justify-between items-center text-xs text-gray-600">
                        <p>© {new Date().getFullYear()} {selectedLetter.letter?.company?.nama || '-'} - All Rights Reserved</p>
                        <p>Halaman 1 dari 1</p>
                      </div>
                    </div>
                  </div>

                  {/* Approval Form */}
                  <div className="border-t pt-6 space-y-4">
                    <h3 className="font-semibold text-gray-900">⚡ Keputusan Approval</h3>

                    <div>
                      <label className="text-sm font-medium text-gray-700">
                        Catatan{' '}
                        <span className="text-red-500 text-xs">(wajib untuk revisi/penolakan)</span>
                      </label>
                      <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Tuliskan catatan di sini (opsional kecuali revisi/penolakan)..."
                        className="w-full mt-1 p-3 border rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        rows={3}
                      />
                    </div>

                    {error && (
                      <p className="text-sm text-red-600 flex items-center gap-1">
                        <AlertCircle className="h-4 w-4" /> {error}
                      </p>
                    )}

                    <div className="flex gap-3">
                      <Button
                        variant="outline"
                        className="flex-1 text-red-600 border-red-300 hover:bg-red-50"
                        onClick={() => handleApproval(selectedLetter.letter.id, 'REJECT')}
                        disabled={loading !== null}
                      >
                        {loading === 'REJECT'
                          ? <div className="animate-spin rounded-full h-4 w-4 border-2 border-red-300 border-t-red-600 mr-2" />
                          : <AlertCircle className="h-4 w-4 mr-2" />}
                        {loading === 'REJECT' ? 'Mengirim...' : 'Ditolak'}
                      </Button>
                      <Button
                        variant="outline"
                        className="flex-1 text-orange-600 border-orange-300 hover:bg-orange-50"
                        onClick={() => handleApproval(selectedLetter.letter.id, 'REQUEST_REVISION')}
                        disabled={loading !== null}
                      >
                        {loading === 'REQUEST_REVISION'
                          ? <div className="animate-spin rounded-full h-4 w-4 border-2 border-orange-300 border-t-orange-600 mr-2" />
                          : <AlertCircle className="h-4 w-4 mr-2" />}
                        {loading === 'REQUEST_REVISION' ? 'Mengirim...' : 'Perlu Revisi'}
                      </Button>
                      <Button
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                        onClick={() => handleApproval(selectedLetter.letter.id, 'APPROVED_FINAL')}
                        disabled={loading !== null}
                      >
                        {loading === 'APPROVED_FINAL'
                          ? <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-green-300 mr-2" />
                          : <ShieldCheck className="h-4 w-4 mr-2" />}
                        {loading === 'APPROVED_FINAL' ? 'Mengirim...' : 'Setujui'}
                      </Button>
                    </div>

                    <p className="text-xs text-gray-500">
                      <strong>Perhatian:</strong> Jika disetujui, nomor surat akan di-generate otomatis dan surat tidak dapat diubah lagi.
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          </div>,
          document.body
        )}
      </div>
    </div>
  )
}