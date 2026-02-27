"use client"

import * as React from "react"
import { createPortal } from "react-dom"
import { useRouter } from "next/navigation"
import { ArrowLeft, Eye, CheckCircle2, AlertCircle, FileText } from "lucide-react"
import { Card, CardContent } from "../../../../components/ui"
import Button from "../../../../components/ui/Button"
import { usePendingReviews, useReviewLetter } from "../../../../hooks/useLetters"
import { useUser } from "../../../../hooks/useUser"
import { useToast } from "@/components/ui/use-toast"

export default function ReviewQueuePage() {
  const router = useRouter()
  const { data: user } = useUser()
  const { data: pendingReviews, isLoading } = usePendingReviews(user?.id)
  const reviewLetter = useReviewLetter()
  const { toast } = useToast()
  
  const [selectedLetter, setSelectedLetter] = React.useState<any>(null)
  const [notes, setNotes] = React.useState('')
  const [loading, setLoading] = React.useState<string | null>(null)
  const [error, setError] = React.useState<string | null>(null)
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  const handleReview = async (letterId: string, action: 'APPROVE' | 'REQUEST_REVISION') => {
    if (action === 'REQUEST_REVISION' && !notes.trim()) {
      toast({
        variant: "destructive",
        title: "Catatan Diperlukan",
        description: "Mohon isi catatan untuk permintaan revisi"
      })
      setError('Mohon isi catatan untuk permintaan revisi')
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
      
      toast({
        title: action === 'REQUEST_REVISION' ? "Revisi Diminta" : "Disetujui",
        description: action === 'REQUEST_REVISION' 
          ? "Surat telah dikembalikan untuk revisi" 
          : "Surat telah disetujui",
      })
      
      // Refresh list
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Gagal melakukan review')
      setLoading(null)
      setSelectedLetter(null)
      toast({
        variant: "destructive",
        title: "Error",
        description: err.message || 'Gagal melakukan review',
      })
    }
  }

  if (isLoading) {
    return (
 <div className=" py-8">
        <div className="text-center">
          <p>Memuat antrian review...</p>
        </div>
      </div>
    )
  }

  return (
 <div className=" py-6">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-4">
          <div>
            <h1 className="text-2xl font-bold text-brand-primary">Antrian Review Surat</h1>
            <p className="text-gray-600">
              {pendingReviews?.length || 0} surat menunggu review Anda
            </p>
          </div>
        </div>


        {/* Empty State */}
        {!pendingReviews || pendingReviews.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <FileText className="h-16 w-16 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-700 mb-2">
                Tidak Ada Surat untuk Direview
              </h3>
              <p className="text-gray-500">
                Semua surat sudah direview atau belum ada yang ditugaskan kepada Anda.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {pendingReviews?.map((item: any) => (
              <Card key={item.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    {/* Letter Info */}
                    <div className="flex-1 space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
                          <FileText className="h-5 w-5" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">
                            {item.letter?.subject}
                          </h3>
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
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric'
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

                    {/* Actions */}
                    <div className="flex flex-col gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedLetter(item)}
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

        {/* Review Modal */}
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
              {/* Header - Sticky */}
              <div className="p-6 border-b border-gray-100 bg-white shrink-0 flex items-start justify-between relative shadow-sm z-10">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-2">
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

                  {/* Letter Details (A4 Preview) */}
                  <div className="space-y-4">
                    <div className="bg-white flex flex-col border border-gray-200 rounded-lg shadow-sm" style={{ aspectRatio: "210/297" }}>
                      {/* HEADER - Company Letterhead */}
                      <div className="border-b-4 border-brand-primary p-8">
                        <div className="flex items-start justify-between">
                          {/* Logo & Company Info */}
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
                          {/* Contact Info */}
                          <div className="text-right text-sm text-gray-600">
                            {selectedLetter.letter?.company?.alamat && <p>{selectedLetter.letter.company.alamat}</p>}
                            {selectedLetter.letter?.company?.telepon && <p className="mt-1">Tel: {selectedLetter.letter.company.telepon}</p>}
                            {selectedLetter.letter?.company?.email && <p>Email: {selectedLetter.letter.company.email}</p>}
                          </div>
                        </div>
                      </div>

                      {/* LETTER CONTENT */}
                      <div className="p-8 space-y-6 flex-1">
                        {/* Reference Number & Date */}
                        <div className="flex justify-between text-sm">
                          <div className="grid grid-cols-[80px_10px_1fr] gap-y-1">
                            <div>Nomor</div>
                            <div>:</div>
                            <div className="font-bold">{selectedLetter.letter?.document_number || "Pending"}</div>

                            <div>Lampiran</div>
                            <div>:</div>
                            <div>{Array.isArray(selectedLetter.letter?.attachments) && selectedLetter.letter.attachments.length > 0 ? `${selectedLetter.letter.attachments.length} file` : "-"}</div>

                            <div>Perihal</div>
                            <div>:</div>
                            <div className="font-bold">{selectedLetter.letter?.subject}</div>
                          </div>
                          <div className="text-right">
                            <p>Jakarta, {new Date(selectedLetter.letter?.letter_date || new Date()).toLocaleDateString("id-ID", {
                              day: "2-digit",
                              month: "long",
                              year: "numeric"
                            })}</p>
                          </div>
                        </div>

                        {/* Recipient */}
                        <div className="text-sm">
                          <p>Kepada Yth,</p>
                          <p className="font-semibold">{selectedLetter.letter?.recipient_name}</p>
                          <p className="font-semibold">{selectedLetter.letter?.recipient_company}</p>
                          <p>{selectedLetter.letter?.recipient_address}</p>
                        </div>

                        {/* Body */}
                        <div className="text-sm leading-relaxed whitespace-pre-line">
                           {selectedLetter.letter?.opening ? (
                             <p className="mb-4">{selectedLetter.letter.opening}</p>
                           ) : (
                             <p className="text-gray-400 italic mb-4">[Tidak ada paragraf pembuka]</p>
                           )}
                           
                           {selectedLetter.letter?.body && selectedLetter.letter.body.trim() && selectedLetter.letter.body !== '<p></p>' && selectedLetter.letter.body !== '<p><br></p>' ? (
                             <div dangerouslySetInnerHTML={{ __html: selectedLetter.letter.body }} className="my-4" />
                           ) : (
                             <div className="my-4 p-4 bg-yellow-50 border border-yellow-200 rounded text-yellow-800">
                               <strong>⚠️ Perhatian:</strong> Isi utama surat (body) kosong. 
                               Mohon periksa kembali data surat ini atau minta pembuat surat untuk melengkapi isinya.
                             </div>
                           )}
                           
                           {selectedLetter.letter?.closing ? (
                             <p className="mt-4">{selectedLetter.letter.closing}</p>
                           ) : (
                             <p className="text-gray-400 italic mt-4">[Tidak ada paragraf penutup]</p>
                           )}
                        </div>

                        {/* Signature */}
                        <div className="mt-40 px-12">
                          {selectedLetter.letter?.signatories && Array.isArray(selectedLetter.letter.signatories) && selectedLetter.letter.signatories.length > 0 ? (
                            <div className={`flex w-full ${(selectedLetter.letter.signatories as any[]).length === 1 ? 'justify-end' : 'justify-between items-end'} gap-8`}>
                              {(selectedLetter.letter.signatories as any[]).sort((a: any, b: any) => (a.order || 0) - (b.order || 0)).map((sig: any, index: number) => (
                                <div key={index} className="text-center min-w-[200px]">
                                  <p className="text-sm mb-16 font-medium">{sig.pihak || (index === 0 && selectedLetter.letter.signatories.length === 1 ? "Hormat kami," : "")}</p>
                                  <div className="border-t-2 border-gray-800 pt-2">
                                    <p className="font-semibold">{sig.name}</p>
                                    <p className="text-sm text-gray-600">{sig.position}</p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="flex justify-end">
                              <div className="text-center min-w-[200px]">
                                <p className="text-sm mb-16">Hormat kami,</p>
                                <div className="border-t-2 border-gray-800 pt-2">
                                  <p className="font-semibold">{selectedLetter.letter?.sender?.nama || selectedLetter.letter?.created_by?.nama}</p>
                                  <p className="text-sm text-gray-600">{selectedLetter.letter?.sender?.jabatan || "Staff"}</p>
                                  <p className="text-sm text-gray-600">{selectedLetter.letter?.sender?.departemen || selectedLetter.letter?.company?.nama || '-'}</p>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* FOOTER */}
                      <div className="border-t-2 border-brand-primary p-4 mt-auto">
                        <div className="flex justify-between items-center text-xs text-gray-600">
                          <p>© {new Date().getFullYear()} {selectedLetter.letter?.company?.nama || '-'} - All Rights Reserved</p>
                          <p>Halaman 1 dari 1</p>
                        </div>
                      </div>
                    </div>

                    {Array.isArray(selectedLetter.letter?.attachments) && selectedLetter.letter.attachments.length > 0 && (
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-2 mt-6">Lampiran</h3>
                        <div className="space-y-2">
                          {selectedLetter.letter.attachments.map((file: any, idx: number) => (
                            <div key={idx} className="flex items-center gap-2 text-sm p-3 bg-blue-50 border border-blue-100 rounded-md">
                              <FileText className="h-5 w-5 text-blue-500" />
                              <span>{file.name}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Review Form */}
                  <div className="border-t pt-6 space-y-4">
                    <h3 className="font-semibold text-gray-900">Review Surat</h3>
                    
                    <div>
                      <label className="text-sm font-medium text-gray-700">
                        Catatan {loading === 'REQUEST_REVISION' && <span className="text-red-500">*</span>}
                      </label>
                      <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder={loading === 'REQUEST_REVISION' ? "Tuliskan alasan permintaan revisi..." : "Tuliskan catatan review di sini..."}
                        className="w-full mt-1 p-3 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        rows={3}
                      />
                    </div>

                    <div className="flex gap-3">
                      <Button
                        variant="outline"
                        className="flex-1"
                        onClick={() => handleReview(selectedLetter.letter.id, 'REQUEST_REVISION')}
                        disabled={loading !== null}
                      >
                        {loading === 'REQUEST_REVISION' ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-400 border-t-blue-600 mr-2" />
                        ) : (
                          <AlertCircle className="h-4 w-4 mr-2" />
                        )}
                        {loading === 'REQUEST_REVISION' ? 'Mengirim...' : 'Minta Revisi'}
                      </Button>
                      <Button
                        className="flex-1 bg-green-600 hover:bg-green-700"
                        onClick={() => handleReview(selectedLetter.letter.id, 'APPROVE')}
                        disabled={loading !== null}
                      >
                        {loading === 'APPROVE' ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-green-300 mr-2" />
                        ) : (
                          <CheckCircle2 className="h-4 w-4 mr-2" />
                        )}
                        {loading === 'APPROVE' ? 'Mengirim...' : 'Setujui'}
                      </Button>
                    </div>
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
