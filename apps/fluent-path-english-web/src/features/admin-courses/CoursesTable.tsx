'use client'

import { useState, useCallback } from 'react'
import Image from 'next/image'
import { DataTable } from '@/components/ui/data-table'
import { Modal } from '@/components/ui/modal'
import { Input, Select, Textarea, FormFooter } from '@/components/ui/form'
import { useAdminTable } from '@/hooks/useAdminTable'
import { getCourseColumns } from './columns'
import { Course } from 'my-libs'
import { PlusIcon, MagnifyingGlassIcon, PhotoIcon, XMarkIcon } from '@heroicons/react/24/outline'

/* ─── Constants ──────────────────────────────────────────────────────────── */

const LEVELS = [
  { value: 'all', label: 'All Levels' },
  { value: 'beginner', label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', label: 'Advanced' },
]

const STATUSES = [
  { value: 'all', label: 'All Status' },
  { value: 'draft', label: 'Draft' },
  { value: 'published', label: 'Published' },
  { value: 'archived', label: 'Archived' },
]

const SORT_OPTIONS = [
  { value: 'order_index', label: 'Order Index' },
  { value: 'title', label: 'Title A→Z' },
  { value: 'created_at', label: 'Newest First' },
  { value: 'enrolled_count', label: 'Most Enrolled' },
]

/* ─── Component ──────────────────────────────────────────────────────────── */

export function CoursesTable() {
  const {
    data: courses,
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
  } = useAdminTable<Course>('/api/admin/courses')

  // Local filter for sort (passed as extra param)
  const [sortBy, setSortBy] = useState('order_index')

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingCourse, setEditingCourse] = useState<Course | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null)
  const [uploadError, setUploadError] = useState<string | null>(null)

  const closeModal = () => {
    setIsModalOpen(false)
    setEditingCourse(null)
    setUploadedUrl(null)
    setUploadError(null)
  }

  const handleImageUpload = useCallback(async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setUploadError('Only image files are supported')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      setUploadError('Image must be under 5MB')
      return
    }
    setUploadingImage(true)
    setUploadError(null)
    const fd = new FormData()
    fd.append('file', file)
    try {
      const res = await fetch('/api/upload/image', { method: 'POST', body: fd })
      const json = await res.json()
      if (json.success) setUploadedUrl(json.data.url)
      else setUploadError(json.error || 'Upload failed')
    } catch {
      setUploadError('Connection error during upload')
    } finally {
      setUploadingImage(false)
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSubmitting(true)
    const fd = new FormData(e.currentTarget)
    const thumbnail_url = uploadedUrl || (fd.get('thumbnail_url') as string) || null
    const body = {
      title: fd.get('title'),
      description: fd.get('description') || '',
      level: fd.get('level'),
      status: fd.get('status'),
      order_index: parseInt(fd.get('order_index') as string) || 0,
      price: parseInt(fd.get('price') as string) || 0,
      original_price: parseInt(fd.get('original_price') as string) || 0,
      thumbnail_url: thumbnail_url || editingCourse?.thumbnail_url || null,
    }
    try {
      const url = editingCourse ? `/api/admin/courses/${editingCourse.id}` : '/api/admin/courses'
      const res = await fetch(url, {
        method: editingCourse ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const json = await res.json()
      if (json.success) {
        closeModal()
        refresh()
      } else alert(json.error)
    } catch {
      alert('Failed to save')
    }
    setSubmitting(false)
  }

  const handleDelete = async (id: string) => {
    await fetch(`/api/admin/courses/${id}`, { method: 'DELETE' })
    setDeletingId(null)
    refresh()
  }

  const columns = getCourseColumns({
    onEdit: (c) => {
      setEditingCourse(c)
      setUploadedUrl(null)
      setIsModalOpen(true)
    },
    onDelete: setDeletingId,
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Courses</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{total} courses total</p>
        </div>
        <button
          onClick={() => {
            setEditingCourse(null)
            setIsModalOpen(true)
          }}
          className="inline-flex items-center gap-2 h-10 rounded-xl bg-indigo-600 hover:bg-indigo-700 px-4 text-sm font-semibold text-white transition-colors"
        >
          <PlusIcon className="h-4 w-4" /> New Course
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <MagnifyingGlassIcon className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="search"
            placeholder="Search courses..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="block h-10 w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 pl-9 pr-3 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
          />
        </div>
        {[
          { value: filters.level ?? 'all', options: LEVELS, key: 'level' },
          { value: filters.status ?? 'all', options: STATUSES, key: 'status' },
        ].map(({ value, options, key }) => (
          <select
            key={key}
            value={value}
            onChange={(e) => setFilter(key, e.target.value)}
            className="h-10 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 text-sm text-gray-700 dark:text-gray-300"
          >
            {options.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        ))}
        <select
          value={sortBy}
          onChange={(e) => {
            setSortBy(e.target.value)
            setFilter('sort', e.target.value)
          }}
          className="h-10 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 text-sm text-gray-700 dark:text-gray-300"
        >
          {SORT_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>

      {/* Table */}
      <DataTable
        columns={columns}
        data={courses}
        loading={loading || isFetching}
        pagination={{ page, pageSize, total, onPageChange: setPage, onPageSizeChange: setPageSize }}
      />

      {/* Create/Edit Modal */}
      <Modal
        open={isModalOpen}
        onClose={closeModal}
        title={editingCourse ? 'Edit Course' : 'New Course'}
        size="lg"
      >
        <form key={editingCourse?.id || 'new'} onSubmit={handleSubmit} className="space-y-4">
          <Input
            name="title"
            label="Title *"
            defaultValue={editingCourse?.title ?? ''}
            required
            placeholder="e.g. TAEnglish Original Course"
          />
          <Textarea
            name="description"
            label="Description"
            defaultValue={editingCourse?.description ?? ''}
            placeholder="Course description..."
          />
          <div className="grid grid-cols-2 gap-4">
            <Select
              name="level"
              label="Level *"
              defaultValue={editingCourse?.level ?? 'beginner'}
              options={LEVELS.filter((l) => l.value !== 'all')}
            />
            <Select
              name="status"
              label="Status *"
              defaultValue={editingCourse?.status ?? 'draft'}
              options={STATUSES.filter((s) => s.value !== 'all')}
            />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <Input
              name="order_index"
              label="Order"
              type="number"
              defaultValue={editingCourse?.order_index ?? 0}
            />
            <Input
              name="price"
              label="Price (VND)"
              type="number"
              defaultValue={(editingCourse as Course & { price?: number })?.price ?? 0}
            />
            <Input
              name="original_price"
              label="Original Price"
              type="number"
              defaultValue={
                (editingCourse as Course & { original_price?: number })?.original_price ?? 0
              }
            />
          </div>

          {/* Thumbnail upload */}
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Thumbnail Image</p>
            <label
              className={`relative overflow-hidden flex flex-col items-center justify-center w-full h-24 rounded-xl border-2 border-dashed cursor-pointer transition-all ${
                dragOver
                  ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
                  : 'border-gray-300 dark:border-gray-700 hover:border-indigo-400 hover:bg-gray-50 dark:hover:bg-gray-800/50'
              }`}
              onDragOver={(e) => {
                e.preventDefault()
                setDragOver(true)
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => {
                e.preventDefault()
                setDragOver(false)
                const f = e.dataTransfer.files[0]
                if (f) handleImageUpload(f)
              }}
            >
              <input
                type="file"
                className="hidden"
                accept="image/*"
                onChange={(e) => {
                  const f = e.target.files?.[0]
                  if (f) handleImageUpload(f)
                }}
              />
              {uploadingImage ? (
                <div className="flex flex-col items-center gap-1">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600" />
                  <span className="text-xs text-gray-500">Uploading...</span>
                </div>
              ) : uploadedUrl || editingCourse?.thumbnail_url ? (
                <Image
                  src={uploadedUrl || editingCourse?.thumbnail_url || ''}
                  alt="Thumbnail preview"
                  fill
                  className="object-cover rounded-xl"
                />
              ) : (
                <div className="flex flex-col items-center gap-1 text-center">
                  <PhotoIcon className="h-6 w-6 text-gray-400" />
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    Drag & drop or click to upload
                  </span>
                  <span className="text-xs text-gray-400">JPG, PNG, WebP · Max 5MB</span>
                </div>
              )}
            </label>
            {uploadError && (
              <p className="text-xs text-red-500 flex items-center gap-1">
                <XMarkIcon className="h-3 w-3" /> {uploadError}
              </p>
            )}
            <Input
              key={uploadedUrl ?? editingCourse?.thumbnail_url ?? 'thumb'}
              name="thumbnail_url"
              label="Or enter Thumbnail URL"
              defaultValue={uploadedUrl ?? editingCourse?.thumbnail_url ?? ''}
              placeholder="https://res.cloudinary.com/..."
            />
          </div>

          <FormFooter
            onCancel={closeModal}
            submitLabel={editingCourse ? 'Update Course' : 'Create Course'}
            loading={submitting}
          />
        </form>
      </Modal>

      {/* Delete Modal */}
      <Modal
        open={!!deletingId}
        onClose={() => setDeletingId(null)}
        title="Delete Course"
        size="sm"
      >
        <p className="text-sm text-gray-600 dark:text-gray-400">
          This will permanently delete the course, all its sections, lessons, and media. This action
          cannot be undone.
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
            Delete Course
          </button>
        </div>
      </Modal>
    </div>
  )
}
