"use client"

import * as React from "react"
import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Save, Send, Loader2 } from "lucide-react"
import { Card, CardContent } from "@/components/ui"
import Button from "@/components/ui/Button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { TagsInput } from "@/components/ui/TagsInput"

// Hook Form & Zod
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { meetingSchema, type MeetingFormData } from "@/lib/meeting/schemas"

// React Query & Supabase
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useToast } from "@/components/ui/use-toast"
import { supabase } from "@/lib/supabase/client"

export default function EditMoMPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const { toast } = useToast()
  const queryClient = useQueryClient()
  
  // Unwrap params using React.use() for Next.js 15+ compatibility
  const { id: meetingId } = React.use(params)

  // 1. Fetch Existing Meeting Data
  const { data: meeting, isLoading, error } = useQuery({
    queryKey: ['meeting', meetingId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('mom_meetings')
        .select('*')
        .eq('id', meetingId)
        .single()
      
      if (error) throw error
      return data
    },
    enabled: !!meetingId
  })

  // 2. Form Setup
  const form = useForm<MeetingFormData>({
    resolver: zodResolver(meetingSchema),
    defaultValues: {
      title: "",
      meeting_type: "internal",
      meeting_date: "",
      meeting_time: "",
      location: "",
      description: "",
      participants: []
    }
  })

  // 3. Pre-fill form when data loads
  useEffect(() => {
    if (meeting) {
      const meetingDate = new Date(meeting.meeting_date)
      // Format date for input type="date" (YYYY-MM-DD)
      const dateStr = meetingDate.toISOString().split('T')[0]
      // Format time for input type="time" (HH:mm)
      const timeStr = meetingDate.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })

      form.reset({
        title: meeting.title || "",
        meeting_type: meeting.meeting_type || "internal",
        meeting_date: dateStr,
        meeting_time: timeStr,
        location: meeting.location || "",
        description: meeting.description || "",
        participants: Array.isArray(meeting.participants) ? meeting.participants as string[] : []
      })
    }
  }, [meeting, form])

  // 4. Update Mutation
  const mutation = useMutation({
    mutationFn: async (data: MeetingFormData) => {
      // Create proper ISO date string from date + time inputs
      const isoDateTime = new Date(`${data.meeting_date}T${data.meeting_time}`).toISOString()

      const { data: result, error } = await supabase
        .from("mom_meetings")
        .update({
          title: data.title,
          meeting_type: data.meeting_type,
          meeting_date: isoDateTime,
          location: data.location,
          description: data.description,
          participants: data.participants,
          updated_at: new Date().toISOString()
        })
        .eq('id', meetingId)
      
      if (error) throw error
      return result
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mom-meetings"] })
      queryClient.invalidateQueries({ queryKey: ["meeting", meetingId] })
      toast({ title: "Success", description: "Meeting berhasil diperbarui" })
      router.push(`/meeting/${meetingId}`)
    },
    onError: (error) => {
      toast({ variant: "destructive", title: "Error", description: "Gagal memperbarui meeting: " + error.message })
    }
  })

  const onSubmit = form.handleSubmit((data) => {
    mutation.mutate(data)
  })

  // Helper untuk generate nomor surat dinamis (Fallback Display)
  const getRomanMonth = (date: Date) => {
    const months = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII"];
    return months[date.getMonth()];
  }
  const today = new Date();
  // Gunakan nomor dari database jika ada, jika tidak, tampilkan placeholder [AUTO]
  const displayMeetingNumber = meeting?.meeting_number || `[AUTO]/MOM/${getRomanMonth(today)}/${today.getFullYear()}`;


  if (isLoading) {
    return (
      <div className="container mx-auto flex items-center justify-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-brand-primary" />
        <span className="ml-2">Memuat data meeting...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            Gagal mengambil data meeting. {(error as Error).message}
            <Button variant="outline" className="mt-4 block" onClick={() => router.back()}>Kembali</Button>
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="w-full mx-auto md:p-6">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-brand-primary">Edit Minutes of Meeting</h1>
            <p className="text-gray-600">Edit dokumentasi notulen rapat</p>
          </div>
        </div>

        {/* Form */}
        <Card>
          <CardContent className="p-6">
            <form onSubmit={onSubmit} className="space-y-6">
              {/* Basic Info Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold border-b pb-2">Informasi Meeting</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="meeting_number">Meeting Number</Label>
                    <Input 
                      id="meeting_number" 
                      value={displayMeetingNumber} 
                      disabled 
                      className="bg-gray-100 cursor-not-allowed" 
                    />
                  </div>
                  <div className="hidden md:block"></div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="title">Judul Meeting *</Label>
                    <Input 
                        id="title" 
                        placeholder="Contoh: Rapat Koordinasi Proyek Q1..." 
                        {...form.register("title")}
                    />
                    {form.formState.errors.title && (
                        <p className="text-sm text-red-500 mt-1">{form.formState.errors.title.message}</p>
                    )}
                  </div>
                  
                  <div>
                    <Label htmlFor="meeting_type">Tipe Meeting *</Label>
                    <select 
                        id="meeting_type" 
                        className="w-full border rounded-md p-2 h-10"
                        {...form.register("meeting_type")}
                    >
                      <option value="internal">Internal</option>
                      <option value="external">External</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="meeting_date">Tanggal Meeting *</Label>
                    <Input 
                        id="meeting_date" 
                        type="date" 
                        {...form.register("meeting_date")}
                    />
                    {form.formState.errors.meeting_date && (
                        <p className="text-sm text-red-500 mt-1">{form.formState.errors.meeting_date.message}</p>
                    )}
                  </div>
                  
                  <div>
                    <Label htmlFor="meeting_time">Waktu Meeting *</Label>
                    <Input 
                        id="meeting_time" 
                        type="time" 
                        {...form.register("meeting_time")}
                    />
                    {form.formState.errors.meeting_time && (
                        <p className="text-sm text-red-500 mt-1">{form.formState.errors.meeting_time.message}</p>
                    )}
                  </div>
                  
                   <div>
                         <div className="flex justify-between items-center mb-1">
                              <Label htmlFor="location">Lokasi / Link *</Label>
                              <Button 
                                  type="button" 
                                  variant="link" 
                                  className="h-auto p-0 text-xs text-brand-primary"
                                  onClick={() => window.open('https://meet.google.com/landing', '_blank')}
                              >
                                  Buat Link Meeting ↗
                              </Button>
                          </div>
                          <Input
                              id="location"
                              placeholder="Ruang Meeting A atau Link Zoom"
                              {...form.register("location")}
                          />
                          {form.formState.errors.location && (
                            <p className="text-sm text-red-500 mt-1">{form.formState.errors.location.message}</p>
                          )}
                    </div>
                </div>
              </div>

              {/* Participants Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold border-b pb-2">Peserta Meeting</h3>
                
                <div>
                    <Label htmlFor="participants">Daftar Peserta *</Label>
                    <div className="mt-1">
                    <TagsInput
                        value={form.watch("participants")}
                        onChange={(value) => form.setValue("participants", value)}
                        placeholder="Ketik email/nama lalu tekan Enter..."
                    />
                    </div>
                    {form.formState.errors.participants && (
                        <p className="text-sm text-red-500 mt-1">{form.formState.errors.participants.message}</p>
                    )}
                </div>
              </div>

              {/* Description Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold border-b pb-2">Deskripsi Meeting</h3>

                <div>
                  <Label htmlFor="description">Deskripsi Meeting *</Label>
                  <Textarea
                    id="description"
                    className="w-full border rounded-md p-3 min-h-[150px]"
                    placeholder="Jelaskan tujuan dan agenda meeting..."
                    {...form.register("description")}
                  />
                   {form.formState.errors.description && (
                        <p className="text-sm text-red-500 mt-1">{form.formState.errors.description.message}</p>
                   )}
                </div>
              </div>

              {/* Attachments Section - MOCK for now (needs file upload logic) */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold border-b pb-2">Lampiran File</h3>

                <div>
                  <Label htmlFor="attachments">Upload File Lampiran</Label>
                  <div className="mt-2">
                    <input
                      type="file"
                      id="attachments"
                      multiple
                      className="w-full border rounded-md p-2"
                      accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.jpg,.jpeg,.png"
                    />
                    <p className="text-sm text-gray-500 mt-1">
                      💡 Support: PDF, Office docs, gambar. Max 10MB per file (Logic upload belum aktif)
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 justify-end pt-6 border-t">
                <Button type="button" variant="outline" onClick={() => router.back()}>
                  Batal
                </Button>
                <Button type="submit" disabled={mutation.isPending}>
                  <Save className="mr-2 h-4 w-4" />
                  {mutation.isPending ? "Menyimpan..." : "Simpan Perubahan"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Database Schema Info - Optional Reference, kept for development */}
        {/* <Card> ... </Card> */}
      </div>
    </div>
  )
}
