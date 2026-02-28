"use client"

import * as React from "react"
import { createPortal } from "react-dom"
import { useRouter } from "next/navigation"
import { Eye, CheckCircle2, AlertCircle, FileText, ShieldCheck } from "lucide-react"
import { Card, CardContent } from "../../../../components/ui"
import Button from "../../../../components/ui/Button"
import { usePendingReviews, usePendingApprovals, useReviewLetter } from "../../../../hooks/useLetters"
import { useUser } from "../../../../hooks/useUser"
import { useToast } from "@/components/ui/use-toast"

// Mode aksi untuk membedakan konteks review vs approval
type ActionMode = 'review' | 'approval'

export default function ReviewQueuePage() {
  const router = useRouter()
  const { data: user } = useUser()
  const { data: pendingReviews, isLoading: isLoadingReviews } = usePendingReviews(user?.id)
  const { data: pendingApprovals, isLoading: isLoadingApprovals } = usePendingApprovals(user?.id)
  const reviewLetter = useReviewLetter()
  const { toast } = useToast()
  
  const [selectedLetter, setSelectedLetter] = React.useState<any>(null)
  const [actionMode, setActionMode] = React.useState<ActionMode>('review')
  const [notes, setNotes] = React.useState('')
  const [loading, setLoading] = React.useState<string | null>(null)
  const [error, setError] = React.useState<string | null>(null)

  const isLoading = isLoadingReviews || isLoadingApprovals

  const openModal = (item: any, mode: ActionMode) => {
    setSelectedLetter(item)
    setActionMode(mode)
    setNotes('')
    setError(null)
  }

  const handleReview = async (letterId: string, action: 'APPROVE' | 'REQUEST_REVISION' | 'APPROVED_FINAL' | 'REJECT') => {
    if ((action === 'REQUEST_REVISION' || action === 'REJECT') && !notes.trim()) {
      toast({
        variant: "destructive",
        title: "Catatan Diperlukan",
        description: "Mohon isi catatan untuk permintaan revisi / penolakan"
      })
      setError('Mohon isi catatan')
      return
    }

    setLoading(action)
    setError(null)

    try {
      await reviewLetter.mutateAsync({
        letterId,
        action,
        notes: notes || undefined,
      })

      setSelectedLetter(null)
      setNotes('')
      setLoading(null)

      const actionLabel: Record<string, string> = {
        APPROVE: 'Surat telah disetujui (review)',
        REQUEST_REVISION: 'Surat telah dikembalikan untuk revisi',
        APPROVED_FINAL: 'Surat telah disetujui final',
        REJECT: 'Surat telah ditolak',
      }
      toast({
        title: "Berhasil",
        description: actionLabel[action] || 'Aksi berhasil',
      })

      router.refresh()
    } catch (err: any) {
      setError(err.message || 'Gagal melakukan aksi')
      setLoading(null)
      setSelectedLetter(null)
      toast({
        variant: "destructive",
        title: "Error",
        description: err.message || 'Gagal melakukan aksi',
      })
    }
  }

  if (isLoading) {
    return (
      <div className="py-8">
        <div className="text-center">
          <p>Memuat antrian...</p>
        </div>
      </div>
    )
  }

  // Reusable card untuk item antrian
  const QueueCard = ({ item, mode }: { item: any; mode: ActionMode }) => (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 space-y-3">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${mode === 'approval' ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'}`}>
                {mode === 'approval' ? <ShieldCheck className="h-5 w-5" /> : <FileText className="h-5 w-5" />}
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">{item.letter?.subject}</h3>
                <p className="text-sm text-gray-600">
                  {item.letter?.document_type?.name} • {item.letter?.created_by?.nama}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-500">Penerima</p>
                <p className="font-medium">{item.letter?.recipient_name}</p>
              </div>
              <div>
                <p className="text-gray-500">Tanggal</p>
                <p className="font-medium">
                  {new Date(item.letter?.letter_date).toLocaleDateString('id-ID', {
                    day: 'numeric', month: 'long', year: 'numeric'
                  })}
                </p>
              </div>
            </div>

            <div>
              <p className="text-gray-500 text-sm mb-1">Ringkasan Isi</p>
              <p className="text-sm text-gray-700 line-clamp-2">
                {item.letter?.body?.replace(/<[^>]*>/g, '') || '-'}
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Button variant="outline" size="sm" onClick={() => openModal(item, mode)}>
              <Eye className="h-4 w-4 mr-2" />
              Detail
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className="py-6">
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-brand-primary">Antrian Review & Approval</h1>
          <p className="text-gray-600 mt-1">
            {(pendingReviews?.length || 0) + (pendingApprovals?.length || 0)} surat menunggu tindakan Anda
          </p>
        </div>

        {/* ── SECTION: Antrian Review ── */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-blue-600" />
            <h2 className="text-lg font-semibold text-gray-800">
              Antrian Review
              {pendingReviews && pendingReviews.length > 0 && (
                <span className="ml-2 px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 text-sm font-medium">
                  {pendingReviews.length}
                </span>
              )}
            </h2>
          </div>

          {!pendingReviews || pendingReviews.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <FileText className="h-12 w-12 mx-auto text-gray-300 mb-3" />
                <p className="text-gray-500">Tidak ada surat untuk direview saat ini.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {pendingReviews.map((item: any) => (
                <QueueCard key={item.id} item={item} mode="review" />
              ))}
            </div>
          )}
        </div>

        {/* ── SECTION: Antrian Approval ── */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-green-600" />
            <h2 className="text-lg font-semibold text-gray-800">
              Antrian Approval
              {pendingApprovals && pendingApprovals.length > 0 && (
                <span className="ml-2 px-2 py-0.5 rounded-full bg-green-100 text-green-700 text-sm font-medium">
                  {pendingApprovals.length}
                </span>
              )}
            </h2>
          </div>

          {!pendingApprovals || pendingApprovals.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <ShieldCheck className="h-12 w-12 mx-auto text-gray-300 mb-3" />
                <p className="text-gray-500">Tidak ada surat untuk di-approve saat ini.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {pendingApprovals.map((item: any) => (
                <QueueCard key={item.id} item={item} mode="approval" />
              ))}
            </div>
          )}
        </div>

        {/* Modal Detail + Aksi */}
        {selectedLetter && typeof document !== 'undefined' && createPortal(
          <div
            className="fixed top-0 left-0 w-screen h-screen z-[99999] bg-black/60 flex items-center justify-center p-4 sm:p-6 overflow-hidden backdrop-blur-sm"
            style={{ position: 'fixed', top: 0, left: 0, bottom: 0, right: 0 }}
            onClick={() => setSelectedLetter(null)}
          >
            <Card
              className="w-full max-w-5xl max-h-[95vh] flex flex-col overflow-hidden shadow-2xl bg-white m-0"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="p-6 border-b border-gray-100 bg-white shrink-0 flex items-start justify-between relative shadow-sm z-10">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${actionMode === 'approval' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                      {actionMode === 'approval' ? '⚡ Approval' : '🔍 Review'}
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

                      <div className="text-sm leading-relaxed whitespace-pre-line">
                        {selectedLetter.letter?.opening
                          ? <p className="mb-4">{selectedLetter.letter.opening}</p>
                          : <p className="text-gray-400 italic mb-4">[Tidak ada paragraf pembuka]</p>
                        }
                        {selectedLetter.letter?.body && selectedLetter.letter.body.trim() && selectedLetter.letter.body !== '<p></p>'
                          ? <div dangerouslySetInnerHTML={{ __html: selectedLetter.letter.body }} className="my-4" />
                          : <div className="my-4 p-4 bg-yellow-50 border border-yellow-200 rounded text-yellow-800"><strong>⚠️ Perhatian:</strong> Isi utama surat kosong.</div>
                        }
                        {selectedLetter.letter?.closing
                          ? <p className="mt-4">{selectedLetter.letter.closing}</p>
                          : <p className="text-gray-400 italic mt-4">[Tidak ada paragraf penutup]</p>
                        }
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

                  {/* Action Form */}
                  <div className="border-t pt-6 space-y-4">
                    <h3 className="font-semibold text-gray-900">
                      {actionMode === 'approval' ? '⚡ Keputusan Approval' : '🔍 Keputusan Review'}
                    </h3>

                    <div>
                      <label className="text-sm font-medium text-gray-700">
                        Catatan{' '}
                        {(loading === 'REQUEST_REVISION' || loading === 'REJECT') && (
                          <span className="text-red-500">* (wajib untuk revisi/penolakan)</span>
                        )}
                      </label>
                      <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Tuliskan catatan di sini (opsional kecuali revisi/penolakan)..."
                        className="w-full mt-1 p-3 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        rows={3}
                      />
                    </div>

                    {error && (
                      <p className="text-sm text-red-600 flex items-center gap-1">
                        <AlertCircle className="h-4 w-4" /> {error}
                      </p>
                    )}

                    {actionMode === 'review' ? (
                      <div className="flex gap-3">
                        <Button
                          variant="outline"
                          className="flex-1"
                          onClick={() => handleReview(selectedLetter.letter.id, 'REQUEST_REVISION')}
                          disabled={loading !== null}
                        >
                          {loading === 'REQUEST_REVISION'
                            ? <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-400 border-t-blue-600 mr-2" />
                            : <AlertCircle className="h-4 w-4 mr-2" />}
                          {loading === 'REQUEST_REVISION' ? 'Mengirim...' : 'Minta Revisi'}
                        </Button>
                        <Button
                          className="flex-1 bg-green-600 hover:bg-green-700"
                          onClick={() => handleReview(selectedLetter.letter.id, 'APPROVE')}
                          disabled={loading !== null}
                        >
                          {loading === 'APPROVE'
                            ? <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-green-300 mr-2" />
                            : <CheckCircle2 className="h-4 w-4 mr-2" />}
                          {loading === 'APPROVE' ? 'Mengirim...' : 'Setujui (Review)'}
                        </Button>
                      </div>
                    ) : (
                      <div className="flex gap-3">
                        <Button
                          variant="outline"
                          className="flex-1 text-red-600 border-red-300 hover:bg-red-50"
                          onClick={() => handleReview(selectedLetter.letter.id, 'REJECT')}
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
                          onClick={() => handleReview(selectedLetter.letter.id, 'REQUEST_REVISION')}
                          disabled={loading !== null}
                        >
                          {loading === 'REQUEST_REVISION'
                            ? <div className="animate-spin rounded-full h-4 w-4 border-2 border-orange-300 border-t-orange-600 mr-2" />
                            : <AlertCircle className="h-4 w-4 mr-2" />}
                          {loading === 'REQUEST_REVISION' ? 'Mengirim...' : 'Perlu Revisi'}
                        </Button>
                        <Button
                          className="flex-1 bg-green-600 hover:bg-green-700"
                          onClick={() => handleReview(selectedLetter.letter.id, 'APPROVED_FINAL')}
                          disabled={loading !== null}
                        >
                          {loading === 'APPROVED_FINAL'
                            ? <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-green-300 mr-2" />
                            : <ShieldCheck className="h-4 w-4 mr-2" />}
                          {loading === 'APPROVED_FINAL' ? 'Mengirim...' : 'Setujui'}
                        </Button>
                      </div>
                    )}
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
