#!/usr/bin/env python3
"""
TAEnglish — Upload local transcript JSONs to Supabase
=====================================================

Scans all .transcript.json files from local audio directories
and matches them to lesson_media records in Supabase by analyzing
the folder structure (lesson name + part type like Articles, Mini-Story, etc).

Usage:
  source scripts/.venv/bin/activate
  python scripts/upload-transcripts-to-db.py              # upload all
  python scripts/upload-transcripts-to-db.py --dry-run     # preview matches
"""

import argparse
import json
import os
import re
import sys
from datetime import datetime
from pathlib import Path

from supabase import create_client

# ─── Load env ──────────────────────────────────────────────────
ENV_PATH = Path(__file__).parent.parent / "apps" / "fluent-path-english-web" / ".env.local"


def load_env():
    env = {}
    if ENV_PATH.exists():
        for line in ENV_PATH.read_text().splitlines():
            line = line.strip()
            if line and not line.startswith("#") and "=" in line:
                key, _, value = line.partition("=")
                env[key.strip()] = value.strip()
    return env


env = load_env()
SUPABASE_URL = env.get("NEXT_PUBLIC_SUPABASE_URL", "")
SUPABASE_KEY = env.get("SUPABASE_SERVICE_ROLE_KEY", "")

if not SUPABASE_URL or not SUPABASE_KEY:
    print("❌ Missing SUPABASE env vars")
    sys.exit(1)

supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

# ─── Course dirs ───────────────────────────────────────────────
BASE_DIR = Path("/Volumes/NTA/documents/Luyện nói tiếng Anh như người bản ngữ Effortless English")
COURSE_DIRS = [
    BASE_DIR / "1 (A0) - Pimsleur English For Vietnamese Speakers",
    BASE_DIR / "2 (A1) - Effortless English Foundation",
    BASE_DIR / "3 (A1) - Flow English Course",
]


def normalize(text: str) -> str:
    """Normalize a string for fuzzy matching: lowercase, strip special chars."""
    text = text.lower()
    text = re.sub(r"[^a-z0-9\s]", "", text)
    text = re.sub(r"\s+", " ", text).strip()
    return text


def extract_match_key_from_path(json_path: Path) -> str:
    """
    Extract a matching key from the file path structure.
    e.g. /...Flow English.../Lesson-1-Baseball-Pig/Articles/xxx.transcript.json
    → "lesson 1 baseball pig articles"
    """
    parts = json_path.relative_to(BASE_DIR).parts
    # parts like: ('3 (A1) - Flow English Course', 'Lesson-1-Baseball-Pig', 'Articles', 'xxx.transcript.json')
    # We want parts[1] (lesson folder) and parts[2] (subfolder type)
    if len(parts) >= 3:
        lesson_folder = parts[1]  # "Lesson-1-Baseball-Pig"
        subfolder = parts[2]      # "Articles" or "Mini-Story" etc.
        key = f"{lesson_folder} {subfolder}".replace("-", " ")
        return normalize(key)
    return normalize(str(json_path.stem))


def extract_match_key_from_title(title: str) -> str:
    """
    Extract a matching key from DB title.
    e.g. "Lesson 1: Baseball Pig - Articles" → "lesson 1 baseball pig articles"
    """
    # Remove "Lesson X:" prefix formatting variations
    key = title.replace(":", "").replace("-", " ").replace("  ", " ")
    return normalize(key)


def find_best_match(path_key: str, db_records: list[dict]) -> dict | None:
    """Find the best matching DB record for a given path key."""
    best_match = None
    best_score = 0

    for record in db_records:
        title_key = extract_match_key_from_title(record["title"])

        # Calculate word overlap score
        path_words = set(path_key.split())
        title_words = set(title_key.split())
        common = path_words & title_words
        total = path_words | title_words

        if total:
            score = len(common) / len(total)
        else:
            score = 0

        if score > best_score:
            best_score = score
            best_match = record

    # Require at least 60% word overlap
    if best_score >= 0.6:
        return best_match
    return None


def main():
    parser = argparse.ArgumentParser(description="Upload transcript JSONs to Supabase")
    parser.add_argument("--dry-run", action="store_true", help="Preview matches without uploading")
    args = parser.parse_args()

    print("╔══════════════════════════════════════════════════╗")
    print("║  TAEnglish — Upload Transcripts to Database      ║")
    print("╚══════════════════════════════════════════════════╝")
    print()

    if args.dry_run:
        print("🔍 DRY RUN MODE — no changes will be made\n")

    # 1. Find all transcript JSON files
    json_files: list[Path] = []
    for course_dir in COURSE_DIRS:
        if course_dir.exists():
            json_files.extend(sorted(course_dir.rglob("*.transcript.json")))

    print(f"📁 Found {len(json_files)} transcript JSON files\n")

    if not json_files:
        print("❌ No transcript files found!")
        return

    # 2. Fetch all audio lesson_media from DB
    result = supabase.table("lesson_media") \
        .select("id, title, url, metadata") \
        .eq("media_type", "audio") \
        .execute()

    db_records = result.data or []
    print(f"📊 Found {len(db_records)} audio records in database\n")

    # 3. Match and upload
    matched = 0
    unmatched = 0
    uploaded = 0
    skipped = 0
    errors = 0

    for json_path in json_files:
        path_key = extract_match_key_from_path(json_path)
        match = find_best_match(path_key, db_records)

        if not match:
            unmatched += 1
            print(f"  ❓ NO MATCH: {path_key}")
            continue

        matched += 1

        # Check if already has transcript
        existing_meta = match.get("metadata") or {}
        existing_transcript = existing_meta.get("transcript", [])
        if existing_transcript and len(existing_transcript) > 0:
            skipped += 1
            if args.dry_run:
                print(f"  ⏭️  SKIP (already has transcript): {match['title']}")
            continue

        # Read JSON
        try:
            with open(json_path, "r", encoding="utf-8") as f:
                transcript_data = json.load(f)
        except Exception as e:
            print(f"  ❌ Error reading {json_path.name}: {e}")
            errors += 1
            continue

        segments = transcript_data.get("segments", [])

        if args.dry_run:
            print(f"  ✅ MATCH: \"{path_key}\" → \"{match['title']}\" ({len(segments)} segments)")
            continue

        # Upload to DB
        try:
            new_metadata = {
                **existing_meta,
                "transcript": segments,
                "transcript_generated_at": transcript_data.get("generated_at", datetime.utcnow().isoformat()),
                "transcript_source": f"whisper-local-{transcript_data.get('model', 'base')}",
            }

            supabase.table("lesson_media") \
                .update({"metadata": new_metadata}) \
                .eq("id", match["id"]) \
                .execute()

            uploaded += 1
            print(f"  ✅ Uploaded: {match['title']} ({len(segments)} segments)")

        except Exception as e:
            print(f"  ❌ Upload error for {match['title']}: {e}")
            errors += 1

    # Summary
    print()
    print("═══════════════════════════════════════════════════")
    print(f"📁 Total JSON files:  {len(json_files)}")
    print(f"✅ Matched:           {matched}")
    print(f"❓ Unmatched:         {unmatched}")
    print(f"⏭️  Skipped (exists):  {skipped}")
    print(f"💾 Uploaded:          {uploaded}")
    print(f"❌ Errors:            {errors}")
    print("═══════════════════════════════════════════════════")


if __name__ == "__main__":
    main()
