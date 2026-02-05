"use client"

import * as React from "react"
import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useToast } from "@/components/ui/use-toast"
import { useRouter } from "next/navigation"
import { meetingSchema, type MeetingFormData } from "@/lib/meeting/schemas"
import { useCreateMeeting } from "@/hooks/useMeetings"
import { supabase } from "@/lib/supabase/client"
import Button from "@/components/ui/Button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import Card from "@/components/ui/Card"
import { CardContent, CardHeader, CardTitle } from "@/components/ui/Card"
import { TagsInput } from "@/components/ui/TagsInput"

export function MeetingForm() {
  const router = useRouter()
  const { toast } = useToast()
  const [userId, setUserId] = useState<string>("")

  useEffect(() => {
    const getAuthUser = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) {
        setUserId(session.user.id)
      }
    }

    getAuthUser()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUserId(session.user.id)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

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

  const onSubmit = form.handleSubmit((data) => {
    if (!userId) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "User tidak terautentikasi"
      })
      return
    }
    
    createMutation.mutate(data, {
      onSuccess: () => {
        toast({
          title: "Success",
          description: "Meeting berhasil dibuat"
        })
        router.push("/meeting")
      },
      onError: () => {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Gagal membuat meeting"
        })
      }
    })
  })

  return (
    <Card>
      <CardHeader>
        <CardTitle>Form Meeting</CardTitle>
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
              disabled={createMutation.isPending}
            >
              {createMutation.isPending ? "Menyimpan..." : "Buat Jadwal Meeting"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
