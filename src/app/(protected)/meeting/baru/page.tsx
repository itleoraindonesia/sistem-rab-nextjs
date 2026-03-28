"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Save, Upload, X, Loader2, File } from "lucide-react"
import { Card, CardContent } from "@/components/ui"
import Button from "@/components/ui/Button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { TagsInput } from "@/components/ui/TagsInput"

// Hook Form & Zod
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { meetingSchema, type MeetingFormData, type MeetingAttachmentData } from "@/lib/meeting/schemas"

// React Query & Custom Hooks
import { useToast } from "@/components/ui/use-toast"
import { useCreateMeeting, useMeetingNumberPreview } from "@/hooks/useMeetings"

// File Upload Utilities
import {
  uploadMeetingFile,
  deleteMeetingFile,
  validateMeetingFile,
  formatFileSize,
  moveMeetingFiles
} from "@/lib/supabase/meeting-storage"

export default function CreateMeetingPage() {
  const router = useRouter()
  const { toast } = useToast()

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

  const createMutation = useCreateMeeting()

  // Fetch Next Meeting Number Preview
  const { data: generatedNumber } = useMeetingNumberPreview()

  // File upload state
  const [uploadingFiles, setUploadingFiles] = React.useState(false)
  const [tempMeetingId] = React.useState(() => `temp-${Date.now()}`)
  const watchedAttachments = form.watch("attachments")

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

        // Upload to Supabase Storage
        const uploadedFile = await uploadMeetingFile(file, tempMeetingId)

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
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: 'Gagal menghapus file'
      })
    }
  }

  // Submit Handler
  const onSubmit = form.handleSubmit(async (data) => {
    try {
      // First create the meeting
      const meeting = await createMutation.mutateAsync(data)

      // Move/rename uploaded files from temp to actual meeting number
      const currentAttachments = watchedAttachments || []
      if (currentAttachments.length > 0) {
        const hasTempFiles = currentAttachments.some(file =>
          file.path?.includes(`temp-${tempMeetingId.substring(0, 8)}_`)
        )

        if (hasTempFiles && meeting.meeting_number) {
          const movedFiles = await moveMeetingFiles(
            currentAttachments.map(f => ({
              path: f.path,
              name: f.name,
              size: f.size,
              type: f.type
            })),
            tempMeetingId,
            meeting.id,
            meeting.meeting_number
          )

          // Update meeting with final attachment paths
          // This requires updating the meeting record
          // For now, the attachments are already saved during creation
          // But we might want to update the paths
          console.log('Files moved successfully:', movedFiles)
        }
      }

      toast({ title: "Success", description: "Meeting berhasil dibuat" })
      router.push("/meeting")
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Gagal membuat meeting"
      })
    }
  })

  return (
    <div className="w-full mx-auto">
      <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold text-brand-primary">Buat Meeting Baru</h1>
              <p className="text-gray-600">Jadwalkan meeting baru dan undang peserta</p>
            </div>
          </div>

          {/* Form */}
          <Card>
            <CardContent className="p-6">
              <form onSubmit={onSubmit} className="space-y-8">
                {/* Section 1: Informasi Utama */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 border-b pb-2">
                    <div className="w-8 h-8 rounded-full bg-brand-primary text-white flex items-center justify-center font-bold text-sm">
                      1
                    </div>
                    <h3 className="text-lg font-semibold">Informasi Meeting</h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="col-span-1 md:col-span-2">
                      <Label htmlFor="meeting_number">Meeting Number (Auto-generated)</Label>
                      <Input
                        id="meeting_number"
                        value={generatedNumber || 'Loading...'}
                        disabled
                        className="bg-gray-100 cursor-not-allowed mt-1 font-mono"
                      />
                    </div>

                    <div className="col-span-1 md:col-span-2">
                      <Label htmlFor="title">Judul Meeting *</Label>
                      <Input
                        id="title"
                        placeholder="Contoh: Rapat Koordinasi Proyek Q1"
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

                    <div>
                      <Label htmlFor="meeting_date">Tanggal *</Label>
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
                      <Label htmlFor="meeting_time">Waktu *</Label>
                      <Input
                        id="meeting_time"
                        type="time"
                        {...form.register("meeting_time")}
                      />
                      {form.formState.errors.meeting_time && (
                        <p className="text-sm text-red-500 mt-1">{form.formState.errors.meeting_time.message}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Section 2: Peserta */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 border-b pb-2">
                    <div className="w-8 h-8 rounded-full bg-brand-primary text-white flex items-center justify-center font-bold text-sm">
                      2
                    </div>
                    <h3 className="text-lg font-semibold">Peserta</h3>
                  </div>
                        
                  <div>
                    <Label htmlFor="participants">Daftar Peserta *</Label>
                    <div className="mt-1">
                      <TagsInput
                        value={form.watch("participants")}
                        onChange={(value) => form.setValue("participants", value)}
                        placeholder="Ketik email/nama lalu tekan Enter..."
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Masukkan nama atau email peserta yang akan diundang.
                    </p>
                    {form.formState.errors.participants && (
                      <p className="text-sm text-red-500 mt-1">{form.formState.errors.participants.message}</p>
                    )}
                  </div>
                </div>

                {/* Section 3: Deskripsi */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 border-b pb-2">
                    <div className="w-8 h-8 rounded-full bg-brand-primary text-white flex items-center justify-center font-bold text-sm">
                      3
                    </div>
                    <h3 className="text-lg font-semibold">Deskripsi / Agenda</h3>
                  </div>
                  <div>
                    <Label htmlFor="description">Deskripsi Meeting *</Label>
                    <Textarea
                      id="description"
                      placeholder="Jelaskan tujuan dan agenda meeting..."
                      className="min-h-[150px] mt-1"
                      {...form.register("description")}
                    />
                    {form.formState.errors.description && (
                      <p className="text-sm text-red-500 mt-1">{form.formState.errors.description.message}</p>
                    )}
                  </div>
                </div>

                {/* Section 4: Lampiran File */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 border-b pb-2">
                    <div className="w-8 h-8 rounded-full bg-brand-primary text-white flex items-center justify-center font-bold text-sm">
                      4
                    </div>
                    <h3 className="text-lg font-semibold">Lampiran File (Opsional)</h3>
                  </div>

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
                <div className="flex gap-4 justify-end">
                  <Button type="button" variant="outline" onClick={() => router.back()}>
                    Batal
                  </Button>
                  <Button type="submit" disabled={createMutation.isPending}>
                    <Save className="mr-2 h-4 w-4" />
                    {createMutation.isPending ? "Menyimpan..." : "Buat Jadwal Meeting"}
                  </Button>
                </div>

              </form>
            </CardContent>
          </Card>
        </div>
    </div>
  )
}
