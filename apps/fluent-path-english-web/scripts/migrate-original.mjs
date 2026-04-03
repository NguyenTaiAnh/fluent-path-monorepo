import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const userCookie = '__utma=102262044.115041005.1774251416.1774251416.1774251416.1; __utmz=102262044.1774251416.1.1.utmcsr=(direct)|utmccn=(direct)|utmcmd=(none); _gcl_au=1.1.2091509730.1774251416; _tt_enable_cookie=1; _ttp=01KMCT06CWGTH4NRT71GJ2FYV5_.tt.1; _fbp=fb.1.1774251415974.29510366263659611; _ga=GA1.1.769331670.1774251416; __utmc=102262044; promotion_calling_20260318=1774256452; _ZB_STATIC_576872_DR_MF_lastTime=1774257833451; __utmt=1; __utmb=102262044.56.10.1774251416; _ga_JTE43400EH=GS2.1.s1774251416$o1$g1$t1774259011$j41$l0$h0; ttcsid=1774251415966::6XLmuBdezDr4VRcr0z5H.1.1774259122501.0; ttcsid_CHE4T1BC77U829NKIENG=1774251415966::JktkwSwcRyzits17g7Ao.1.1774259122501.1; XSRF-TOKEN=eyJpdiI6ImxZNUhcL3JBVCtOWnJ4S2xjVmk5amN3PT0iLCJ2YWx1ZSI6IldiejV2WXVWTWFiaDJuV2ZLM3p5T1VoOGJVTG9oUFZNZlZDcklZK05Dc1ZrVXo1bVV0RUxxUkdtTUZJM1lFWWlnVG5Sd05PVitydHE5cE1EVGlRVHlBPT0iLCJtYWMiOiIxN2YwNWFjYjVhZDk1ODNlNjg5YzViMGQyNDI2Nzk3ODkyYTY1ZmI3YmMzOTNhMWIwNzUxNzYzZTE3YmEwZTk1In0%3D; laravel_session=eyJpdiI6IjVEUGZrOWp4R2paXC9kd2hBZlQ3YkZBPT0iLCJ2YWx1ZSI6IlwvOCtlM0tsK29JQlpUYVBESkdRaWdHMFlNZGJJaGNyUnlWckdEXC9URm5DMUR0RnFaYW8rWDNZeWNUN0xDQTNcLzd5d09EZ2UzY0dLVGxjVHJoK2VWMFBnPT0iLCJtYWMiOiI2YjMwYzcxZjYwOGFiZDA1NWIzY2YwYTUxZDMxZjMzNzM5NTVjZmFjNjZmNWU4MWY4MzRkMDZmMGE2YTJmZWVkIn0%3D';

const LESSONS_IDS = [
  { "title": "Lesson 1", "id": "c8e1bc874a8749b7a315679914f75d53" },
  { "title": "Lesson 2: A Kiss", "id": "73b25e46a0b75f6b2ddad2627c099aa4" },
  { "title": "Lesson 3: Bubba's Food", "id": "ac11dafb5b1f77f69d2188340f4b67f7" },
  { "title": "Lesson 4: Changed", "id": "c4bde6a94fddb7eddb0fe5f11c49171e132" },
  { "title": "Lesson 5: Drag", "id": "c4bde6a94fddb7eddb0fe5f11c49171e139" },
  { "title": "Lesson 6: Intimacy", "id": "90d83bb61ffcdd45930315af3be6da0e" },
  { "title": "Lesson 7: Secret Love", "id": "b55cccb02b0efa7223a8be8f9b08ece7" },
  { "title": "Lesson 8: Greek family", "id": "e191f0a2d654fdc2e58ccd4f9cac1971" },
  { "title": "Lesson 9: Longtime affair", "id": "2bb0f0d2f32ec7b048baeac3535e7b7d" },
  { "title": "Lesson 10: Lost Custody", "id": "7342651230e7c95f361aceadbcf7fedf" },
  { "title": "Lesson 11: Meddling Mother-In-Law", "id": "bac0009513fd1808cb49ad4e172a76a4" },
  { "title": "Lesson 12: Nudist", "id": "00202e57c547ebe5e7ad9fff776c1dfa" },
  { "title": "Lesson 13: Obsessive behavior", "id": "e83e452f7be11126a9c42bf83c219f8b" },
  { "title": "Lesson 14: The race", "id": "ce2da60cafc05d70b8be8ba7c67396f7" },
  { "title": "Lesson 15: Bad choices", "id": "7a8fdb179ecd2b275562062cdc717c82" },
  { "title": "Lesson 16: Double standard", "id": "00394943d75ed39588498b4d70b4c6fc" },
  { "title": "Lesson 17: Cafe Puccini", "id": "9b39a4a07bc65cfc7ab49c55af08d54f" },
  { "title": "Lesson 18: Disobedience", "id": "46ebb5deb8fff867abd7fea5604fca79" },
  { "title": "Lesson 19: Emotional intel husbands", "id": "67382933fe51e2622c61024ff74816b1" },
  { "title": "Lesson 20: First Battle", "id": "6b07837585bfff8c2453e23d39648872" },
  { "title": "Lesson 21: Jack kerouac", "id": "bf7db502b7d559dbc75ddf741d447f3a" },
  { "title": "Lesson 22: Lifestyle Diseases", "id": "f15343bb8f349266eb046efbd088136d" },
  { "title": "Lesson 23: Media 1", "id": "dd5152164b07b8626edaeea4ba52e708" },
  { "title": "Lesson 24: Media 2", "id": "9f5f9fba54ed2ddc4b667f603b69e737" },
  { "title": "Lesson 25: Mind maps", "id": "608d2d231cf5a8ae3d97be025789ddb4" },
  { "title": "Lesson 26: Ms censorship", "id": "77d8cc2946235b46920f4d3090d0ece3" },
  { "title": "Lesson 27: Neo-bedouins", "id": "ed9a3e620112320fe828ce18d55825c6" },
  { "title": "Lesson 28: New year's resolutions", "id": "f8e0937781ba3838b0a709a43dd89121" },
  { "title": "Lesson 29: No belief", "id": "d592387feb94a3e904e41c8a2c00f3e4" }, { "title": "Lesson 30: Storytelling", "id": "608d2d231cf5a8ae3d97be025789ddb4" },
  { "title": "Lesson 31: Thriving on Chaos", "id": "bd2b77572d320e885af94982894c6364" },
  { "title": "Lesson 32: TPR Listen first", "id": "e9b9d62febcdd09c7b66ab2efbf7760c" },
  { "title": "Lesson 33: Universal Journey", "id": "8679b163c59ec04b2df61f23bac4dec6" },
  { "title": "Lesson 34: Validation", "id": "f6563bfd9b8c7abb16854a45967a98ab" },
  { "title": "Lesson 35: Vipassana", "id": "ea44be21ebc81c89b33863686c0f1535" },
  { "title": "Lesson 36: Worthy Goals", "id": "c4cdc7a0997f277bc62fa80c47f1eeca" },
  { "title": "Lesson 37: Hitch 1", "id": "f7461865b2598d4b115bf328c04de4ce" },
  { "title": "Lesson 38: Hitch 2", "id": "b7d5d462d1db170fdcb2b8e2a103aae3" },
  { "title": "Lesson 39: Hitch 3", "id": "631dfa09804d68b9913b4da3f3b2db38" }
];

const supabase = createClient(supabaseUrl, serviceKey);
const BUCKET = 'learning_materials';
const COURSE_NAME = 'Effortless English Original Course';
const COURSE_IMG = 'https://learningeffortlessenglish.com/upload/product/img_v3_02s5_bf5acdd2-85af-42de-b11a-7d5e8a4ec9hu-1763477687.jpeg';

async function uploadToStorage(url, path) {
  try {
    const res = await fetch(url, { headers: { 'Cookie': userCookie } });
    if (!res.ok) throw new Error(`Fetch failed: ${res.status}`);
    const buffer = await res.arrayBuffer();
    const { error } = await supabase.storage.from(BUCKET).upload(path, Buffer.from(buffer), { upsert: true });
    if (error) throw error;
    return `${supabaseUrl}/storage/v1/object/public/${BUCKET}/${path}`;
  } catch (err) {
    console.error(`  x Failed to upload ${url}: ${err.message}`);
    return null;
  }
}

async function migrate() {
  console.log(`\nStarting migration for: ${COURSE_NAME}\n`);

  let { data: course } = await supabase.from('courses').select('id').eq('title', COURSE_NAME).maybeSingle();
  if (!course) {
    const { data: newCourse } = await supabase.from('courses').insert({ title: COURSE_NAME, thumbnail_url: COURSE_IMG }).select().single();
    course = newCourse;
  }
  const courseId = course.id;

  for (let i = 0; i < LESSONS_IDS.length; i++) {
    const lessonMeta = LESSONS_IDS[i];
    console.log(`[${i+1}/${LESSONS_IDS.length}] ${lessonMeta.title}...`);

    let { data: section } = await supabase.from('sections').select('id').eq('course_id', courseId).eq('title', lessonMeta.title).maybeSingle();
    if (!section) {
       const { data: newSec } = await supabase.from('sections').insert({ 
          course_id: courseId, 
          title: lessonMeta.title, 
          order: i + 1 
       }).select().single();
       section = newSec;
    }
    const sectionId = section.id;

    const res = await fetch(`https://learningeffortlessenglish.com/lesson/${lessonMeta.id}`, { headers: { 'Cookie': userCookie } });
    const html = await res.text();

    const audioMatches = Array.from(html.matchAll(/https:\/\/cdn\.learningeffortlessenglish\.com\/upload\/audio\/[a-z0-9]+\.mp3/g)).map(m => m[0]);
    const uniqueAudios = Array.from(new Set(audioMatches));

    const labels = ["Articles", "Vocabulary", "Mini-Story", "Commentary"];
    
    for (let j = 0; j < uniqueAudios.length; j++) {
      const audioUrl = uniqueAudios[j];
      const label = labels[j] || `Additional Audio ${j+1}`;
      console.log(`  |- Uploading ${label}...`);
      
      const publicUrl = await uploadToStorage(audioUrl, `${COURSE_NAME}/${lessonMeta.title}/${label}.mp3`);
      
      if (publicUrl) {
        await supabase.from('lessons').upsert({
          section_id: sectionId,
          title: label,
          content_url: publicUrl,
          lesson_type: label === 'Vocabulary' ? 'vocab' : 'listen',
          order: j + 1
        }, { onConflict: 'section_id,title' });
      }
    }
  }

  console.log('\n===== MIGRATION COMPLETED =====\n');
}

migrate();
