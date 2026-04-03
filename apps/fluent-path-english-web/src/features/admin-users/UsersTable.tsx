'use client'

import { useState } from 'react'
import { DataTable } from '@/components/ui/data-table'
import { Modal } from '@/components/ui/modal'
import { Select } from '@/components/ui/form'
import { useAdminTable } from '@/hooks/useAdminTable'
import { getUserColumns, User } from './columns'
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline'

export function UsersTable() {
  const {
    data: users,
    total,
    loading,
    isFetching,
    page,
    pageSize,
    setPage,
    setPageSize,
    search,
    setSearch,
    filters,
    setFilter,
    refresh,
  } = useAdminTable<User>('/api/admin/users')

  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [saving, setSaving] = useState(false)

  const handleUpdateRole = async (user: User) => {
    setSaving(true)
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, role: user.role }),
      })
      const data = await res.json()
      if (data.success) {
        setEditingUser(null)
        refresh()
      }
    } finally {
      setSaving(false)
    }
  }

  const columns = getUserColumns({ onEdit: setEditingUser })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">User Management</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Manage user accounts and permissions. {total > 0 && `${total} users total.`}
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <MagnifyingGlassIcon className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="search"
            placeholder="Search users by email or name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="block h-10 w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 pl-9 pr-3 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
          />
        </div>
        <select
          value={filters.role ?? 'all'}
          onChange={(e) => setFilter('role', e.target.value)}
          className="h-10 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 text-sm text-gray-700 dark:text-gray-300"
        >
          <option value="all">All Users</option>
          <option value="admin">Admin Users</option>
          <option value="user">Regular Users</option>
        </select>
      </div>

      {/* Table */}
      <DataTable
        columns={columns}
        data={users}
        loading={loading || isFetching}
        pagination={{ page, pageSize, total, onPageChange: setPage, onPageSizeChange: setPageSize }}
      />

      {/* Edit User Role Modal */}
      <Modal open={!!editingUser} onClose={() => setEditingUser(null)} title="Edit User Role">
        {editingUser && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-700">
              <div className="h-12 w-12 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center shrink-0">
                <span className="text-lg font-semibold text-indigo-600 dark:text-indigo-400">
                  {editingUser.full_name?.charAt(0) || editingUser.email.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <p className="font-medium text-gray-900 dark:text-white">
                  {editingUser.full_name || 'No name'}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">{editingUser.email}</p>
              </div>
            </div>

            <Select
              label="User Role"
              value={editingUser.role}
              onChange={(e) =>
                setEditingUser({ ...editingUser, role: e.target.value as 'admin' | 'user' })
              }
              options={[
                {
                  value: 'user',
                  label: 'Regular User — Can access courses and learning materials',
                },
                { value: 'admin', label: 'Admin — Full access to admin panel and all features' },
              ]}
              helperText="Changing roles will affect what the user can access in the system"
            />
          </div>
        )}

        <div className="flex gap-3 mt-6 pt-5 border-t border-gray-100 dark:border-gray-800">
          <button
            type="button"
            onClick={() => editingUser && handleUpdateRole(editingUser)}
            disabled={saving}
            className="flex-1 inline-flex h-9 items-center justify-center rounded-xl bg-indigo-600 hover:bg-indigo-700 px-4 text-sm font-semibold text-white transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {saving ? 'Saving...' : 'Update Role'}
          </button>
          <button
            type="button"
            onClick={() => setEditingUser(null)}
            className="flex-1 inline-flex h-9 items-center justify-center rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            Cancel
          </button>
        </div>
      </Modal>
    </div>
  )
}
