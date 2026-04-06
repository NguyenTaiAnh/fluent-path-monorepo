#!/usr/bin/env python3
"""
TAEnglish — Local Whisper Transcript Generator (Offline)
========================================================

Scans local audio folders, runs Whisper 100% locally,
outputs JSON transcript files next to each MP3.

Usage:
  # Fix SSL first (one-time):
  /Applications/Python\ 3.10/Install\ Certificates.command
  # OR just run with SSL bypass built-in (this script handles it)

  # Activate venv:
  source scripts/.venv/bin/activate

  # Process 1 specific file:
  python scripts/local-whisper-transcribe.py --single "/path/to/file.mp3"

  # Process entire course:
  python scripts/local-whisper-transcribe.py --course flow

  # Process ALL courses:
  python scripts/local-whisper-transcribe.py --course all

  # Dry run:
  python scripts/local-whisper-transcribe.py --course all --dry-run

  # Use a bigger model for better accuracy:
  python scripts/local-whisper-transcribe.py --course all --model-size small
"""

# ─── SSL Fix (must be BEFORE any imports that do HTTPS) ────────
import ssl
ssl._create_default_https_context = ssl._create_unverified_context

import argparse
import json
import os
import sys
import time
from pathlib import Path

import whisper

# ─── Course Configuration ─────────────────────────────────────
BASE_DIR = Path("/Volumes/NTA/documents/Luyện nói tiếng Anh như người bản ngữ Effortless English")

COURSES = {
    "pimsleur": {
        "name": "Pimsleur English For Vietnamese",
        "path": BASE_DIR / "1 (A0) - Pimsleur English For Vietnamese Speakers",
    },
    "foundation": {
        "name": "Effortless English Foundation",
        "path": BASE_DIR / "2 (A1) - Effortless English Foundation",
    },
    "flow": {
        "name": "Flow English Course",
        "path": BASE_DIR / "3 (A1) - Flow English Course",
    },
}


def find_mp3_files(course_path: Path) -> list[Path]:
    """Recursively find all MP3 files in a course directory."""
    return sorted(course_path.rglob("*.mp3"))


def transcribe_audio(model, file_path: Path) -> list[dict]:
    """Transcribe an audio file using local Whisper model."""
    result = model.transcribe(
        str(file_path),
        language="en",
        verbose=False,
        word_timestamps=False,
    )

    segments = []
    for seg in result.get("segments", []):
        text = seg["text"].strip()
        if text:  # skip empty segments
            segments.append({
                "start": round(seg["start"], 2),
                "end": round(seg["end"], 2),
                "text": text,
            })
    return segments


def get_output_path(mp3_path: Path) -> Path:
    """Generate output JSON path next to the MP3 file."""
    return mp3_path.with_suffix(".transcript.json")


def build_readable_label(mp3_path: Path, course_path: Path) -> str:
    """Build a human-readable label from the file path."""
    rel = mp3_path.relative_to(course_path)
    parts = list(rel.parts)
    # Remove the hash filename, use parent folder names
    folder_parts = parts[:-1]  # e.g. ["Lesson-1-Baseball-Pig", "Articles"]
    return " / ".join(folder_parts) if folder_parts else mp3_path.stem


def main():
    parser = argparse.ArgumentParser(description="TAEnglish Local Whisper Transcriber (Offline)")
    parser.add_argument(
        "--course",
        choices=["pimsleur", "foundation", "flow", "all"],
        help="Which course to process",
    )
    parser.add_argument("--single", help="Process a single MP3 file path")
    parser.add_argument("--dry-run", action="store_true", help="Preview without processing")
    parser.add_argument(
        "--model-size",
        default="base",
        choices=["tiny", "base", "small", "medium", "large"],
        help="Whisper model size (default: base). Larger = more accurate but slower.",
    )
    parser.add_argument("--skip-existing", action="store_true", default=True,
                        help="Skip files that already have a .transcript.json (default: True)")
    parser.add_argument("--force", action="store_true",
                        help="Force re-transcribe even if JSON already exists")
    args = parser.parse_args()

    if not args.course and not args.single:
        parser.error("Specify --course or --single")

    print("╔══════════════════════════════════════════════════╗")
    print("║  TAEnglish — Local Whisper Transcriber           ║")
    print("║  🆓 100% Free • 100% Offline • Runs on your Mac ║")
    print("╚══════════════════════════════════════════════════╝")
    print()

    if args.dry_run:
        print("🔍 DRY RUN MODE — no files will be written\n")

    # ─── Collect MP3 files ────────────────────────────────────
    mp3_files: list[tuple[Path, str, Path]] = []  # (mp3_path, course_name, course_path)

    if args.single:
        p = Path(args.single)
        if not p.exists():
            print(f"❌ File not found: {p}")
            sys.exit(1)
        mp3_files.append((p, "single", p.parent))
    else:
        courses_to_process = (
            list(COURSES.keys()) if args.course == "all" else [args.course]
        )
        for course_key in courses_to_process:
            course = COURSES[course_key]
            course_path = course["path"]
            if not course_path.exists():
                print(f"⚠️  Course path not found: {course_path}")
                continue
            files = find_mp3_files(course_path)
            for f in files:
                mp3_files.append((f, course["name"], course_path))
            print(f"📁 {course['name']}: {len(files)} MP3 files found")

    # Filter out existing transcripts
    if not args.force:
        original_count = len(mp3_files)
        mp3_files = [
            (f, cn, cp) for f, cn, cp in mp3_files
            if not get_output_path(f).exists()
        ]
        skipped = original_count - len(mp3_files)
        if skipped > 0:
            print(f"⏭️  Skipping {skipped} files with existing transcripts")

    print(f"\n🎯 Will process: {len(mp3_files)} files")
    print()

    if not mp3_files:
        print("✅ Nothing to process!")
        return

    # ─── Load Whisper model ───────────────────────────────────
    model = None
    if not args.dry_run:
        print(f"📦 Loading Whisper model '{args.model_size}'...")
        print("   (First run downloads the model: ~74MB tiny, ~140MB base, ~460MB small)")
        model = whisper.load_model(args.model_size)
        print("   ✓ Model loaded!\n")

    # ─── Process ──────────────────────────────────────────────
    success_count = 0
    error_count = 0
    total_time = 0

    for i, (mp3_path, course_name, course_path) in enumerate(mp3_files):
        progress = f"[{i + 1}/{len(mp3_files)}]"
        label = build_readable_label(mp3_path, course_path)
        print(f"{progress} 🎧 [{course_name}] {label}")

        output_path = get_output_path(mp3_path)

        if args.dry_run:
            print(f"  → Input:  {mp3_path.name}")
            print(f"  → Output: {output_path.name}")
            print()
            continue

        try:
            sys.stdout.write(f"  🤖 Transcribing ({args.model_size})...")
            sys.stdout.flush()

            start_time = time.time()
            transcript = transcribe_audio(model, mp3_path)
            elapsed = time.time() - start_time
            total_time += elapsed

            print(f" ✓ ({len(transcript)} segments, {elapsed:.1f}s)")

            # Write JSON
            output_data = {
                "source_file": mp3_path.name,
                "course": course_name,
                "label": label,
                "model": args.model_size,
                "generated_at": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
                "segments": transcript,
            }

            with open(output_path, "w", encoding="utf-8") as f:
                json.dump(output_data, f, ensure_ascii=False, indent=2)

            print(f"  💾 Saved: {output_path.name}")

            # Preview
            if transcript:
                for seg in transcript[:2]:
                    print(f'     [{seg["start"]}s → {seg["end"]}s] "{seg["text"]}"')
                if len(transcript) > 2:
                    print(f"     ... and {len(transcript) - 2} more segments")

            success_count += 1

        except Exception as e:
            print(f" ❌ ERROR: {e}")
            error_count += 1

        print()

    # ─── Summary ──────────────────────────────────────────────
    print("═══════════════════════════════════════════════════")
    print(f"✅ Success: {success_count}")
    print(f"❌ Errors:  {error_count}")
    if total_time > 0:
        print(f"⏱️  Total time: {total_time:.1f}s ({total_time/60:.1f} min)")
    print("═══════════════════════════════════════════════════")


if __name__ == "__main__":
    main()
