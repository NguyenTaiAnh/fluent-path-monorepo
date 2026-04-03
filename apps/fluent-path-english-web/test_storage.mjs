import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
if (!supabaseUrl || !supabaseKey) { 
  console.error('Missing env vars'); 
  process.exit(1); 
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
  const { data, error } = await supabase.storage.from('learning_materials').list('', { limit: 10 });
  if (error) {
    console.error('Error listing root:', error);
    return;
  }
  console.log('Folders:', data?.map(d => d.name));

  if (data && data.length > 0) {
    for (const folder of data) {
      if (folder.name !== '.emptyFolderPlaceholder') {
        const { data: subData } = await supabase.storage.from('learning_materials').list(folder.name, { limit: 5 });
        console.log(`Subfolders in ${folder.name}:`, subData?.map(d => d.name));
        break; // just check the first one
      }
    }
  }
}
check();
