import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.NEXT_SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('Missing env vars');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: { persistSession: false },
});

async function main() {
  // Try to find the latest letter_histories for pending review
  const { data: pending, error: pendingErr } = await supabase
    .from('letter_histories')
    .select('*')
    .eq('stage_type', 'REVIEW')
    .is('to_status', null)
    .order('created_at', { ascending: false })
    .limit(1);

  if (pendingErr) {
    console.error('Pending err:', pendingErr);
    return;
  }

  console.log('Latest pending:', pending);

  if (!pending?.length) {
    console.log('No pending reviews to test.');
    return;
  }

  const p = pending[0];
  console.log('Testing review_letter on letter:', p.letter_id, 'with user:', p.assigned_to_id);

  const { data, error } = await supabase.rpc('review_letter', {
    p_action: 'REQUEST_REVISION',
    p_letter_id: p.letter_id,
    p_user_id: p.assigned_to_id,
    p_notes: 'Test notes via node script'
  });

  console.log('RPC Data:', data);
  console.log('RPC Error:', JSON.stringify(error, null, 2), error);
}

main().catch(console.error);
