'use client'

import { ColumnDef } from '@tanstack/react-table'
import Link from 'next/link'
import Image from 'next/image'
import { Course } from 'my-libs'
import { PencilSquareIcon, TrashIcon, EyeIcon, BookOpenIcon } from '@heroicons/react/24/outline'
import { useState } from 'react'

function Thumbnail({ url }: { url: string | null }) {
  const [errored, setErrored] = useState(false)
  const [prevUrl, setPrevUrl] = useState(url)
  if (url !== prevUrl) {
    setPrevUrl(url)
    setErrored(false)
  }
  if (!url || errored) {
    return (
      <div className="h-10 w-10 rounded-lg bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center shrink-0">
        <BookOpenIcon className="h-5 w-5 text-indigo-500" />
      </div>
    )
  }
  return (
    <Image
      src={url}
      alt=""
      width={40}
      height={40}
      className="h-10 w-10 rounded-lg object-cover shrink-0"
      onError={() => setErrored(true)}
    />
  )
}

const STATUS_COLORS: Record<string, string> = {
  published: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300',
  archived: 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300',
  draft: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300',
}

interface CourseColumnsProps {
  onEdit: (course: Course) => void
  onDelete: (id: string) => void
}

export function getCourseColumns({
  onEdit,
  onDelete,
}: CourseColumnsProps): ColumnDef<Course, unknown>[] {
  return [
    {
      id: 'course',
      header: 'Course',
      cell: ({ row }) => {
        const course = row.original
        return (
          <div className="flex items-center gap-3">
            <Thumbnail url={course.thumbnail_url ?? null} />
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">{course.title}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">/{course.slug}</p>
            </div>
          </div>
        )
      },
    },
    {
      id: 'level',
      header: 'Level',
      cell: ({ row }) => (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 capitalize">
          {row.original.level}
        </span>
      ),
      size: 110,
    },
    {
      id: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const status = row.original.status ?? 'draft'
        return (
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${STATUS_COLORS[status] ?? STATUS_COLORS.draft}`}
          >
            {status}
          </span>
        )
      },
      size: 110,
    },
    {
      id: 'lessons',
      header: () => <span className="block text-center">Lessons</span>,
      cell: ({ row }) => (
        <div className="text-center text-sm text-gray-700 dark:text-gray-300">
          {(row.original as Course & { total_lessons?: number }).total_lessons ?? 0}
        </div>
      ),
      size: 90,
    },
    {
      id: 'enrolled',
      header: () => <span className="block text-center">Enrolled</span>,
      cell: ({ row }) => (
        <div className="text-center text-sm text-gray-700 dark:text-gray-300">
          {(row.original as Course & { enrolled_count?: number }).enrolled_count ?? 0}
        </div>
      ),
      size: 90,
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
        const course = row.original
        return (
          <div className="flex justify-end gap-1">
            <Link href={`/admin/courses/${course.id}`}>
              <button
                className="p-2 rounded-lg text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors"
                title="View"
              >
                <EyeIcon className="h-4 w-4" />
              </button>
            </Link>
            <button
              onClick={() => onEdit(course)}
              className="p-2 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
            >
              <PencilSquareIcon className="h-4 w-4" />
            </button>
            <button
              onClick={() => onDelete(course.id)}
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
