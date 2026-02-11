import { z } from 'zod'

/**
 * Zod Schema untuk Signature (Tanda Tangan)
 */
export const signatureSchema = z.object({
  id: z.string(),
  name: z.string()
    .min(1, 'Nama penandatangan wajib diisi')
    .min(3, 'Nama minimal 3 karakter')
    .max(100, 'Nama maksimal 100 karakter'),
  position: z.string()
    .min(1, 'Jabatan wajib diisi')
    .min(3, 'Jabatan minimal 3 karakter')
    .max(100, 'Jabatan maksimal 100 karakter'),
  order: z.number().int().positive(),
  pihak: z.string()
    .max(50, 'Pihak maksimal 50 karakter')
    .optional(),
})

/**
 * Zod Schema untuk Attachment (Lampiran)
 */
export const attachmentSchema = z.object({
  id: z.string(),
  name: z.string().min(1, 'Nama file wajib diisi'),
  size: z.number(), // size in bytes
  type: z.string().optional(), // MIME type
  url: z.string().url().optional(), // Public URL
  path: z.string().optional(), // Storage path for deletion
})

/**
 * Zod Schema untuk Form Surat Keluar
 */
export const outgoingLetterSchema = z.object({
  // Section 1: Identitas Surat
  document_type_id: z.number().positive('Kategori surat wajib dipilih').refine(val => val > 0, 'Kategori surat wajib dipilih'),

  company_id: z.string().uuid('Format instansi tidak valid').refine(val => val.length > 0, 'Instansi wajib dipilih'),
  
  letter_date: z.string()
    .min(1, 'Tanggal surat wajib diisi')
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Format tanggal tidak valid (YYYY-MM-DD)'),

  // Section 2: Konten Surat
  subject: z.string()
    .min(1, 'Perihal wajib diisi')
    .min(3, 'Perihal minimal 3 karakter')
    .max(200, 'Perihal maksimal 200 karakter')
    .refine(
      (val) => {
        const wordCount = val.trim().split(/\s+/).filter(word => word.length > 0).length
        return wordCount >= 1 && wordCount <= 4
      },
      'Perihal harus 1-4 kata'
    ),
  
  opening: z.string()
    .min(1, 'Pembuka surat wajib diisi')
    .min(5, 'Pembuka minimal 5 karakter')
    .max(500, 'Pembuka maksimal 500 karakter'),
  
  body: z.string()
    .min(1, 'Isi surat wajib diisi')
    .min(10, 'Isi surat minimal 10 karakter')
    .max(10000, 'Isi surat maksimal 10,000 karakter'),
  
  closing: z.string()
    .min(1, 'Penutup surat wajib diisi')
    .min(5, 'Penutup minimal 5 karakter')
    .max(500, 'Penutup maksimal 500 karakter'),

  // Section 3: Pengirim
  sender_id: z.string().uuid('Format pengirim tidak valid').refine(val => val.length > 0, 'Pengirim wajib dipilih'),
  
  sender_name: z.string().optional(),
  sender_email: z.string().email().optional(),
  sender_department: z.string().optional(),

  // Section 4: Penerima
  recipient_company: z.string()
    .min(1, 'Nama instansi penerima wajib diisi')
    .min(3, 'Nama instansi minimal 3 karakter')
    .max(200, 'Nama instansi maksimal 200 karakter'),
  
  recipient_name: z.string()
    .min(1, 'Nama penerima wajib diisi')
    .min(3, 'Nama penerima minimal 3 karakter')
    .max(100, 'Nama penerima maksimal 100 karakter'),
  
  recipient_whatsapp: z.string()
    .min(1, 'Nomor WhatsApp wajib diisi')
    .regex(/^(\+62|62|0)[0-9]{9,13}$/, 'Format nomor WhatsApp tidak valid')
    .refine((val) => {
      const normalized = val.replace(/^(\+62|62)/, '0')
      return normalized.length >= 10 && normalized.length <= 14
    }, 'Nomor WhatsApp harus 10-14 digit'),
  
  recipient_email: z.union([
    z.string().email('Format email tidak valid'),
    z.literal(''),
  ]).optional(),
  
  recipient_address: z.string()
    .min(1, 'Alamat penerima wajib diisi')
    .min(10, 'Alamat minimal 10 karakter')
    .max(500, 'Alamat maksimal 500 karakter'),

  // Section 5: Lampiran & Tanda Tangan
  has_attachments: z.boolean().default(false),
  
  attachments: z.array(attachmentSchema).nullable().default(null)
    .refine(
      (attachments) => {
        if (!attachments) return true
        return attachments.length <= 10
      },
      'Maksimal 10 file lampiran'
    ),
  
  signatories: z.array(signatureSchema)
    .min(1, 'Minimal 1 tanda tangan diperlukan')
    .max(5, 'Maksimal 5 tanda tangan')
    .refine(
      (sigs) => sigs.every(sig => sig.name.trim() && sig.position.trim()),
      'Semua kolom tanda tangan harus diisi lengkap (nama dan jabatan)'
    )
    .refine(
      (sigs) => {
        const names = sigs.map(s => s.name.toLowerCase().trim())
        return names.length === new Set(names).size
      },
      'Nama penandatangan tidak boleh sama'
    ),
})

/**
 * Type inference dari schema
 */
export type OutgoingLetterFormData = z.infer<typeof outgoingLetterSchema>
export type SignatureData = z.infer<typeof signatureSchema>
export type AttachmentData = z.infer<typeof attachmentSchema>
