'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input, Select, FormFooter } from '@/components/ui/form'
import { Modal } from '@/components/ui/modal'
import {
  ArrowLeftIcon,
  PlusIcon,
  PencilSquareIcon,
  TrashIcon,
  MusicalNoteIcon,
  DocumentIcon,
  VideoCameraIcon,
  PhotoIcon,
  LinkIcon,
  ArrowTopRightOnSquareIcon,
} from '@heroicons/react/24/outline'
import { LessonDetail, LessonMediaItem } from '@/types/admin'

/* ─── Constants ──────────────────────────────────────────────────────────── */

const MEDIA_TYPE_ICONS: Record<string, typeof MusicalNoteIcon> = {
  audio: MusicalNoteIcon,
  video: VideoCameraIcon,
  pdf: DocumentIcon,
  image: PhotoIcon,
  transcript: DocumentIcon,
  external_url: LinkIcon,
}

const MEDIA_TYPE_COLORS: Record<string, string> = {
  audio: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300',
  video: 'bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300',
  pdf: 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300',
  image: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300',
  transcript: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300',
  external_url: 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300',
}

const MEDIA_TYPES = [
  { value: 'audio', label: '🎧 Audio' },
  { value: 'video', label: '🎬 Video' },
  { value: 'pdf', label: '📄 PDF' },
  { value: 'transcript', label: '📝 Transcript' },
  { value: 'image', label: '🖼️ Image' },
  { value: 'external_url', label: '🔗 External URL' },
]

const SOURCE_TYPES = [
  { value: 'google_drive', label: 'Google Drive' },
  { value: 'cloudinary', label: 'Cloudinary' },
  { value: 'supabase', label: 'Supabase Storage' },
  { value: 'external', label: 'External URL' },
]

/* ─── Component ──────────────────────────────────────────────────────────── */

export default function LessonDetailPage() {
  const { id: lessonId } = useParams<{ id: string }>()
  const [lesson, setLesson] = useState<LessonDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [isMediaModal, setIsMediaModal] = useState(false)
  const [editingMedia, setEditingMedia] = useState<LessonMediaItem | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [deletingMediaId, setDeletingMediaId] = useState<string | null>(null)

  const fetchLesson = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/lessons/${lessonId}`)
      const json = await res.json()
      if (json.success) setLesson(json.data)
    } catch (err) {
      console.error('Failed to fetch lesson:', err)
    }
    setLoading(false)
  }, [lessonId])

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      setLoading(true)
      try {
        const res = await fetch(`/api/admin/lessons/${lessonId}`)
        const json = await res.json()
        if (!cancelled && json.success) setLesson(json.data)
      } catch (err) {
        if (!cancelled) console.error('Failed to fetch lesson:', err)
      }
      if (!cancelled) setLoading(false)
    }
    load()
    return () => {
      cancelled = true
    }
  }, [lessonId])

  const handleMediaSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSubmitting(true)

    const fd = new FormData(e.currentTarget)
    const body = {
      media_type: fd.get('media_type'),
      title: fd.get('title') || '',
      url: fd.get('url'),
      source_type: fd.get('source_type'),
      order_index: parseInt(fd.get('order_index') as string) || 0,
    }

    try {
      const url = editingMedia
        ? `/api/admin/media/${editingMedia.id}`
        : `/api/admin/lessons/${lessonId}/media`
      const method = editingMedia ? 'PUT' : 'POST'

      await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      setIsMediaModal(false)
      setEditingMedia(null)
      fetchLesson()
    } catch {
      alert('Failed to save media')
    }
    setSubmitting(false)
  }

  const handleDeleteMedia = async (mediaId: string) => {
    await fetch(`/api/admin/media/${mediaId}`, { method: 'DELETE' })
    setDeletingMediaId(null)
    fetchLesson()
  }

  /* ─── Loading / Error states ───────────────────────────────────────── */

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 w-64 bg-gray-200 dark:bg-gray-700 rounded" />
        <div className="h-4 w-96 bg-gray-200 dark:bg-gray-700 rounded" />
        <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded-2xl" />
      </div>
    )
  }

  if (!lesson) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Lesson not found</p>
        <Link href="/admin/lessons">
          <Button variant="primary" className="mt-4 bg-indigo-600">
            Back to Lessons
          </Button>
        </Link>
      </div>
    )
  }

  /* ─── Render ───────────────────────────────────────────────────────── */

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <Link
          href="/admin/lessons"
          className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 mb-4"
        >
          <ArrowLeftIcon className="h-4 w-4" /> Back to Lessons
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{lesson.title}</h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {lesson.sections?.courses?.title} → {lesson.sections?.title}
            </p>
          </div>
          <div className="flex gap-2">
            <span
              className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium capitalize ${
                MEDIA_TYPE_COLORS[lesson.lesson_type] || 'bg-gray-100 text-gray-700'
              }`}
            >
              {lesson.lesson_type}
            </span>
            {lesson.is_free && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300">
                Free
              </span>
            )}
          </div>
        </div>
      </div>

      {/* ── Media Manager ──────────────────────────────────────────────── */}
      <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-800">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Media Files ({lesson.lesson_media?.length ?? 0})
          </h2>
          <Button
            variant="primary"
            size="sm"
            onClick={() => {
              setEditingMedia(null)
              setIsMediaModal(true)
            }}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700"
          >
            <PlusIcon className="h-4 w-4" /> Add Media
          </Button>
        </div>

        <div className="divide-y divide-gray-200 dark:divide-gray-800">
          {(lesson.lesson_media?.length ?? 0) > 0 ? (
            lesson.lesson_media.map((media) => {
              const Icon = MEDIA_TYPE_ICONS[media.media_type] || DocumentIcon
              return (
                <div
                  key={media.id}
                  className="flex items-center gap-4 p-4 hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors"
                >
                  <div
                    className={`h-10 w-10 rounded-lg flex items-center justify-center ${
                      MEDIA_TYPE_COLORS[media.media_type] || 'bg-gray-100'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {media.title || media.url}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs text-gray-500 capitalize">
                        {media.source_type?.replace('_', ' ')}
                      </span>
                      <span className="text-xs text-gray-400">•</span>
                      <span className="text-xs text-gray-500 capitalize">{media.media_type}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <a
                      href={media.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-lg text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors"
                    >
                      <ArrowTopRightOnSquareIcon className="h-4 w-4" />
                    </a>
                    <button
                      onClick={() => {
                        setEditingMedia(media)
                        setIsMediaModal(true)
                      }}
                      className="p-2 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                    >
                      <PencilSquareIcon className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setDeletingMediaId(media.id)}
                      className="p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )
            })
          ) : (
            <div className="p-12 text-center">
              <MusicalNoteIcon className="mx-auto h-12 w-12 text-gray-300 dark:text-gray-600" />
              <p className="mt-4 text-sm text-gray-500">No media files yet</p>
              <Button
                variant="primary"
                size="sm"
                onClick={() => setIsMediaModal(true)}
                className="mt-4 bg-indigo-600"
              >
                Add First Media
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* ── Vocabularies ────────────────────────────────────────────────── */}
      {(lesson.vocabularies?.length ?? 0) > 0 && (
        <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
          <div className="p-6 border-b border-gray-200 dark:border-gray-800">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Vocabulary ({lesson.vocabularies.length})
            </h2>
          </div>
          <div className="divide-y divide-gray-200 dark:divide-gray-800">
            {lesson.vocabularies.map((v) => (
              <div key={v.id} className="p-4">
                <div className="flex items-baseline gap-3">
                  <span className="text-sm font-semibold text-gray-900 dark:text-white">
                    {v.word}
                  </span>
                  {v.phonetic && <span className="text-xs text-gray-400">/{v.phonetic}/</span>}
                </div>
                {v.meaning_vi && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{v.meaning_vi}</p>
                )}
                {v.example_sentence && (
                  <p className="text-xs text-gray-500 italic mt-1">
                    &ldquo;{v.example_sentence}&rdquo;
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Add / Edit Media Modal ──────────────────────────────────────── */}
      <Modal
        open={isMediaModal}
        onClose={() => {
          setIsMediaModal(false)
          setEditingMedia(null)
        }}
        title={editingMedia ? 'Edit Media' : 'Add Media'}
        size="md"
      >
        <form onSubmit={handleMediaSubmit} className="space-y-4">
          <Select
            name="media_type"
            label="Type *"
            defaultValue={editingMedia?.media_type ?? 'audio'}
            options={MEDIA_TYPES}
          />
          <Input
            name="title"
            label="Title"
            defaultValue={editingMedia?.title ?? ''}
            placeholder="e.g. Main Audio, Transcript PDF"
          />
          <Input
            name="url"
            label="URL *"
            defaultValue={editingMedia?.url ?? ''}
            required
            placeholder="Google Drive share link or direct URL"
          />
          <div className="grid grid-cols-2 gap-4">
            <Select
              name="source_type"
              label="Source"
              defaultValue={editingMedia?.source_type ?? 'google_drive'}
              options={SOURCE_TYPES}
            />
            <Input
              name="order_index"
              label="Order"
              type="number"
              defaultValue={editingMedia?.order_index ?? 0}
            />
          </div>
          <FormFooter
            onCancel={() => {
              setIsMediaModal(false)
              setEditingMedia(null)
            }}
            submitLabel={editingMedia ? 'Update Media' : 'Add Media'}
            loading={submitting}
          />
        </form>
      </Modal>

      {/* ── Delete Media Confirmation ────────────────────────────────────── */}
      <Modal
        open={!!deletingMediaId}
        onClose={() => setDeletingMediaId(null)}
        title="Delete Media"
        size="sm"
      >
        <p className="text-sm text-gray-600 dark:text-gray-400">
          This will permanently remove this media file from the lesson.
        </p>
        <div className="flex justify-end gap-3 mt-6">
          <button
            type="button"
            onClick={() => setDeletingMediaId(null)}
            className="inline-flex h-9 items-center justify-center rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => deletingMediaId && handleDeleteMedia(deletingMediaId)}
            className="inline-flex h-9 items-center justify-center rounded-xl px-4 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 transition-colors"
          >
            Delete Media
          </button>
        </div>
      </Modal>
    </div>
  )
}
