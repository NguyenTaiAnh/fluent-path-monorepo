'use client'

import { ColumnDef } from '@tanstack/react-table'
import { SectionItem } from '@/types/admin'
import { PencilSquareIcon, TrashIcon, DocumentTextIcon } from '@heroicons/react/24/outline'

interface SectionColumnsProps {
  onEdit: (section: SectionItem) => void
  onDelete: (id: string) => void
}

export function getSectionColumns({
  onEdit,
  onDelete,
}: SectionColumnsProps): ColumnDef<SectionItem, unknown>[] {
  return [
    {
      id: 'section',
      header: 'Section',
      cell: ({ row }) => {
        const section = row.original
        return (
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center shrink-0">
              <DocumentTextIcon className="h-4 w-4 text-emerald-600" />
            </div>
            <p className="text-sm font-medium text-gray-900 dark:text-white">{section.title}</p>
          </div>
        )
      },
    },
    {
      id: 'course',
      header: 'Course',
      cell: ({ row }) => (
        <span className="text-sm text-gray-600 dark:text-gray-400">
          {row.original.courses?.title ?? '—'}
        </span>
      ),
    },
    {
      id: 'lessons',
      header: () => <span className="block text-center">Lessons</span>,
      cell: ({ row }) => (
        <div className="text-center text-sm text-gray-700 dark:text-gray-300">
          {row.original.total_lessons ?? 0}
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
        const section = row.original
        return (
          <div className="flex justify-end gap-1">
            <button
              onClick={() => onEdit(section)}
              className="p-2 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
            >
              <PencilSquareIcon className="h-4 w-4" />
            </button>
            <button
              onClick={() => onDelete(section.id)}
              className="p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
            >
              <TrashIcon className="h-4 w-4" />
            </button>
          </div>
        )
      },
      size: 100,
    },
  ]
}
