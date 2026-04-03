import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
if (!supabaseUrl || !supabaseKey) { 
  console.error('Missing env vars'); 
  process.exit(1); 
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
  const { data, error } = await supabase.from('courses').select('id, title').limit(5);
  if (error) {
    console.error('Error fetching courses:', error.message);
    return;
  }
  console.log('Courses in DB:', data);
}
check();
