
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://phfuwunwgzkfzettekkh.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBoZnV3dW53Z3prZnpldHRla2toIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2Njk3ODI2OSwiZXhwIjoyMDgyNTU0MjY5fQ.GJwVosKjQ1IuLcVb5hZVfwS0tc0l4J6QbRGG9s2UlBE';

const supabase = createClient(supabaseUrl, supabaseKey);

const tablesToCheck = [
  'document_workflow_configs',
  'document_workflow_stages',
  'letter_workflow_trackings',
  'letter_histories'
];

async function checkTables() {
  console.log('Checking tables status in Supabase...');
  
  for (const table of tablesToCheck) {
    try {
      const { count, error } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true });
      
      if (error) {
        if (error.message && error.message.includes('does not exist')) {
             console.log(`[OLD/MISSING] ${table}: Table NOT FOUND (Clean)`);
        } else {
             console.log(`[ERROR] ${table}: ${error.message} (Code: ${error.code})`);
        }
      } else {
        console.log(`[EXISTS] ${table}: ${count} rows`);
      }
    } catch (e) {
      console.log(`[EXCEPTION] ${table}:`, e.message);
    }
  }
}

checkTables();
