'use client'

import { ColumnDef } from '@tanstack/react-table'
import { PencilIcon, UserGroupIcon, ShieldCheckIcon } from '@heroicons/react/24/outline'

interface User {
  id: string
  email: string
  full_name: string | null
  avatar_url: string | null
  role: 'admin' | 'user'
  created_at: string
  last_sign_in_at: string | null
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

interface UserColumnsProps {
  onEdit: (user: User) => void
}

export function getUserColumns({ onEdit }: UserColumnsProps): ColumnDef<User, unknown>[] {
  return [
    {
      id: 'user',
      header: 'User',
      cell: ({ row }) => {
        const user = row.original
        const initials = user.full_name?.charAt(0) || user.email.charAt(0).toUpperCase()
        return (
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center shrink-0">
              <span className="text-sm font-semibold text-indigo-600 dark:text-indigo-400">
                {initials}
              </span>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {user.full_name || 'No name'}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">{user.email}</p>
            </div>
          </div>
        )
      },
    },
    {
      id: 'role',
      header: 'Role',
      cell: ({ row }) => {
        const role = row.original.role
        return (
          <span
            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${
              role === 'admin'
                ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300'
            }`}
          >
            {role === 'admin' ? (
              <ShieldCheckIcon className="h-3 w-3" />
            ) : (
              <UserGroupIcon className="h-3 w-3" />
            )}
            {role === 'admin' ? 'Admin' : 'User'}
          </span>
        )
      },
      size: 100,
    },
    {
      id: 'joined',
      header: 'Joined',
      cell: ({ row }) => (
        <span className="text-sm text-gray-500 dark:text-gray-400">
          {formatDate(row.original.created_at)}
        </span>
      ),
      size: 130,
    },
    {
      id: 'last_active',
      header: 'Last Active',
      cell: ({ row }) => (
        <span className="text-sm text-gray-500 dark:text-gray-400">
          {row.original.last_sign_in_at ? formatDate(row.original.last_sign_in_at) : 'Never'}
        </span>
      ),
      size: 130,
    },
    {
      id: 'actions',
      header: () => <span className="block text-right">Actions</span>,
      cell: ({ row }) => (
        <div className="flex justify-end">
          <button
            onClick={() => onEdit(row.original)}
            className="p-2 rounded-lg text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors"
            title="Edit role"
          >
            <PencilIcon className="h-4 w-4" />
          </button>
        </div>
      ),
      size: 80,
    },
  ]
}

export type { User }
