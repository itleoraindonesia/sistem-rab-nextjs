import { createClient } from "@supabase/supabase-js";

// Lazy initialization to avoid build-time errors
let supabaseClient: ReturnType<typeof createClient> | null = null;
let supabaseAdminClient: ReturnType<typeof createClient> | null = null;

// Client-side Supabase client (safe for browser)
export const supabase = (() => {
  if (!supabaseClient) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY;

    // Only create client if environment variables are available
    if (supabaseUrl && supabaseAnonKey) {
      supabaseClient = createClient(supabaseUrl, supabaseAnonKey);
    }
  }
  return supabaseClient;
})();

// Server-side Supabase client (for API routes)
export const supabaseAdmin = (() => {
  if (!supabaseAdminClient) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.NEXT_SUPABASE_SERVICE_ROLE_KEY;

    // Only create client if environment variables are available
    if (supabaseUrl && supabaseServiceKey && supabaseServiceKey !== 'your_actual_service_role_key_here') {
      supabaseAdminClient = createClient(supabaseUrl, supabaseServiceKey, {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      });
    }
  }
  return supabaseAdminClient;
})();

// Type definitions for our data
export interface Panel {
  id: number;
  name: string;
  harga: number;
  luas_per_lembar: number;
  type: string;
  created_at: string;
  updated_at: string;
}

export interface Ongkir {
  id: number;
  provinsi: string;
  biaya: number;
  created_at: string;
  updated_at: string;
}

export interface RABDocument {
  id: number;
  no_ref: string;
  project_name: string;
  location: string;
  status: "draft" | "sent" | "approved";
  form_data: any;
  total_cost: number;
  created_at: string;
  updated_at: string;
}
