"use client"

import * as React from "react"
import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useToast } from "@/components/ui/use-toast"
import { useRouter } from "next/navigation"
import { meetingSchema, type MeetingFormData } from "@/lib/meeting/schemas"
import { useMeeting, useUpdateMeeting } from "@/hooks/useMeetings"
import Button from "@/components/ui/Button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import Card from "@/components/ui/Card"
import { CardContent, CardHeader, CardTitle } from "@/components/ui/Card"
import { TagsInput } from "@/components/ui/TagsInput"
import LoadingState from "@/components/form/LoadingState"

interface EditMeetingFormProps {
  meetingId: string
}

export function EditMeetingForm({ meetingId }: EditMeetingFormProps) {
  const router = useRouter()
  const { toast } = useToast()

  // Fetch existing meeting data
  const { data: meeting, isLoading, error } = useMeeting(meetingId)

  // Update mutation
  const updateMutation = useUpdateMeeting(meetingId)

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

  // Pre-fill form when data is loaded
  useEffect(() => {
    if (meeting) {
      const meetingDate = new Date(meeting.meeting_date)
      form.reset({
        title: meeting.title || "",
        meeting_type: meeting.meeting_type || "internal",
        meeting_date: meetingDate.toISOString().split('T')[0],
        meeting_time: meetingDate.toTimeString().slice(0, 5),
        location: meeting.location || "",
        description: meeting.description || "",
        participants: Array.isArray(meeting.participants) ? meeting.participants : []
      })
    }
  }, [meeting, form])

  const onSubmit = form.handleSubmit((data) => {
    updateMutation.mutate(data, {
      onSuccess: () => {
        toast({
          title: "Success",
          description: "Meeting berhasil diupdate"
        })
        router.push(`/meeting/${meetingId}`)
      },
      onError: () => {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Gagal mengupdate meeting"
        })
      }
    })
  })

  if (isLoading) {
    return <LoadingState />
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-red-500">Error loading meeting: {(error as Error).message}</div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Edit Meeting</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-6">
          {/* Basic Info Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold border-b pb-2">Informasi Meeting</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Judul Meeting *</Label>
                <Input
                  id="title"
                  {...form.register("title")}
                  placeholder="Contoh: Rapat Koordinasi Proyek Q1..."
                />
                {form.formState.errors.title && (
                  <p className="text-sm text-red-500">{form.formState.errors.title.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="meeting_type">Tipe Meeting *</Label>
                <select
                  id="meeting_type"
                  {...form.register("meeting_type")}
                  className="w-full border rounded-md p-2 h-10"
                >
                  <option value="internal">Internal</option>
                  <option value="external">External</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="meeting_date">Tanggal Meeting *</Label>
                <Input
                  id="meeting_date"
                  type="date"
                  {...form.register("meeting_date")}
                />
                {form.formState.errors.meeting_date && (
                  <p className="text-sm text-red-500">{form.formState.errors.meeting_date.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="meeting_time">Waktu Meeting *</Label>
                <Input
                  id="meeting_time"
                  type="time"
                  {...form.register("meeting_time")}
                />
                {form.formState.errors.meeting_time && (
                  <p className="text-sm text-red-500">{form.formState.errors.meeting_time.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="location">Lokasi / Link *</Label>
                <Input
                  id="location"
                  {...form.register("location")}
                  placeholder="Ruang Meeting A atau Link Zoom"
                />
                {form.formState.errors.location && (
                  <p className="text-sm text-red-500">{form.formState.errors.location.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Participants Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold border-b pb-2">Peserta Meeting</h3>

            <div className="space-y-2">
              <Label htmlFor="participants">Tambah Peserta *</Label>
              <TagsInput
                value={form.watch("participants")}
                onChange={(value) => form.setValue("participants", value)}
                placeholder="Tambah peserta... (tekan Enter)"
              />
              {form.formState.errors.participants && (
                <p className="text-sm text-red-500">{form.formState.errors.participants.message}</p>
              )}
            </div>
          </div>

          {/* Description Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold border-b pb-2">Deskripsi Meeting</h3>

            <div className="space-y-2">
              <Label htmlFor="description">Deskripsi Meeting *</Label>
              <Textarea
                id="description"
                {...form.register("description")}
                placeholder="Jelaskan tujuan dan agenda meeting..."
                className="min-h-[120px]"
              />
              {form.formState.errors.description && (
                <p className="text-sm text-red-500">{form.formState.errors.description.message}</p>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 justify-end pt-6 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
            >
              Batal
            </Button>
            <Button
              type="submit"
              isLoading={updateMutation.isPending}
              loadingText="Menyimpan..."
            >
              Update Meeting
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
