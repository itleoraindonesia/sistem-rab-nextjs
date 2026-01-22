import { z } from 'zod'

export const meetingSchema = z.object({
  title: z.string().min(1, 'Judul wajib diisi'),
  meeting_type: z.enum(['internal', 'external']),
  meeting_date: z.string().min(1, 'Tanggal wajib diisi'),
  meeting_time: z.string().min(1, 'Waktu wajib diisi'),
  location: z.string().min(1, 'Lokasi wajib diisi'),
  description: z.string().min(1, 'Deskripsi wajib diisi'),
  participants: z.array(z.string()).min(1, 'Minimal 1 peserta')
})

export type MeetingFormData = z.infer<typeof meetingSchema>
