"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Eye, CheckCircle2, AlertCircle, FileText } from "lucide-react"
import { Card, CardContent } from "../../../../components/ui"
import Button from "../../../../components/ui/Button"
import { usePendingReviews, useReviewLetter } from "../../../../hooks/useLetters"
import { useUser } from "../../../../hooks/useUser"

export default function ReviewQueuePage() {
  const router = useRouter()
  const user = useUser()
  const { data: pendingReviews, isLoading } = usePendingReviews(user?.id)
  const reviewLetter = useReviewLetter()
  
  const [selectedLetter, setSelectedLetter] = React.useState<any>(null)
  const [notes, setNotes] = React.useState('')
  const [loading, setLoading] = React.useState<string | null>(null)
  const [error, setError] = React.useState<string | null>(null)

  const handleReview = async (letterId: string, action: 'APPROVE' | 'REQUEST_REVISION') => {
    if (action === 'REQUEST_REVISION' && !notes.trim()) {
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
    } catch (err: any) {
      setError(err.message || 'Gagal melakukan review')
      setLoading(null)
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center">
          <p>Memuat antrian review...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-brand-primary">Antrian Review Surat</h1>
            <p className="text-gray-600">
              {pendingReviews?.length || 0} surat menunggu review Anda
            </p>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-md">
            <p className="text-sm font-medium">{error}</p>
          </div>
        )}

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
            {pendingReviews?.map((tracking: any) => (
              <Card key={tracking.id} className="hover:shadow-md transition-shadow">
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
                            {tracking.letter.subject}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {tracking.letter.document_type.name} • {tracking.letter.created_by.nama}
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-gray-500">Penerima</p>
                          <p className="font-medium">{tracking.letter.recipient_name}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Tanggal</p>
                          <p className="font-medium">
                            {new Date(tracking.letter.letter_date).toLocaleDateString('id-ID', {
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
                          {tracking.letter.body}
                        </p>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedLetter(tracking)}
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
        {selectedLetter && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <Card className="max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <CardContent className="p-6">
                <div className="space-y-6">
                  {/* Header */}
                  <div className="flex items-start justify-between">
                    <div>
                      <h2 className="text-xl font-bold text-gray-900 mb-2">
                        {selectedLetter.letter.subject}
                      </h2>
                      <p className="text-sm text-gray-600">
                        {selectedLetter.letter.document_type.name} • {selectedLetter.letter.created_by.nama}
                      </p>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => setSelectedLetter(null)}>
                      ✕
                    </Button>
                  </div>

                  {/* Letter Details */}
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">Informasi Surat</h3>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-gray-500">Nomor Surat</p>
                          <p className="font-medium">{selectedLetter.letter.document_number || '-'}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Tanggal</p>
                          <p className="font-medium">
                            {new Date(selectedLetter.letter.letter_date).toLocaleDateString('id-ID', {
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric'
                            })}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-500">Instansi</p>
                          <p className="font-medium">{selectedLetter.letter.company?.nama || '-'}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Pengirim</p>
                          <p className="font-medium">{selectedLetter.letter.sender_name || selectedLetter.letter.created_by.nama}</p>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">Penerima</h3>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-gray-500">Nama Instansi</p>
                          <p className="font-medium">{selectedLetter.letter.recipient_company}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Nama Kontak</p>
                          <p className="font-medium">{selectedLetter.letter.recipient_name}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">WhatsApp</p>
                          <p className="font-medium">{selectedLetter.letter.recipient_whatsapp}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Email</p>
                          <p className="font-medium">{selectedLetter.letter.recipient_email || '-'}</p>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">Isi Surat</h3>
                      <div className="space-y-2 text-sm">
                        <div>
                          <p className="text-gray-500">Pembuka</p>
                          <p className="text-gray-700">{selectedLetter.letter.opening}</p>
                        </div>
                        <div className="border-t pt-2">
                          <p className="text-gray-500">Isi Utama</p>
                          <div 
                            className="text-gray-700 prose prose-sm max-w-none"
                            dangerouslySetInnerHTML={{ __html: selectedLetter.letter.body }}
                          />
                        </div>
                        <div className="border-t pt-2">
                          <p className="text-gray-500">Penutup</p>
                          <p className="text-gray-700">{selectedLetter.letter.closing}</p>
                        </div>
                      </div>
                    </div>

                    {selectedLetter.letter.attachments && selectedLetter.letter.attachments.length > 0 && (
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-2">Lampiran</h3>
                        <div className="space-y-2">
                          {selectedLetter.letter.attachments.map((file: any, idx: number) => (
                            <div key={idx} className="flex items-center gap-2 text-sm p-2 bg-gray-50 rounded">
                              <FileText className="h-4 w-4 text-gray-500" />
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
                      <label className="text-sm font-medium text-gray-700">Catatan (Opsional)</label>
                      <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Tuliskan catatan review di sini..."
                        className="w-full mt-1 p-3 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        rows={3}
                      />
                    </div>

                    <div className="flex gap-3">
                      <Button
                        variant="outline"
                        className="flex-1"
                        onClick={() => handleReview(selectedLetter.letter.id, 'REQUEST_REVISION')}
                        disabled={loading === 'REQUEST_REVISION'}
                      >
                        <AlertCircle className="h-4 w-4 mr-2" />
                        {loading === 'REQUEST_REVISION' ? 'Mengirim...' : 'Minta Revisi'}
                      </Button>
                      <Button
                        className="flex-1 bg-green-600 hover:bg-green-700"
                        onClick={() => handleReview(selectedLetter.letter.id, 'APPROVE')}
                        disabled={loading === 'APPROVE'}
                      >
                        <CheckCircle2 className="h-4 w-4 mr-2" />
                        {loading === 'APPROVE' ? 'Mengirim...' : 'Setujui'}
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}