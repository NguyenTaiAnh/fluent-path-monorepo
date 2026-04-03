'use client'

import { ColumnDef } from '@tanstack/react-table'
import Link from 'next/link'
import { LessonItem } from '@/types/admin'
import {
  PencilSquareIcon,
  TrashIcon,
  EyeIcon,
  PaperClipIcon,
  MusicalNoteIcon,
} from '@heroicons/react/24/outline'

export const TYPE_COLORS: Record<string, string> = {
  listen: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300',
  slow: 'bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300',
  read: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300',
  analysis: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300',
  vocab: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300',
  video: 'bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300',
  quiz: 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300',
  mixed: 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300',
}

interface LessonColumnsProps {
  onEdit: (lesson: LessonItem) => void
  onDelete: (id: string) => void
}

export function getLessonColumns({
  onEdit,
  onDelete,
}: LessonColumnsProps): ColumnDef<LessonItem, unknown>[] {
  return [
    {
      id: 'lesson',
      header: 'Lesson',
      cell: ({ row }) => {
        const lesson = row.original
        return (
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center shrink-0">
              <MusicalNoteIcon className="h-4 w-4 text-amber-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">{lesson.title}</p>
              {lesson.is_free && (
                <span className="text-xs text-emerald-600 font-medium">Free Preview</span>
              )}
            </div>
          </div>
        )
      },
    },
    {
      id: 'course_section',
      header: 'Course / Section',
      cell: ({ row }) => {
        const lesson = row.original
        return (
          <div>
            <p className="text-sm text-gray-900 dark:text-white">
              {lesson.sections?.courses?.title ?? '—'}
            </p>
            <p className="text-xs text-gray-500">{lesson.sections?.title ?? '—'}</p>
          </div>
        )
      },
    },
    {
      id: 'type',
      header: () => <span className="block text-center">Type</span>,
      cell: ({ row }) => {
        const type = row.original.lesson_type
        return (
          <div className="flex justify-center">
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${TYPE_COLORS[type] ?? TYPE_COLORS.mixed}`}
            >
              {type}
            </span>
          </div>
        )
      },
      size: 100,
    },
    {
      id: 'media',
      header: () => <span className="block text-center">Media</span>,
      cell: ({ row }) => (
        <div className="flex justify-center">
          <span className="inline-flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
            <PaperClipIcon className="h-3.5 w-3.5" />
            {row.original.lesson_media?.[0]?.count ?? 0}
          </span>
        </div>
      ),
      size: 80,
    },
    {
      id: 'order',
      header: () => <span className="block text-center">Order</span>,
      cell: ({ row }) => (
        <div className="text-center text-sm text-gray-700 dark:text-gray-300">
          {row.original.order_index}
        </div>
      ),
      size: 80,
    },
    {
      id: 'actions',
      header: () => <span className="block text-right">Actions</span>,
      cell: ({ row }) => {
        const lesson = row.original
        return (
          <div className="flex justify-end gap-1">
            <Link href={`/admin/lessons/${lesson.id}`}>
              <button
                className="p-2 rounded-lg text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors"
                title="Manage media"
              >
                <EyeIcon className="h-4 w-4" />
              </button>
            </Link>
            <button
              onClick={() => onEdit(lesson)}
              className="p-2 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
            >
              <PencilSquareIcon className="h-4 w-4" />
            </button>
            <button
              onClick={() => onDelete(lesson.id)}
              className="p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
            >
              <TrashIcon className="h-4 w-4" />
            </button>
          </div>
        )
      },
      size: 120,
    },
  ]
}
