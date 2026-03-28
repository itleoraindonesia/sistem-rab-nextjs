"use client"

import * as React from "react"
import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Save, Loader2, Upload, X, File } from "lucide-react"
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
import { meetingSchema, type MeetingFormData, type MeetingAttachmentData } from "@/lib/meeting/schemas"

// React Query & Custom Hooks
import { useToast } from "@/components/ui/use-toast"
import { useMeeting, useUpdateMeeting } from "@/hooks/useMeetings"

// File Upload Utilities
import {
  uploadMeetingFile,
  deleteMeetingFile,
  validateMeetingFile,
  formatFileSize
} from "@/lib/supabase/meeting-storage"

export default function EditMoMPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const { toast } = useToast()
  
  // Unwrap params using React.use() for Next.js 15+ compatibility
  const { id: meetingId } = React.use(params)

  // 1. Fetch Existing Meeting Data
  const { data: meeting, isLoading, error } = useMeeting(meetingId)

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
      participants: [],
      attachments: []
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
        participants: Array.isArray(meeting.participants) ? meeting.participants as string[] : [],
        attachments: Array.isArray(meeting.attachments) ? meeting.attachments as MeetingAttachmentData[] : []
      })
    }
  }, [meeting, form])

  // File upload state
  const [uploadingFiles, setUploadingFiles] = React.useState(false)
  const watchedAttachments = form.watch("attachments")

  // 4. Update Mutation
  const updateMutation = useUpdateMeeting(meetingId)

  // Handle file select
  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files || files.length === 0) return

    setUploadingFiles(true)

    try {
      const currentAttachments = watchedAttachments || []

      // Check total files limit
      if (currentAttachments.length + files.length > 10) {
        throw new Error('Maksimal 10 file lampiran')
      }

      const uploadedFiles: MeetingAttachmentData[] = []

      for (let i = 0; i < files.length; i++) {
        const file = files[i]

        // Validate file
        const validation = validateMeetingFile(file)
        if (!validation.valid) {
          throw new Error(`${file.name}: ${validation.error}`)
        }

        // Upload to Supabase Storage (directly to meeting folder since ID exists)
        const uploadedFile = await uploadMeetingFile(file, meetingId)

        uploadedFiles.push({
          id: uploadedFile.id,
          name: uploadedFile.name,
          size: uploadedFile.size,
          type: uploadedFile.type,
          url: uploadedFile.url,
          path: uploadedFile.path,
        })
      }

      // Add to form
      form.setValue('attachments', [...currentAttachments, ...uploadedFiles])

      toast({
        title: "Success",
        description: `${uploadedFiles.length} file berhasil diupload`
      })

    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Upload Error",
        description: err.message || 'Gagal upload file'
      })
    } finally {
      setUploadingFiles(false)
      // Reset input
      event.target.value = ''
    }
  }

  // Handle remove file
  const handleRemoveFile = async (id: string, path?: string) => {
    try {
      // Delete from storage if path exists
      if (path) {
        await deleteMeetingFile(path)
      }

      // Remove from form
      const currentAttachments = watchedAttachments || []
      form.setValue('attachments', currentAttachments.filter(file => file.id !== id))

      toast({
        title: "Success",
        description: "File berhasil dihapus"
      })
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: 'Gagal menghapus file'
      })
    }
  }

  const onSubmit = form.handleSubmit((data) => {
    updateMutation.mutate(data, {
      onSuccess: () => {
        toast({ title: "Success", description: "Meeting berhasil diperbarui" })
        router.push(`/meeting/${meetingId}`)
      },
      onError: (error) => {
        toast({ variant: "destructive", title: "Error", description: "Gagal memperbarui meeting: " + error.message })
      }
    })
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
 <div className=" flex items-center justify-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-brand-primary" />
        <span className="ml-2">Memuat data meeting...</span>
      </div>
    )
  }

  if (error) {
    return (
 <div >
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
    <div className="w-full mx-auto">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
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

              {/* Attachments Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold border-b pb-2">Lampiran File</h3>

                <div className="space-y-3">
                  {/* File Input */}
                  <div className="relative">
                    <input
                      type="file"
                      id="attachments"
                      multiple
                      className="hidden"
                      onChange={handleFileSelect}
                      accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
                      disabled={uploadingFiles}
                    />
                    <label
                      htmlFor="attachments"
                      className={`flex items-center justify-center gap-2 w-full border-2 border-dashed border-gray-300 rounded-lg p-4 cursor-pointer hover:border-brand-primary hover:bg-gray-50 transition-colors ${uploadingFiles ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      {uploadingFiles ? (
                        <>
                          <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
                          <span className="text-gray-600">Mengupload file...</span>
                        </>
                      ) : (
                        <>
                          <Upload className="h-5 w-5 text-gray-400" />
                          <span className="text-gray-600">Pilih File atau Klik di sini</span>
                        </>
                      )}
                    </label>
                  </div>

                  {/* Uploaded Files List */}
                  {watchedAttachments && watchedAttachments.length > 0 && (
                    <div className="space-y-2">
                      {watchedAttachments.map((file) => (
                        <div
                          key={file.id}
                          className="flex items-center justify-between p-3 bg-gray-50 border border-gray-200 rounded-lg"
                        >
                          <div className="flex items-center gap-3">
                            <File className="h-5 w-5 text-gray-400" />
                            <div>
                              <p className="text-sm font-medium text-gray-900">{file.name}</p>
                              <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                            </div>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-gray-400 hover:text-red-500"
                            onClick={() => handleRemoveFile(file.id, file.path)}
                            disabled={uploadingFiles}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}

                  <p className="text-xs text-gray-500">
                    Max 10 files • Max 5MB each • PDF, DOC, DOCX, XLS, XLSX, JPG, PNG
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 justify-end pt-6 border-t">
                <Button type="button" variant="outline" onClick={() => router.back()}>
                  Batal
                </Button>
                <Button type="submit" disabled={updateMutation.isPending}>
                  <Save className="mr-2 h-4 w-4" />
                  {updateMutation.isPending ? "Menyimpan..." : "Simpan Perubahan"}
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
