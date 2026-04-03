import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('\nERROR: Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey);
const BUCKET = 'learning_materials';

// Mapping folder names to image thumbnails from learningeffortlessenglish.com
const COURSE_IMAGES = {
  'Flow English Course': 'https://learningeffortlessenglish.com/upload/product/img_v3_02s5_4ad30610-58ac-482d-9e22-0a2d2206bfhu-1763477332.jpeg',
  'Pimsleur English For Vietnamese Speakers': 'https://learningeffortlessenglish.com/upload/product/img_v3_02s5_47c35575-d577-4959-8d23-7b4b9c6adahu-1763478097.jpeg',
  '7 Rules For Excellent English Speaking': 'https://learningeffortlessenglish.com/upload/product/img_v3_02s5_5ef2522c-8beb-45dd-bb8a-79f6fec7dfhu-1763477953.jpeg',
  'Effortless English Foundation': 'https://learningeffortlessenglish.com/upload/product/img_v3_02s5_bf5acdd2-85af-42de-b11a-7d5e8a4ec9hu-1763477687.jpeg',
  'Power English': 'https://learningeffortlessenglish.com/upload/product/img_v3_02s5_5ef2522c-8beb-45dd-bb8a-79f6fec7dfhu-1763477953.jpeg'
};

async function sync() {
  console.log('\n===== STARTING SYNC (Storage -> DB) =====\n');

  const { data: rootItems, error: rootError } = await supabase.storage.from(BUCKET).list('');
  if (rootError) {
    console.error('Error listing storage:', rootError.message);
    return;
  }

  for (const item of rootItems) {
    if (item.name === '.emptyFolderPlaceholder') continue;
    
    console.log(`[COURSE] ${item.name}`);

    const thumbnail = COURSE_IMAGES[item.name] || '';

    const { data: existingCourse } = await supabase.from('courses').select('id').eq('title', item.name).maybeSingle();
    let courseId;

    if (existingCourse) {
      courseId = existingCourse.id;
      // Ensure existing course is also updated with thumbnail if it is missing
      await supabase.from('courses').update({ thumbnail_url: thumbnail }).eq('id', courseId);
    } else {
      const { data: newCourse, error: insertError } = await supabase
        .from('courses')
        .insert({ title: item.name, thumbnail_url: thumbnail })
        .select()
        .single();
      if (insertError) {
        console.error(`  x Failed to create course ${item.name}:`, insertError.message);
        continue;
      }
      courseId = newCourse.id;
    }

    const { data: sectionItems, error: sectionError } = await supabase.storage.from(BUCKET).list(item.name);
    if (sectionError) continue;

    let sIdx = 1;
    for (const sItem of sectionItems) {
      if (sItem.name === '.emptyFolderPlaceholder') continue;
      
      console.log(`  |- [SEC] ${sItem.name}`);

      const { data: existingSection } = await supabase.from('sections')
        .select('id')
        .eq('course_id', courseId)
        .eq('title', sItem.name)
        .maybeSingle();
      
      let sectionId;
      if (existingSection) {
        sectionId = existingSection.id;
      } else {
        const { data: newSection } = await supabase
          .from('sections')
          .insert({ course_id: courseId, title: sItem.name, order: sIdx++ })
          .select()
          .single();
        if (!newSection) continue;
        sectionId = newSection.id;
      }

      const sectionPath = `${item.name}/${sItem.name}`;
      const { data: lessonItems } = await supabase.storage.from(BUCKET).list(sectionPath);
      if (!lessonItems) continue;

      let lIdx = 1;
      for (const lItem of lessonItems) {
        if (lItem.name === '.emptyFolderPlaceholder') continue;
        
        // Types logic
        let lType = 'listen'; 
        const lower = lItem.name.toLowerCase();
        if (lower.includes('vocab')) lType = 'vocab';
        else if (lower.includes('slow')) lType = 'slow';
        else if (lower.includes('quiz')) lType = 'quiz';
        else if (lower.endsWith('.pdf') || lower.endsWith('.txt')) lType = 'read';

        const contentUrl = `${supabaseUrl}/storage/v1/object/public/${BUCKET}/${sectionPath}/${lItem.name}`;
        const lTitle = lItem.name.replace(/\.[^/.]+$/, ""); 

        const { data: exLesson } = await supabase.from('lessons')
          .select('id')
          .eq('section_id', sectionId)
          .eq('title', lTitle)
          .maybeSingle();

        if (exLesson) {
          await supabase.from('lessons').update({ content_url: contentUrl, lesson_type: lType, order: lIdx++ }).eq('id', exLesson.id);
        } else {
          await supabase.from('lessons').insert({
            section_id: sectionId,
            title: lTitle,
            content_url: contentUrl,
            lesson_type: lType,
            order: lIdx++
          });
        }
      }
    }
  }

  console.log('\n===== SYNC COMPLETED SUCCESSFULLY =====\n');
}

sync().catch(console.error);
