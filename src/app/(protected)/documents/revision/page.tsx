"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Eye, Edit, FileText, RotateCcw, AlertCircle } from "lucide-react"
import { Card, CardContent } from "../../../../components/ui"
import Button from "../../../../components/ui/Button"
import { useLetters } from "../../../../hooks/useLetters"
import { useUser } from "../../../../hooks/useUser"
import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/lib/supabase/client"
import { OutgoingLetterWithRelations, LetterHistory } from "@/types/letter"

// Custom hook to fetch revision notes for a letter
function useRevisionNotes(letterId: string) {
  return useQuery<LetterHistory | null>({
    queryKey: ['revision-notes', letterId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('letter_histories')
        .select(`
          *,
          action_by:users!letter_histories_action_by_id_fkey(id, nama, email)
        `)
        .eq('letter_id', letterId)
        .eq('action_type', 'REVISION_REQUESTED')
        .order('created_at', { ascending: false })
        .limit(1)
        .single()
      
      if (error) {
        console.error('[useRevisionNotes] Failed to fetch:', error)
        return null
      }
      
      return data
    },
    enabled: !!letterId
  })
}

// Separate component for each letter card to avoid hooks violation
function RevisionLetterCard({ letter }: { letter: OutgoingLetterWithRelations }) {
  const router = useRouter()
  const { data: revisionNote, isLoading: loadingNote } = useRevisionNotes(letter.id)
  
  return (
    <Card className="hover:shadow-md transition-shadow">
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
                  {letter.created_at ? new Date(letter.created_at).toLocaleDateString('id-ID', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                  }) : '-'}
                </p>
              </div>
            </div>

            <div>
              <p className="text-gray-500 text-sm mb-1">Ringkasan Isi</p>
              <p className="text-sm text-gray-700 line-clamp-2">
                {letter.body?.replace(/<[^>]*>/g, '') || '-'}
              </p>
            </div>

            {/* Revision Notes Section */}
            {loadingNote && (
              <div className="mt-4 p-4 bg-gray-50 border border-gray-200 rounded-md animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            )}
            
            {!loadingNote && revisionNote && (
              <div className="mt-4 p-4 bg-orange-50 border border-orange-200 rounded-md">
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-5 w-5 text-orange-600 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-orange-900 mb-1">
                      Catatan Revisi dari {revisionNote.action_by?.nama}
                    </p>
                    <p className="text-sm text-orange-800">
                      {revisionNote.notes || 'Tidak ada catatan'}
                    </p>
                    <p className="text-xs text-orange-600 mt-2">
                      Diminta pada: {revisionNote.created_at ? new Date(revisionNote.created_at).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      }) : '-'}
                    </p>
                  </div>
                </div>
              </div>
            )}
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
              onClick={() => router.push(`/documents/outgoing-letter/${letter.id}/edit`)}
            >
              <Edit className="h-4 w-4 mr-2" />
              Revisi
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default function RevisiPage() {
  const router = useRouter()
  const user = useUser()
  const { data: revisionLetters, isLoading } = useLetters({
    status: 'REVISION_REQUESTED',
    created_by_id: user?.id
  })

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
            {revisionLetters?.map((letter: OutgoingLetterWithRelations) => (
              <RevisionLetterCard key={letter.id} letter={letter} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
