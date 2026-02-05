"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Save } from "lucide-react"
import { Card, CardContent } from "@/components/ui"
import Button from "@/components/ui/Button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { TagsInput } from "@/components/ui/TagsInput"

// Hook Form & Zod
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { meetingSchema, type MeetingFormData } from "@/lib/meeting/schemas"

// React Query & Custom Hooks
import { useToast } from "@/components/ui/use-toast"
import { useCreateMeeting, useMeetingNumberPreview } from "@/hooks/useMeetings"

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

  // Helper untuk generate nomor surat dinamis (Mock/Fallback)
  const getRomanMonth = (date: Date) => {
    const months = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII"];
    return months[date.getMonth()];
  }
  const today = new Date();
  const fallbackNumber = `[AUTO]/MOM/${getRomanMonth(today)}/${today.getFullYear()}`;

  // Fetch Next Meeting Number Preview
  const { data: generatedNumber } = useMeetingNumberPreview()

  
  // Submit Handler
  const onSubmit = form.handleSubmit((data) => {
    createMutation.mutate(data, {
      onSuccess: () => {
        toast({ title: "Success", description: "Meeting berhasil dibuat" })
        router.push("/meeting")
      },
      onError: () => {
        toast({ variant: "destructive", title: "Error", description: "Gagal membuat meeting" })
      }
    })
  })

  return (
    <div className="w-full mx-auto md:p-6">
      <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center gap-4 mb-4">
            <Button variant="ghost" size="icon" onClick={() => router.back()}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
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
                        value={generatedNumber || fallbackNumber}
                        disabled
                        className="bg-gray-100 cursor-not-allowed mt-1"
                      />
                      <p className="text-xs text-gray-400 mt-1">*Nomor ini adalah preview, nomor asli akan digenerate saat disimpan</p>
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
