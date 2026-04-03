import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const userCookie = '__utma=102262044.115041005.1774251416.1774251416.1774251416.1; __utmz=102262044.1774251416.1.1.utmcsr=(direct)|utmccn=(direct)|utmcmd=(none); _gcl_au=1.1.2091509730.1774251416; _tt_enable_cookie=1; _ttp=01KMCT06CWGTH4NRT71GJ2FYV5_.tt.1; _fbp=fb.1.1774251415974.29510366263659611; _ga=GA1.1.769331670.1774251416; __utmc=102262044; promotion_calling_20260318=1774256452; _ZB_STATIC_576872_DR_MF_lastTime=1774257833451; __utmt=1; __utmb=102262044.56.10.1774251416; _ga_JTE43400EH=GS2.1.s1774251416$o1$g1$t1774259011$j41$l0$h0; ttcsid=1774251415966::6XLmuBdezDr4VRcr0z5H.1.1774259122501.0; ttcsid_CHE4T1BC77U829NKIENG=1774251415966::JktkwSwcRyzits17g7Ao.1.1774259122501.1; XSRF-TOKEN=eyJpdiI6ImxZNUhcL3JBVCtOWnJ4S2xjVmk5amN3PT0iLCJ2YWx1ZSI6IldiejV2WXVWTWFiaDJuV2ZLM3p5T1VoOGJVTG9oUFZNZlZDcklZK05Dc1ZrVXo1bVV0RUxxUkdtTUZJM1lFWWlnVG5Sd05PVitydHE5cE1EVGlRVHlBPT0iLCJtYWMiOiIxN2YwNWFjYjVhZDk1ODNlNjg5YzViMGQyNDI2Nzk3ODkyYTY1ZmI3YmMzOTNhMWIwNzUxNzYzZTE3YmEwZTk1In0%3D; laravel_session=eyJpdiI6IjVEUGZrOWp4R2paXC9kd2hBZlQ3YkZBPT0iLCJ2YWx1ZSI6IlwvOCtlM0tsK29JQlpUYVBESkdRaWdHMFlNZGJJaGNyUnlWckdEXC9URm5DMUR0RnFaYW8rWDNZeWNUN0xDQTNcLzd5d09EZ2UzY0dLVGxjVHJoK2VWMFBnPT0iLCJtYWMiOiI2YjMwYzcxZjYwOGFiZDA1NWIzY2YwYTUxZDMxZjMzNzM5NTVjZmFjNjZmNWU4MWY4MzRkMDZmMGE2YTJmZWVkIn0%3D';

const LESSONS_IDS = [
  { "title": "Lesson 1", "id": "c8e1bc874a8749b7a315679914f75d53" },
  { "title": "Lesson 30: Storytelling", "id": "608d2d231cf5a8ae3d97be025789ddb4" }
]; // Test with these for now to verify PDF extraction

const supabase = createClient(supabaseUrl, serviceKey);
const BUCKET = 'learning_materials';
const COURSE_NAME = 'Effortless English Original Course';

async function uploadToStorage(url, path) {
  try {
    const res = await fetch(url, { headers: { 'Cookie': userCookie } });
    if (!res.ok) return null;
    const buffer = await res.arrayBuffer();
    await supabase.storage.from(BUCKET).upload(path, Buffer.from(buffer), { upsert: true });
    return `${supabaseUrl}/storage/v1/object/public/${BUCKET}/${path}`;
  } catch { return null; }
}

async function migrate() {
  const { data: course } = await supabase.from('courses').select('id').eq('title', COURSE_NAME).single();
  const courseId = course.id;

  for (const lessonMeta of LESSONS_IDS) {
    console.log(`Processing Extra Files for ${lessonMeta.title}...`);
    const { data: section } = await supabase.from('sections').select('id').eq('course_id', courseId).eq('title', lessonMeta.title).single();
    
    const res = await fetch(`https://learningeffortlessenglish.com/lesson/${lessonMeta.id}`, { headers: { 'Cookie': userCookie } });
    const html = await res.text();

    // 1. Scan for Video (YouTube/Vimeo/CDN)
    const videoMatches = html.match(/https?:\/\/[^\s"'<>]+(\.mp4|\.m4v)/gi) || [];
    // 2. Scan for PDF/Google Drive
    const driveMatches = html.match(/https:\/\/drive\.google\.com\/[^\s"'<>]+/g) || [];

    const extraFiles = [...new Set([...videoMatches, ...driveMatches])];
    
    for (let i=0; i<extraFiles.length; i++) {
        const url = extraFiles[i];
        let label = url.includes('.mp4') ? 'Video' : 'Reading Material';
        if (url.includes('drive.google.com')) label = 'Tapescript (PDF)';

        console.log(`  |- Found: ${label}`);
        // For Google Drive, we just save the link as content_url (bypass upload for now to save storage)
        const type = label === 'Video' ? 'video' : 'read';
        
        await supabase.from('lessons').upsert({
          section_id: section.id,
          title: `${label} ${i+1}`,
          content_url: url,
          lesson_type: type,
          order: 100 + i
        }, { onConflict: 'section_id,title' });
    }
  }
  console.log('DONE.');
}
migrate();
