/**
 * ============================================================
 * TAEnglish — Time-synced Transcript Generator (Gemini)
 * ============================================================
 *
 * Uses Google Gemini 2.0 Flash to transcribe audio files and
 * extract sentence-level timestamps.
 *
 * Pipeline:
 *   1. Query lesson_media where media_type='audio' & no transcript
 *   2. Download MP3 from Cloudinary to temp
 *   3. Upload to Gemini File API → transcribe with timestamps
 *   4. Save JSON transcript into lesson_media.metadata.transcript
 *
 * Usage:
 *   npx tsx scripts/generate-transcripts.ts                           # all
 *   npx tsx scripts/generate-transcripts.ts --limit 5                 # first 5
 *   npx tsx scripts/generate-transcripts.ts --dry-run                 # preview
 *   npx tsx scripts/generate-transcripts.ts --media-id <uuid>         # single record
 *   npx tsx scripts/generate-transcripts.ts --lesson-id <uuid>        # by lesson
 */

import { GoogleGenerativeAI } from '@google/generative-ai'
import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'
import { resolve } from 'path'
import { existsSync, mkdirSync, unlinkSync, readFileSync, rmSync } from 'fs'
import { createWriteStream } from 'fs'
import { Readable } from 'stream'
import { finished } from 'stream/promises'

// ─── Load env ────────────────────────────────────────────────────
config({ path: resolve(__dirname, '../apps/fluent-path-english-web/.env.local') })

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!
const GEMINI_API_KEY = process.env.GEMINI_API_KEY!

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('❌ Missing SUPABASE env vars')
  process.exit(1)
}
if (!GEMINI_API_KEY) {
  console.error('❌ Missing GEMINI_API_KEY in .env.local')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY)

// ─── Types ───────────────────────────────────────────────────────
interface TranscriptSegment {
  start: number
  end: number
  text: string
}

interface LessonMedia {
  id: string
  title: string
  url: string
  metadata: Record<string, unknown> | null
}

// ─── CLI args ────────────────────────────────────────────────────
const args = process.argv.slice(2)
const isDryRun = args.includes('--dry-run')
const limitIdx = args.indexOf('--limit')
const limit = limitIdx !== -1 ? parseInt(args[limitIdx + 1], 10) : undefined
const mediaIdIdx = args.indexOf('--media-id')
const targetMediaId = mediaIdIdx !== -1 ? args[mediaIdIdx + 1] : undefined
const lessonIdIdx = args.indexOf('--lesson-id')
const targetLessonId = lessonIdIdx !== -1 ? args[lessonIdIdx + 1] : undefined

// ─── Helpers ─────────────────────────────────────────────────────
const TEMP_DIR = resolve(__dirname, '.tmp-audio')

async function downloadFile(url: string, destPath: string): Promise<void> {
  const response = await fetch(url)
  if (!response.ok) throw new Error(`Download failed: ${response.status}`)
  const body = response.body
  if (!body) throw new Error('No response body')
  const fileStream = createWriteStream(destPath)
  // @ts-ignore
  await finished(Readable.fromWeb(body as any).pipe(fileStream))
}

async function transcribeWithGemini(filePath: string): Promise<TranscriptSegment[]> {
  const fileBuffer = readFileSync(filePath)
  const base64Data = fileBuffer.toString('base64')

  const prompt = `You are a precise audio transcription tool.

Transcribe this audio file into sentence-level segments with exact timestamps.

CRITICAL RULES:
1. Return ONLY a valid JSON array, no markdown, no explanation, no code fences.
2. Each element must have: "start" (number, seconds), "end" (number, seconds), "text" (string).
3. Timestamps must be accurate to the audio content.
4. Each segment should be one natural sentence or phrase.
5. Do NOT include any text outside the JSON array.

Example output format:
[{"start":0.0,"end":3.5,"text":"Hello and welcome to the show."},{"start":3.8,"end":7.2,"text":"Today we have a fun story for you."}]`

  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' })

  const result = await model.generateContent([
    { text: prompt },
    {
      inlineData: {
        mimeType: 'audio/mpeg',
        data: base64Data,
      },
    },
  ])

  const response = result.response
  const rawText = response.text()?.trim() || ''

  // Try to extract JSON from the response
  let jsonStr = rawText

  // Remove markdown code fences if present
  const codeBlockMatch = rawText.match(/```(?:json)?\s*([\s\S]*?)```/)
  if (codeBlockMatch) {
    jsonStr = codeBlockMatch[1].trim()
  }

  // Find the JSON array
  const arrayStart = jsonStr.indexOf('[')
  const arrayEnd = jsonStr.lastIndexOf(']')
  if (arrayStart === -1 || arrayEnd === -1) {
    throw new Error(`Gemini did not return valid JSON array. Raw response: ${rawText.substring(0, 200)}`)
  }
  jsonStr = jsonStr.substring(arrayStart, arrayEnd + 1)

  const segments: TranscriptSegment[] = JSON.parse(jsonStr)

  // Validate & clean
  return segments
    .filter((s) => typeof s.start === 'number' && typeof s.end === 'number' && typeof s.text === 'string')
    .map((s) => ({
      start: Math.round(s.start * 100) / 100,
      end: Math.round(s.end * 100) / 100,
      text: s.text.trim(),
    }))
}

async function updateMetadata(
  id: string,
  existingMetadata: Record<string, unknown> | null,
  transcript: TranscriptSegment[],
): Promise<void> {
  const newMetadata = {
    ...(existingMetadata || {}),
    transcript,
    transcript_generated_at: new Date().toISOString(),
    transcript_source: 'gemini-2.0-flash',
  }

  const { error } = await supabase
    .from('lesson_media')
    .update({ metadata: newMetadata })
    .eq('id', id)

  if (error) throw new Error(`Supabase update failed: ${error.message}`)
}

// ─── Main ────────────────────────────────────────────────────────
async function main() {
  console.log('╔══════════════════════════════════════════════════╗')
  console.log('║  TAEnglish — Transcript Generator (Gemini 2.0)  ║')
  console.log('╚══════════════════════════════════════════════════╝')
  console.log()

  if (isDryRun) console.log('🔍 DRY RUN MODE — no changes will be made\n')

  // 1. Build query
  let query = supabase
    .from('lesson_media')
    .select('id, title, url, metadata')
    .eq('media_type', 'audio')
    .order('title', { ascending: true })

  if (targetMediaId) {
    query = query.eq('id', targetMediaId)
  } else if (targetLessonId) {
    query = query.eq('lesson_id', targetLessonId)
  }

  const { data: allMedia, error } = await query
  if (error) {
    console.error('❌ Failed to query lesson_media:', error.message)
    process.exit(1)
  }

  // 2. Filter ones that already have transcript (unless targeting specific IDs)
  let toProcess: LessonMedia[]
  if (targetMediaId || targetLessonId) {
    toProcess = allMedia as LessonMedia[]
    console.log(`🎯 Targeting specific record(s): ${toProcess.length} found`)
  } else {
    const needsTranscript = (allMedia as LessonMedia[]).filter((m) => {
      const meta = m.metadata as Record<string, unknown> | null
      return !meta?.transcript || !Array.isArray(meta.transcript) || (meta.transcript as unknown[]).length === 0
    })
    toProcess = limit ? needsTranscript.slice(0, limit) : needsTranscript
    console.log(`📊 Total audio records:  ${allMedia!.length}`)
    console.log(`📝 Need transcript:      ${needsTranscript.length}`)
  }

  console.log(`🎯 Will process:         ${toProcess.length}`)
  console.log()

  if (toProcess.length === 0) {
    console.log('✅ Nothing to process!')
    return
  }

  // 3. Create temp dir
  if (!isDryRun && !existsSync(TEMP_DIR)) {
    mkdirSync(TEMP_DIR, { recursive: true })
  }

  // 4. Process each record
  let successCount = 0
  let errorCount = 0

  for (let i = 0; i < toProcess.length; i++) {
    const media = toProcess[i]
    const progress = `[${i + 1}/${toProcess.length}]`
    console.log(`${progress} 🎧 ${media.title}`)

    if (isDryRun) {
      console.log(`  → Would download: ${media.url.substring(0, 70)}...`)
      console.log(`  → Would transcribe via Gemini 2.0 Flash`)
      console.log(`  → Would update metadata in Supabase`)
      console.log()
      continue
    }

    const tempFile = resolve(TEMP_DIR, `${media.id}.mp3`)

    try {
      // Download
      process.stdout.write('  ⬇️  Downloading...')
      await downloadFile(media.url, tempFile)
      console.log(' ✓')

      // Transcribe
      process.stdout.write('  🤖 Transcribing with Gemini...')
      const transcript = await transcribeWithGemini(tempFile)
      console.log(` ✓ (${transcript.length} segments)`)

      // Save to Supabase
      process.stdout.write('  💾 Saving to database...')
      await updateMetadata(media.id, media.metadata, transcript)
      console.log(' ✓')

      // Preview
      if (transcript.length > 0) {
        console.log(`  📄 Preview:`)
        transcript.slice(0, 3).forEach((seg) => {
          console.log(`     [${seg.start}s → ${seg.end}s] "${seg.text}"`)
        })
        if (transcript.length > 3) {
          console.log(`     ... and ${transcript.length - 3} more segments`)
        }
      }

      successCount++
    } catch (err: any) {
      console.log(` ❌ ERROR`)
      console.error(`  Error: ${err.message}`)
      errorCount++
    } finally {
      try {
        if (existsSync(tempFile)) unlinkSync(tempFile)
      } catch { /* ignore */ }
    }

    console.log()

    // Rate limit: ~500ms between requests
    if (i < toProcess.length - 1) {
      await new Promise((r) => setTimeout(r, 500))
    }
  }

  // Cleanup
  try {
    if (existsSync(TEMP_DIR)) rmSync(TEMP_DIR, { recursive: true, force: true })
  } catch { /* ignore */ }

  // Summary
  console.log('═══════════════════════════════════════════════════')
  console.log(`✅ Success: ${successCount}`)
  console.log(`❌ Errors:  ${errorCount}`)
  console.log('═══════════════════════════════════════════════════')
}

main().catch((err) => {
  console.error('Fatal error:', err)
  process.exit(1)
})
