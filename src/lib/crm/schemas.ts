import { z } from 'zod';
import { VALID_KEBUTUHAN, VALID_PRODUCTS } from './validators';

// Helper validator for WhatsApp (basic check)
const whatsappRegex = /^[0-9+]{8,15}$/;

// Schema for Client Data
export const clientSchema = z.object({
  nama: z.string().min(1, 'Nama wajib diisi'),
  
  whatsapp: z.string()
    .min(1, 'WhatsApp wajib diisi')
    .regex(whatsappRegex, 'Format WhatsApp tidak valid (contoh: 081234...)')
    .transform(val => val.replace(/\D/g, '')), // Auto-strip non-digits

  instagram_username: z.string().optional().or(z.literal('')),
  
  kabupaten: z.string().min(1, 'Kabupaten wajib diisi'),
  
  provinsi: z.string().optional(),

  kebutuhan: z.string()
    .refine((val) => VALID_KEBUTUHAN.includes(val as any), {
      message: 'Kebutuhan tidak valid',
    }),
    
  produk: z.string()
    .optional()
    .or(z.literal(''))
    .refine((val) => !val || VALID_PRODUCTS.includes(val as any), {
      message: 'Produk tidak valid',
    }),

  luasan: z.coerce.number()
    .min(0, 'Luasan tidak boleh negatif')
    .default(0),

  status: z.enum([
    'IG_Lead',
    'WA_Negotiation',
    'Quotation_Sent',
    'Follow_Up',
    'Invoice_Deal',
    'WIP',
    'Finish',
    'Cancelled',
    'New Lead', // Backward compatibility / Fallback
    'Lost',     // Backward compatibility / Fallback
    'Won'       // Backward compatibility / Fallback
  ]).optional().default('IG_Lead'),
});

export type clientFormValues = z.infer<typeof clientSchema>;
