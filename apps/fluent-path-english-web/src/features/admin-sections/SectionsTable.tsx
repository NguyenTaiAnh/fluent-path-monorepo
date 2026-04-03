'use client'

import { useState, useEffect } from 'react'
import { DataTable } from '@/components/ui/data-table'
import { Modal } from '@/components/ui/modal'
import { Input, Select, Textarea, FormFooter } from '@/components/ui/form'
import { useAdminTable } from '@/hooks/useAdminTable'
import { getSectionColumns } from './columns'
import { SectionItem, CourseRef } from '@/types/admin'
import { PlusIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline'

export function SectionsTable() {
  const {
    data: sections,
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
  } = useAdminTable<SectionItem>('/api/admin/sections')

  const [courses, setCourses] = useState<CourseRef[]>([])
  useEffect(() => {
    fetch('/api/admin/courses?pageSize=100')
      .then((r) => r.json())
      .then((j) => {
        if (j.success) setCourses(j.data)
      })
  }, [])

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingSection, setEditingSection] = useState<SectionItem | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const courseOptions = courses.map((c) => ({ value: c.id, label: c.title }))

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSubmitting(true)
    const fd = new FormData(e.currentTarget)
    const body = {
      course_id: fd.get('course_id'),
      title: fd.get('title'),
      description: fd.get('description') || '',
      order_index: parseInt(fd.get('order_index') as string) || 0,
    }
    try {
      const url = editingSection
        ? `/api/admin/sections/${editingSection.id}`
        : '/api/admin/sections'
      const res = await fetch(url, {
        method: editingSection ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const json = await res.json()
      if (json.success) {
        setIsModalOpen(false)
        setEditingSection(null)
        refresh()
      } else {
        alert(json.error)
      }
    } catch {
      alert('Failed to save')
    }
    setSubmitting(false)
  }

  const handleDelete = async (id: string) => {
    await fetch(`/api/admin/sections/${id}`, { method: 'DELETE' })
    setDeletingId(null)
    refresh()
  }

  const columns = getSectionColumns({
    onEdit: (s) => {
      setEditingSection(s)
      setIsModalOpen(true)
    },
    onDelete: setDeletingId,
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Sections</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Manage sections within courses
          </p>
        </div>
        <button
          onClick={() => {
            setEditingSection(null)
            setIsModalOpen(true)
          }}
          className="inline-flex items-center gap-2 h-10 rounded-xl bg-indigo-600 hover:bg-indigo-700 px-4 text-sm font-semibold text-white transition-colors"
        >
          <PlusIcon className="h-4 w-4" /> New Section
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <MagnifyingGlassIcon className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="search"
            placeholder="Search sections..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="block h-10 w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 pl-9 pr-3 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
          />
        </div>
        <select
          value={filters.course_id ?? 'all'}
          onChange={(e) => setFilter('course_id', e.target.value)}
          className="h-10 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 text-sm text-gray-700 dark:text-gray-300"
        >
          <option value="all">All Courses</option>
          {courses.map((c) => (
            <option key={c.id} value={c.id}>
              {c.title}
            </option>
          ))}
        </select>
      </div>

      {/* Table */}
      <DataTable
        columns={columns}
        data={sections}
        loading={loading || isFetching}
        pagination={{
          page,
          pageSize,
          total,
          onPageChange: setPage,
          onPageSizeChange: setPageSize,
        }}
      />

      {/* Create / Edit Modal */}
      <Modal
        open={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setEditingSection(null)
        }}
        title={editingSection ? 'Edit Section' : 'New Section'}
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Select
            name="course_id"
            label="Course *"
            defaultValue={editingSection?.course_id ?? courses[0]?.id ?? ''}
            options={courseOptions}
          />
          <Input name="title" label="Title *" defaultValue={editingSection?.title ?? ''} required />
          <Textarea
            name="description"
            label="Description"
            defaultValue={editingSection?.description ?? ''}
          />
          <Input
            name="order_index"
            label="Order"
            type="number"
            defaultValue={editingSection?.order_index ?? 0}
          />
          <FormFooter
            onCancel={() => {
              setIsModalOpen(false)
              setEditingSection(null)
            }}
            submitLabel={editingSection ? 'Update Section' : 'Create Section'}
            loading={submitting}
          />
        </form>
      </Modal>

      {/* Delete Modal */}
      <Modal
        open={!!deletingId}
        onClose={() => setDeletingId(null)}
        title="Delete Section"
        size="sm"
      >
        <p className="text-sm text-gray-600 dark:text-gray-400">
          This will permanently delete the section and all lessons within it. This action cannot be
          undone.
        </p>
        <div className="flex justify-end gap-3 mt-6">
          <button
            type="button"
            onClick={() => setDeletingId(null)}
            className="inline-flex h-9 items-center justify-center rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => deletingId && handleDelete(deletingId)}
            className="inline-flex h-9 items-center justify-center rounded-xl px-4 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 transition-colors"
          >
            Delete Section
          </button>
        </div>
      </Modal>
    </div>
  )
}
