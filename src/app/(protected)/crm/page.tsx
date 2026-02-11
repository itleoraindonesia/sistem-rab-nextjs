import { redirect } from 'next/navigation';
import { supabase } from "@/lib/supabase/client";

export default function CRMPage() {
  redirect('/crm/dashboard');
}
