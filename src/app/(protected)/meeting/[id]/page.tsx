"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Edit, FileDown, Trash2, Calendar, Clock, MapPin, Users, Loader2 } from "lucide-react"
import { Card, CardContent } from "@/components/ui"
import Button from "@/components/ui/Button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useToast } from "@/components/ui/use-toast"
import { supabase } from "@/lib/supabase/client"
import Link from "next/link"

export default function MeetingDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const { toast } = useToast()
  const queryClient = useQueryClient()
  
  // Unwrap params using React.use() for Next.js 15+ compatibility
  const { id: meetingId } = React.use(params)

  // Fetch Meeting Data
  const { data: meeting, isLoading, error } = useQuery({
    queryKey: ['meeting', meetingId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('mom_meetings')
        .select(`
          *,
          users!mom_meetings_created_by_fkey (
            nama,
            email
          )
        `)
        .eq('id', meetingId)
        .single()
      
      if (error) throw error
      return data
    },
    enabled: !!meetingId
  })

  // Delete Mutation
  const deleteMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from('mom_meetings')
        .delete()
        .eq('id', meetingId)
      
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mom-meetings'] })
      toast({ title: "Success", description: "Meeting berhasil dihapus" })
      router.push('/meeting')
    },
    onError: (error) => {
      toast({ 
        variant: "destructive", 
        title: "Error", 
        description: "Gagal menghapus meeting: " + (error as Error).message 
      })
    }
  })

  const handleDelete = () => {
    if (confirm('Apakah Anda yakin ingin menghapus meeting ini?')) {
      deleteMutation.mutate()
    }
  }

  const handleExportPDF = () => {
    toast({ 
      title: "Coming Soon", 
      description: "Fitur export PDF akan segera hadir" 
    })
  }

  if (isLoading) {
    return (
      <div className="w-full mx-auto md:p-6 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-brand-primary mx-auto mb-2" />
          <span className="text-gray-600">Memuat data meeting...</span>
        </div>
      </div>
    )
  }

  if (error || !meeting) {
    return (
      <div className="w-full mx-auto md:p-6">
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            Gagal mengambil data meeting. {(error as Error)?.message}
            <Button variant="outline" className="mt-4 block" onClick={() => router.back()}>
              Kembali
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  const meetingDate = new Date(meeting.meeting_date)

  return (
    <div className="w-full mx-auto md:p-6">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => router.back()}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-brand-primary">Detail Meeting</h1>
              <p className="text-gray-600">Informasi lengkap meeting</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleExportPDF}>
              <FileDown className="mr-2 h-4 w-4" />
              Export PDF
            </Button>
            <Link href={`/meeting/${meetingId}/edit`}>
              <Button>
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </Button>
            </Link>
          </div>
        </div>

        {/* Main Content */}
        <Card>
          <CardContent className="p-6 space-y-6">
            {/* Meeting Number & Status */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b">
              <div>
                <div className="text-sm text-gray-500 mb-1">Meeting Number</div>
                <div className="font-mono text-lg font-semibold text-gray-900">
                  {meeting.meeting_number || '-'}
                </div>
              </div>
              <div className="flex gap-2">
                <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border ${
                  meeting.status === 'published' 
                    ? 'bg-green-50 text-green-700 border-green-200' 
                    : 'bg-yellow-50 text-yellow-700 border-yellow-200'
                }`}>
                  <span className={`h-2 w-2 rounded-full ${meeting.status === 'published' ? 'bg-green-500' : 'bg-yellow-500'}`}></span>
                  {meeting.status === 'published' ? 'Published' : 'Draft'}
                </span>
                <span className={`inline-flex px-3 py-1.5 rounded-full text-sm font-medium border ${
                  meeting.meeting_type === 'internal' 
                    ? 'bg-blue-50 text-blue-700 border-blue-200' 
                    : 'bg-purple-50 text-purple-700 border-purple-200'
                }`}>
                  {meeting.meeting_type === 'internal' ? 'Internal' : 'External'}
                </span>
              </div>
            </div>

            {/* Title */}
            <div>
              <div className="text-sm text-gray-500 mb-2">Judul Meeting</div>
              <h2 className="text-2xl font-bold text-gray-900">{meeting.title}</h2>
            </div>

            {/* Meeting Info Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Date */}
              <div>
                <div className="text-sm text-gray-500 mb-2 flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Tanggal
                </div>
                <div className="text-gray-900 font-medium">
                  {meetingDate.toLocaleDateString("id-ID", { 
                    weekday: 'long',
                    day: "numeric", 
                    month: "long", 
                    year: "numeric" 
                  })}
                </div>
              </div>

              {/* Time */}
              <div>
                <div className="text-sm text-gray-500 mb-2 flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Waktu
                </div>
                <div className="text-gray-900 font-medium">
                  {meetingDate.toLocaleTimeString("id-ID", { 
                    hour: "2-digit", 
                    minute: "2-digit",
                    timeZoneName: 'short'
                  })}
                </div>
              </div>

              {/* Location */}
              <div className="md:col-span-2">
                <div className="text-sm text-gray-500 mb-2 flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Lokasi / Link Meeting
                </div>
                <div className="text-gray-900 font-medium">
                  {meeting.location?.startsWith('http') ? (
                    <a 
                      href={meeting.location} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-brand-primary hover:underline"
                    >
                      {meeting.location}
                    </a>
                  ) : (
                    meeting.location
                  )}
                </div>
              </div>
            </div>

            {/* Participants */}
            <div>
              <div className="text-sm text-gray-500 mb-3 flex items-center gap-2">
                <Users className="h-4 w-4" />
                Peserta ({Array.isArray(meeting.participants) ? meeting.participants.length : 0})
              </div>
              {Array.isArray(meeting.participants) && meeting.participants.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {meeting.participants.map((participant: string, index: number) => (
                    <div 
                      key={index}
                      className="inline-flex items-center gap-2 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg"
                    >
                      <div className="h-8 w-8 rounded-full bg-brand-primary/10 flex items-center justify-center text-sm font-bold text-brand-primary">
                        {participant[0]?.toUpperCase() || 'U'}
                      </div>
                      <span className="text-sm text-gray-700">{participant}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-gray-400 text-sm">Tidak ada peserta</div>
              )}
            </div>

            {/* Description */}
            <div>
              <div className="text-sm text-gray-500 mb-2">Deskripsi / Agenda</div>
              <div className="text-gray-900 whitespace-pre-wrap bg-gray-50 p-4 rounded-lg border border-gray-200">
                {meeting.description || '-'}
              </div>
            </div>

            {/* Metadata */}
            <div className="pt-4 border-t">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Dibuat oleh: </span>
                  <span className="text-gray-900 font-medium">
                    {meeting.users?.nama || 'System'}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500">Dibuat pada: </span>
                  <span className="text-gray-900 font-medium">
                    {new Date(meeting.created_at).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit"
                    })}
                  </span>
                </div>
              </div>
            </div>

            {/* Danger Zone */}
            <div className="pt-6 border-t">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <h3 className="text-sm font-semibold text-red-900 mb-2">Danger Zone</h3>
                <p className="text-sm text-red-700 mb-3">
                  Menghapus meeting akan menghapus semua data terkait. Tindakan ini tidak dapat dibatalkan.
                </p>
                <Button 
                  variant="destructive" 
                  size="sm"
                  onClick={handleDelete}
                  disabled={deleteMutation.isPending}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  {deleteMutation.isPending ? 'Menghapus...' : 'Hapus Meeting'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
