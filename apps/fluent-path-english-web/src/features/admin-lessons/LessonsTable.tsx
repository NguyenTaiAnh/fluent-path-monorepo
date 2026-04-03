'use client'

import { useState, useEffect } from 'react'
import { DataTable } from '@/components/ui/data-table'
import { Modal } from '@/components/ui/modal'
import { Input, Select, Textarea, FormFooter } from '@/components/ui/form'
import { useAdminTable } from '@/hooks/useAdminTable'
import { getLessonColumns } from './columns'
import { LessonItem, CourseRef, SectionRef } from '@/types/admin'
import { PlusIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline'

/* ─── Constants ──────────────────────────────────────────────────────────── */

const LESSON_TYPES = [
  { value: 'all', label: 'All Types' },
  { value: 'listen', label: '🎧 Listen' },
  { value: 'slow', label: '🐢 Slow' },
  { value: 'read', label: '📖 Read' },
  { value: 'analysis', label: '🔍 Analysis' },
  { value: 'vocab', label: '📝 Vocabulary' },
  { value: 'video', label: '🎬 Video' },
  { value: 'quiz', label: '❓ Quiz' },
  { value: 'mixed', label: '🔀 Mixed' },
]

/* ─── Component ──────────────────────────────────────────────────────────── */

export function LessonsTable() {
  const {
    data: lessons,
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
  } = useAdminTable<LessonItem>('/api/admin/lessons')

  // Meta for dropdowns
  const [courses, setCourses] = useState<CourseRef[]>([])
  const [sections, setSections] = useState<SectionRef[]>([])
  useEffect(() => {
    Promise.all([
      fetch('/api/admin/courses?pageSize=100').then((r) => r.json()),
      fetch('/api/admin/sections?pageSize=100').then((r) => r.json()),
    ]).then(([cj, sj]) => {
      if (cj.success) setCourses(cj.data)
      if (sj.success) setSections(sj.data)
    })
  }, [])

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingLesson, setEditingLesson] = useState<LessonItem | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const openEdit = (lesson: LessonItem) => {
    setEditingLesson(lesson)
    setIsModalOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSubmitting(true)
    const fd = new FormData(e.currentTarget)
    const body = {
      section_id: fd.get('section_id'),
      title: fd.get('title'),
      description: fd.get('description') || '',
      lesson_type: fd.get('lesson_type'),
      order_index: parseInt(fd.get('order_index') as string) || 0,
      is_free: fd.get('is_free') === 'on',
      is_published: true,
    }
    try {
      const url = editingLesson ? `/api/admin/lessons/${editingLesson.id}` : '/api/admin/lessons'
      const res = await fetch(url, {
        method: editingLesson ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const json = await res.json()
      if (json.success) {
        setIsModalOpen(false)
        setEditingLesson(null)
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
    await fetch(`/api/admin/lessons/${id}`, { method: 'DELETE' })
    setDeletingId(null)
    refresh()
  }

  const columns = getLessonColumns({ onEdit: openEdit, onDelete: setDeletingId })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Lessons</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{total} lessons total</p>
        </div>
        <button
          onClick={() => {
            setEditingLesson(null)
            setIsModalOpen(true)
          }}
          className="inline-flex items-center gap-2 h-10 rounded-xl bg-indigo-600 hover:bg-indigo-700 px-4 text-sm font-semibold text-white transition-colors"
        >
          <PlusIcon className="h-4 w-4" /> New Lesson
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <MagnifyingGlassIcon className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="search"
            placeholder="Search lessons..."
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
        <select
          value={filters.type ?? 'all'}
          onChange={(e) => setFilter('type', e.target.value)}
          className="h-10 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 text-sm text-gray-700 dark:text-gray-300"
        >
          {LESSON_TYPES.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>
      </div>

      {/* Table */}
      <DataTable
        columns={columns}
        data={lessons}
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
          setEditingLesson(null)
        }}
        title={editingLesson ? 'Edit Lesson' : 'New Lesson'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Select
            name="section_id"
            label="Section *"
            defaultValue={editingLesson?.section_id ?? sections[0]?.id ?? ''}
            options={sections.map((s) => ({
              value: s.id,
              label: `${s.courses?.title ?? ''} → ${s.title}`,
            }))}
          />
          <Input name="title" label="Title *" defaultValue={editingLesson?.title ?? ''} required />
          <Textarea name="description" label="Description" defaultValue="" />
          <div className="grid grid-cols-2 gap-4">
            <Select
              name="lesson_type"
              label="Type *"
              defaultValue={editingLesson?.lesson_type ?? 'listen'}
              options={LESSON_TYPES.filter((t) => t.value !== 'all')}
            />
            <Input
              name="order_index"
              label="Order"
              type="number"
              defaultValue={editingLesson?.order_index ?? 0}
            />
          </div>
          <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
            <input
              type="checkbox"
              name="is_free"
              defaultChecked={editingLesson?.is_free ?? false}
              className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
            />
            Free Preview
          </label>
          <FormFooter
            onCancel={() => {
              setIsModalOpen(false)
              setEditingLesson(null)
            }}
            submitLabel={editingLesson ? 'Update Lesson' : 'Create Lesson'}
            loading={submitting}
          />
        </form>
      </Modal>

      {/* Delete Modal */}
      <Modal
        open={!!deletingId}
        onClose={() => setDeletingId(null)}
        title="Delete Lesson"
        size="sm"
      >
        <p className="text-sm text-gray-600 dark:text-gray-400">
          This will permanently delete the lesson and all media within it. This action cannot be
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
            Delete Lesson
          </button>
        </div>
      </Modal>
    </div>
  )
}
