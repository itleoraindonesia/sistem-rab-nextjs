import { z } from 'zod'

// Attachment schema for file uploads
export const meetingAttachmentSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  size: z.number(),
  type: z.string(),
  url: z.string().url(),
  path: z.string()
})

export type MeetingAttachmentData = z.infer<typeof meetingAttachmentSchema>

export const meetingSchema = z.object({
  title: z.string().min(1, 'Judul wajib diisi'),
  meeting_type: z.enum(['internal', 'external']),
  meeting_date: z.string().min(1, 'Tanggal wajib diisi'),
  meeting_time: z.string().min(1, 'Waktu wajib diisi'),
  location: z.string().min(1, 'Lokasi wajib diisi'),
  description: z.string().min(1, 'Deskripsi wajib diisi'),
  participants: z.array(z.string()).min(1, 'Minimal 1 peserta'),
  attachments: z.array(meetingAttachmentSchema).optional()
}).refine(
  (data) => !data.attachments || data.attachments.length <= 10,
  {
    message: 'Maksimal 10 file lampiran',
    path: ['attachments']
  }
)

export type MeetingFormData = z.infer<typeof meetingSchema>
