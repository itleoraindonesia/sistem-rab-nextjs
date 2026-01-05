import { z } from "zod";

export const rabSchema = z
  .object({
    no_ref: z.string().min(1, "No referensi wajib diisi"),

    project_name: z
      .string()
      .min(1, "Nama proyek wajib diisi")
      .max(100, "Nama proyek maksimal 100 karakter"),

    location: z.string().min(1, "Lokasi wajib dipilih"),

    bidang: z
      .array(
        z.object({
          panjang: z
            .number({
              message: "Panjang harus berupa angka",
            })
            .optional(),

          lebar: z
            .number({
              message: "Lebar harus berupa angka",
            })
            .optional(),
        })
      )
      .optional(),

    perimeter: z
      .number({
        message: "Perimeter harus berupa angka",
      })
      .optional(),

    tinggi_lantai: z
      .number({
        message: "Tinggi lantai harus berupa angka",
      })
      .optional(),

    panel_dinding_id: z.string().optional(),

    panel_lantai_id: z.string().optional(),

    hitung_dinding: z.boolean().default(false),

    hitung_lantai: z.boolean().default(false),

    status: z.enum(["draft", "sent", "approved"]),
  })
  // Validasi: minimal salah satu checkbox perhitungan harus dipilih
  .refine((data) => data.hitung_dinding || data.hitung_lantai, {
    message: "Pilih minimal satu jenis perhitungan (dinding atau lantai)",
    path: ["hitung_dinding"],
  });

export const bidangSchema = z.object({
  panjang: z
    .number()
    .min(0.1, "Panjang minimal 0.1m")
    .max(100, "Panjang maksimal 100m"),
  lebar: z
    .number()
    .min(0.1, "Lebar minimal 0.1m")
    .max(100, "Lebar maksimal 100m"),
});

// Type inference
export type RABFormData = z.infer<typeof rabSchema>;
export type BidangData = z.infer<typeof bidangSchema>;

// Status enum
export const RABStatus = {
  DRAFT: 'draft',
  SENT: 'sent',
  APPROVED: 'approved',
} as const;

export type RABStatusType = typeof RABStatus[keyof typeof RABStatus];

// RAB Document type
export interface RABDocument {
  id: number;
  no_ref: string;
  project_name: string;
  location: string;
  status: RABStatusType;
  created_at: string;
  updated_at?: string;
  description?: string;
  form_data?: RABFormData;
  total_cost?: number;
}

/**
 * @typedef {Object} RABFormData
 * @property {string} no_ref
 * @property {string} project_name
 * @property {string} location
 * @property {Array<{panjang: number, lebar: number}>} bidang
 * @property {number} [perimeter]
 * @property {number} [tinggi_lantai]
 * @property {string} [panel_dinding_id]
 * @property {string} [panel_lantai_id]
 * @property {boolean} hitung_dinding
 * @property {boolean} hitung_lantai
 * @property {'draft'|'sent'|'approved'} status
 */

/**
 * @typedef {Object} BidangData
 * @property {number} panjang
 * @property {number} lebar
 */
