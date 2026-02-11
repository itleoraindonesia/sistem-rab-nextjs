"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Eye, Edit, FileText, RotateCcw } from "lucide-react"
import { Card, CardContent } from "../../../../components/ui"
import Button from "../../../../components/ui/Button"
import { useLetters, useReviseAndResubmit } from "../../../../hooks/useLetters"
import { useUser } from "../../../../hooks/useUser"
import { useToast } from "@/components/ui/use-toast"

export default function RevisiPage() {
  const router = useRouter()
  const user = useUser()
  const { data: revisionLetters, isLoading } = useLetters({
    status: 'REVISION_REQUESTED',
    created_by_id: user?.id
  })
  const reviseAndResubmit = useReviseAndResubmit()
  const { toast } = useToast()
  
  const [selectedLetter, setSelectedLetter] = React.useState<any>(null)
  const [loading, setLoading] = React.useState<string | null>(null)
  const [error, setError] = React.useState<string | null>(null)

  const handleResubmit = async (letterId: string) => {
    setLoading(letterId)
    setError(null)
    
    try {
      await reviseAndResubmit.mutateAsync(letterId)
      setSelectedLetter(null)
      setLoading(null)
      
      toast({
        title: "Berhasil",
        description: "Surat telah dikirim ulang ke tahap review",
      })
    } catch (err: any) {
      setError(err.message || 'Gagal mengirim ulang surat')
      setLoading(null)
      toast({
        variant: "destructive",
        title: "Error",
        description: err.message || 'Gagal mengirim ulang surat',
      })
    }
  }

   if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center">
          <p>Memuat surat yang perlu direvisi...</p>
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
             <h1 className="text-2xl font-bold text-brand-primary">Surat Perlu Revisi</h1>
             <p className="text-gray-600">
               {revisionLetters?.length || 0} surat menunggu perbaikan Anda
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
         {!revisionLetters || revisionLetters.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <RotateCcw className="h-16 w-16 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-700 mb-2">
                Tidak Ada Surat Perlu Revisi
              </h3>
              <p className="text-gray-500">
                Semua surat Anda sudah diperbaiki atau tidak ada surat yang memerlukan revisi.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {revisionLetters?.map((letter: any) => (
              <Card key={letter.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    {/* Letter Info */}
                    <div className="flex-1 space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center">
                          <FileText className="h-5 w-5" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">
                            {letter.subject}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {letter.document_type?.name || 'Surat'} • {letter.created_by?.nama}
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-gray-500">Penerima</p>
                          <p className="font-medium">{letter.recipient_name}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Tanggal Dibuat</p>
                          <p className="font-medium">
                            {new Date(letter.created_at).toLocaleDateString('id-ID', {
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
                          {letter.body?.replace(/<[^>]*>/g, '') || '-'}
                        </p>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => router.push(`/documents/outgoing-letter/${letter.id}`)}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        Lihat
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => router.push(`/documents/outgoing-letter/${letter.id}`)}
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Revisi
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
