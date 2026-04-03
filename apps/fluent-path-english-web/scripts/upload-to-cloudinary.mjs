/**
 * Upload Audio to Cloudinary - Effortless English Courses
 * =========================================================
 * Hỗ trợ cấu trúc thư mục 2 cấp lồng nhau:
 *
 *  Course/
 *    └── Lesson-1-TITLE/          ← section
 *          ├── Listening/         ← sub-folder = lesson type
 *          │     ├── audio.mp3   ← upload lên Cloudinary
 *          │     └── unit.pdf    ← lưu local path (skip upload)
 *          └── Reading/
 *                ├── audio.mp3
 *                └── unit.pdf
 *
 * Chạy:
 *   node --env-file=.env.local scripts/upload-to-cloudinary.mjs
 *   node --env-file=.env.local scripts/upload-to-cloudinary.mjs --dry-run
 *   node --env-file=.env.local scripts/upload-to-cloudinary.mjs --course="Pimsleur English For Vietnamese Speakers"
 */

import { v2 as cloudinary } from 'cloudinary';
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// ─── CONFIG ──────────────────────────────────────────────────────────────────

const BASE_DIR = '/Volumes/NTA/documents/Luyện nói tiếng Anh như người bản ngữ Effortless English';

const COURSES = [
  {
    dirName: '1 (A0) - Pimsleur English For Vietnamese Speakers',
    title:   'Pimsleur English For Vietnamese Speakers',
    level:   'beginner',
  },
  {
    dirName: '2 (A1) - Effortless English Foundation',
    title:   'Effortless English Foundation',
    level:   'beginner',
  },
  {
    dirName: '3 (A1) - Flow English Course',
    title:   'Flow English Course',
    level:   'elementary',
  },
];

const DRY_RUN    = process.argv.includes('--dry-run');
const ONLY_TITLE = process.argv.find(a => a.startsWith('--course='))?.split('=')[1];

const AUDIO_EXTS = new Set(['.mp3', '.m4a', '.wav', '.ogg', '.aac']);
const CLOUDINARY_ROOT = 'effortless_english';

// Map tên sub-folder → lesson_type trong DB
const FOLDER_TYPE_MAP = {
  'listening':   'listen',
  'reading':     'read',
  'ministory':   'listen',
  'mini-story':  'listen',
  'ministory a': 'listen',
  'ministory b': 'listen',
  'main story':  'listen',
  'vocabulary':  'vocab',
  'vocab':       'vocab',
  'conversation':'listen',
  'articles':    'listen',
  'article':     'listen',
  'commentary':  'listen',
  'slow':        'slow',
};

// ─── INIT ─────────────────────────────────────────────────────────────────────

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure:     true,
});

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
);

// ─── UTILS ───────────────────────────────────────────────────────────────────

function slugify(str) {
  return str
    .toLowerCase()
    .replace(/[?.'!,]/g, '')      // bỏ ký tự đặc biệt ở URL
    .replace(/[^a-z0-9\-]+/g, '-')
    .replace(/(^-|-$)+/g, '');
}

/**
 * Xử lý tên lesson từ tên folder:
 *   "Lesson-1-DO-YOU-UNDERSTAND-VIETNAMESE?" → "Lesson 1: Do You Understand Vietnamese"
 *   "Lesson-3-The-Birthday-Cake"             → "Lesson 3: The Birthday Cake"
 */
function formatLessonTitle(folderName) {
  // Bỏ dấu ?.! ở cuối
  const cleaned = folderName.replace(/[?.!]+$/, '').trim();
  // Thay dấu - thành space, capitalise từng chữ  
  const words = cleaned.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase());
  // words[0] = "Lesson", words[1] = "1", rest = title
  if (words.length >= 3 && words[0].toLowerCase() === 'lesson') {
    const num = words[1];
    const title = words.slice(2).join(' ');
    return `Lesson ${num}: ${title}`;
  }
  return words.join(' ');
}

/**
 * Trích số thứ tự từ tên folder "Lesson-3-..." → 3
 */
function extractLessonOrder(folderName) {
  const m = folderName.match(/lesson-?(\d+)/i);
  return m ? parseInt(m[1], 10) : 999;
}

function getLessonType(subFolderName) {
  const key = subFolderName.toLowerCase().trim();
  return FOLDER_TYPE_MAP[key] || 'listen';
}

function isAudio(filename) {
  return AUDIO_EXTS.has(path.extname(filename).toLowerCase());
}

// ─── DB HELPERS ───────────────────────────────────────────────────────────────

async function upsertCourse({ title, level }) {
  const slug = slugify(title);
  // Check if exists
  const { data: existing } = await supabase
    .from('courses').select('id').eq('slug', slug).maybeSingle();
  if (existing) return existing.id;
  // Insert new
  const { data, error } = await supabase
    .from('courses')
    .insert({ title, slug, level, status: 'published' })
    .select('id').single();
  if (error) throw new Error(`[DB] Course insert "${title}": ${error.message}`);
  return data.id;
}

async function upsertSection(courseId, title, orderIndex) {
  const slug = slugify(title);
  // Check if exists
  const { data: existing } = await supabase
    .from('sections').select('id')
    .eq('course_id', courseId).eq('slug', slug).maybeSingle();
  if (existing) return existing.id;
  // Insert new
  const { data, error } = await supabase
    .from('sections')
    .insert({ course_id: courseId, title, slug, order_index: orderIndex })
    .select('id').single();
  if (error) throw new Error(`[DB] Section insert "${title}": ${error.message}`);
  return data.id;
}

/** Upsert lesson (no content_url) then insert media record into lesson_media */
async function upsertLessonWithMedia(sectionId, lessonTitle, lessonType, orderIndex, audioUrl) {
  const slug = slugify(lessonTitle);

  // 1. Upsert lesson record (no URL here)
  let lessonId;
  const { data: existing } = await supabase
    .from('lessons').select('id')
    .eq('section_id', sectionId).eq('slug', slug).maybeSingle();

  if (existing) {
    lessonId = existing.id;
  } else {
    const { data, error } = await supabase.from('lessons').insert({
      section_id:   sectionId,
      title:        lessonTitle,
      slug,
      lesson_type:  lessonType,
      order_index:  orderIndex,
      is_published: true,
    }).select('id').single();
    if (error) throw new Error(`[DB] Lesson insert "${lessonTitle}": ${error.message}`);
    lessonId = data.id;
  }

  // 2. Upsert media record in lesson_media
  // 2. Upsert media record in lesson_media
  const { data: existingMedia } = await supabase
    .from('lesson_media').select('id')
    .eq('lesson_id', lessonId).eq('media_type', 'audio').maybeSingle();

  if (existingMedia) {
    await supabase.from('lesson_media')
      .update({ url: audioUrl, source_type: 'cloudinary' })
      .eq('id', existingMedia.id);
  } else {
    const { error: mediaErr } = await supabase.from('lesson_media').insert({
      lesson_id:   lessonId,
      media_type:  'audio',
      title:       lessonTitle,
      url:         audioUrl,
      source_type: 'cloudinary',
      order_index: 0,
      mime_type:   'audio/mpeg',
    });
    if (mediaErr) throw new Error(`[DB] Media insert "${lessonTitle}": ${mediaErr.message}`);
  }
}

async function upsertPdfWithMedia(sectionId, lessonTitle, lessonType, pdfUrl) {
  const slug = slugify(lessonTitle);

  // 1. Upsert lesson record
  let lessonId;
  const { data: existing } = await supabase
    .from('lessons').select('id')
    .eq('section_id', sectionId).eq('slug', slug).maybeSingle();

  if (existing) {
    lessonId = existing.id;
  } else {
    const { data, error } = await supabase.from('lessons').insert({
      section_id:   sectionId,
      title:        lessonTitle,
      slug,
      lesson_type:  lessonType,
      order_index:  999, // default last if audio didn't create
      is_published: true,
    }).select('id').single();
    if (error) throw new Error(`[DB] Lesson insert "${lessonTitle}": ${error.message}`);
    lessonId = data.id;
  }

  // 2. Upsert media record in lesson_media
  const { data: existingMedia } = await supabase
    .from('lesson_media').select('id')
    .eq('lesson_id', lessonId).eq('media_type', 'pdf').maybeSingle();

  if (existingMedia) {
    await supabase.from('lesson_media')
      .update({ url: pdfUrl, source_type: 'cloudinary' })
      .eq('id', existingMedia.id);
  } else {
    const { error: mediaErr } = await supabase.from('lesson_media').insert({
      lesson_id:   lessonId,
      media_type:  'pdf',
      title:       lessonTitle,
      url:         pdfUrl,
      source_type: 'cloudinary',
      order_index: 1, // order after audio
      mime_type:   'application/pdf',
    });
    if (mediaErr) throw new Error(`[DB] PDF Media insert "${lessonTitle}": ${mediaErr.message}`);
  }
}

// (legacy - replaced by upsertLessonWithMedia above)

// ─── UPLOAD ───────────────────────────────────────────────────────────────────

async function uploadAudio(localPath, publicId) {
  if (DRY_RUN) {
    return `[DRY] https://res.cloudinary.com/CLOUD/video/upload/${publicId}`;
  }
  const result = await cloudinary.uploader.upload(localPath, {
    resource_type: 'video',   // Cloudinary dùng 'video' cho audio
    public_id:     publicId,
    overwrite:     false,     // skip nếu đã tồn tại
    invalidate:    true,
  });
  return result.secure_url;
}

async function uploadPdf(localPath, publicId) {
  if (DRY_RUN) {
    return `[DRY] https://res.cloudinary.com/CLOUD/image/upload/${publicId}.pdf`;
  }
  const result = await cloudinary.uploader.upload(localPath, {
    resource_type: 'image',   // PDF handled best as 'image' in Cloudinary
    public_id:     publicId,
    overwrite:     false,
    invalidate:    true,
  });
  // Gắn cờ .pdf nếu url trả về không có, nhưng resource_type image tự return .pdf format.
  return result.secure_url;
}

// ─── SCAN & PROCESS ──────────────────────────────────────────────────────────

async function processLesson(courseId, lessonFolderPath, lessonFolderName, sectionOrder) {
  const sectionTitle = formatLessonTitle(lessonFolderName);

  console.log(`\n  📂 [${sectionOrder}] ${sectionTitle}`);

  const sectionId = DRY_RUN ? 'DRY_SEC' : await upsertSection(courseId, sectionTitle, sectionOrder);

  // Đọc các sub-folder (Listening/, Reading/, MiniStory/, ...)
  let entries;
  try {
    entries = fs.readdirSync(lessonFolderPath);
  } catch {
    console.log(`     ⚠  Cannot read: ${lessonFolderPath}`);
    return { uploaded: 0, skipped: 0, errors: 0 };
  }

  let uploaded = 0, skipped = 0, errors = 0;
  let lessonOrder = 1;

  // Tìm sub-folders
  const subFolders = entries
    .filter(e => {
      const full = path.join(lessonFolderPath, e);
      return !e.startsWith('.') && fs.statSync(full).isDirectory();
    })
    .sort();

  // Tìm audio/pdf trực tiếp trong lesson folder (không có sub-folder)
  const directFiles = entries
    .filter(e => {
      const full = path.join(lessonFolderPath, e);
      return !e.startsWith('.') && fs.statSync(full).isFile();
    });

  // ── Xử lý cấu trúc có sub-folder ──
  if (subFolders.length > 0) {
    for (const subFolderName of subFolders) {
      const subPath = path.join(lessonFolderPath, subFolderName);
      const lessonType = getLessonType(subFolderName);
      const lessonTitle = `${sectionTitle} - ${subFolderName}`;

      const subFiles = fs.readdirSync(subPath).filter(f => !f.startsWith('.'));

      for (const fname of subFiles) {
        const fPath = path.join(subPath, fname);
        if (!fs.statSync(fPath).isFile()) continue;

        if (isAudio(fname)) {
          // ── Audio → Upload Cloudinary ──
          const publicId = [
            CLOUDINARY_ROOT,
            slugify(path.basename(path.dirname(lessonFolderPath))), // course slug
            slugify(lessonFolderName),
            slugify(subFolderName),
          ].join('/');

          try {
            process.stdout.write(`     🎵 ${subFolderName}/${fname} → `);
            const url = await uploadAudio(fPath, publicId);
            if (!DRY_RUN) {
              await upsertLessonWithMedia(sectionId, lessonTitle, lessonType, lessonOrder++, url);
            } else {
              lessonOrder++;
            }
            console.log(`✅`);
            uploaded++;
          } catch (err) {
            console.log(`❌ ${err.message}`);
            errors++;
          }

        } else if (fname.toLowerCase().endsWith('.pdf')) {
          const publicId = [
            CLOUDINARY_ROOT,
            slugify(path.basename(path.dirname(lessonFolderPath))),
            slugify(lessonFolderName),
            slugify(subFolderName) + '-pdf',
          ].join('/');

          try {
            process.stdout.write(`     📄 ${subFolderName}/${fname} → `);
            const url = await uploadPdf(fPath, publicId);
            if (!DRY_RUN) {
              await upsertPdfWithMedia(sectionId, lessonTitle, lessonType, url);
            }
            console.log(`✅`);
            uploaded++;
          } catch (err) {
            console.log(`❌ ${err.message}`);
            errors++;
          }
        }
      }
    }

  // ── Xử lý flat structure (audio file trực tiếp) ──
  } else {
    for (const fname of directFiles) {
      const fPath = path.join(lessonFolderPath, fname);
      if (isAudio(fname)) {
        const publicId = [
          CLOUDINARY_ROOT,
          slugify(path.basename(path.dirname(lessonFolderPath))),
          slugify(lessonFolderName),
          slugify(path.basename(fname, path.extname(fname))),
        ].join('/');

        try {
          process.stdout.write(`     🎵 ${fname} → `);
          const url = await uploadAudio(fPath, publicId);
          if (!DRY_RUN) {
            await upsertLessonWithMedia(sectionId, sectionTitle, 'listen', lessonOrder++, url);
          } else {
            lessonOrder++;
          }
          console.log(`✅`);
          uploaded++;
        } catch (err) {
          console.log(`❌ ${err.message}`);
          errors++;
        }

      } else if (fname.toLowerCase().endsWith('.pdf')) {
        const publicId = [
          CLOUDINARY_ROOT,
          slugify(path.basename(path.dirname(lessonFolderPath))),
          slugify(lessonFolderName),
          slugify(path.basename(fname, path.extname(fname))) + '-pdf',
        ].join('/');

        try {
          process.stdout.write(`     📄 ${fname} → `);
          const url = await uploadPdf(fPath, publicId);
          if (!DRY_RUN) {
            await upsertPdfWithMedia(sectionId, sectionTitle, 'listen', url);
          }
          console.log(`✅`);
          uploaded++;
        } catch (err) {
          console.log(`❌ ${err.message}`);
          errors++;
        }
      }
    }
  }

  return { uploaded, skipped, errors };
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log('\n╔══════════════════════════════════════════════════════╗');
  console.log('║   🚀 Cloudinary Audio Upload + Supabase DB Sync      ║');
  console.log(`║   Mode: ${DRY_RUN ? '🔍 DRY RUN (không upload thật)         ' : '⚡ LIVE   (đang upload thật sự!)        '}║`);
  console.log('╚══════════════════════════════════════════════════════╝\n');

  // Validate env
  if (!process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_SECRET) {
    console.error('❌ Thiếu Cloudinary credentials trong .env.local'); process.exit(1);
  }
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    console.error('❌ Thiếu Supabase credentials trong .env.local'); process.exit(1);
  }

  let totalUploaded = 0, totalSkipped = 0, totalErrors = 0;

  const coursesToProcess = COURSES.filter(c => !ONLY_TITLE || c.title === ONLY_TITLE);

  for (const course of coursesToProcess) {
    const courseDir = path.join(BASE_DIR, course.dirName);

    if (!fs.existsSync(courseDir)) {
      console.error(`❌ Không tìm thấy thư mục: ${courseDir}`);
      continue;
    }

    console.log(`\n${'═'.repeat(60)}`);
    console.log(`📖 COURSE: ${course.title}`);
    console.log(`${'═'.repeat(60)}`);

    const courseId = DRY_RUN ? 'DRY_COURSE' : await upsertCourse(course);

    // Đọc lesson folders, sort theo số thứ tự
    const lessonFolders = fs.readdirSync(courseDir)
      .filter(name => {
        const full = path.join(courseDir, name);
        return !name.startsWith('.') && fs.statSync(full).isDirectory();
      })
      .sort((a, b) => extractLessonOrder(a) - extractLessonOrder(b));

    console.log(`   → Tìm thấy ${lessonFolders.length} lessons\n`);

    for (let i = 0; i < lessonFolders.length; i++) {
      const lessonDir = path.join(courseDir, lessonFolders[i]);
      const result = await processLesson(courseId, lessonDir, lessonFolders[i], i + 1);
      totalUploaded += result.uploaded;
      totalSkipped  += result.skipped;
      totalErrors   += result.errors;
    }
  }

  console.log('\n╔══════════════════════════════════════════════════════╗');
  console.log(`║  ✅ Uploaded to Cloudinary: ${String(totalUploaded).padEnd(24)}║`);
  console.log(`║  📄 PDF Skipped:            ${String(totalSkipped).padEnd(24)}║`);
  console.log(`║  ❌ Errors:                 ${String(totalErrors).padEnd(24)}║`);
  console.log('╚══════════════════════════════════════════════════════╝\n');

  if (DRY_RUN) {
    console.log('💡 Đây là DRY RUN. Chạy lại không có --dry-run để upload thật!\n');
  } else {
    console.log('🎉 Done! Kiểm tra Cloudinary Dashboard và Supabase DB.\n');
  }
}

main().catch(err => {
  console.error('\n💥 Script crashed:', err.message);
  process.exit(1);
});
