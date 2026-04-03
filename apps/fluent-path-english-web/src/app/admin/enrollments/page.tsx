'use client'

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Select } from '@/components/ui/form'
import { Modal } from '@/components/ui/modal'
import { TableRowSkeleton } from '@/components/ui/Skeleton'
import { PlusIcon, TrashIcon } from '@heroicons/react/24/outline'
import { EnrollmentAdminItem, PartialUserItem, CourseRef } from '@/types/admin'
import { usePagination } from '@/hooks/usePagination'
import { Pagination } from '@/components/ui/Pagination'

/* ─── Types ──────────────────────────────────────────────────────────────── */

const STATUS_COLORS: Record<string, string> = {
  active: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300',
  completed: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300',
  expired: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300',
}

/* ─── Component ──────────────────────────────────────────────────────────── */

export default function AdminEnrollmentsPage() {
  const [enrollments, setEnrollments] = useState<EnrollmentAdminItem[]>([])
  const [users, setUsers] = useState<PartialUserItem[]>([])
  const [courses, setCourses] = useState<CourseRef[]>([])
  const [loading, setLoading] = useState(true)
  const [total, setTotal] = useState(0)
  const [statusFilter, setStatusFilter] = useState('all')
  const [courseFilter, setCourseFilter] = useState('all')

  const { page, setPage, pageSize, setPageSize, resetPage } = usePagination(10)

  useEffect(() => {
    resetPage()
  }, [statusFilter, courseFilter, resetPage])

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const fetchEnrollments = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams()
    if (statusFilter !== 'all') params.set('status', statusFilter)
    if (courseFilter !== 'all') params.set('course_id', courseFilter)
    params.set('page', page.toString())
    params.set('pageSize', pageSize.toString())
    try {
      const res = await fetch(`/api/admin/enrollments?${params}`)
      const json = await res.json()
      if (json.success) {
        setEnrollments(json.data)
        setTotal(json.total || 0)
      }
    } catch (err) {
      console.error('Failed to fetch enrollments:', err)
    }
    setLoading(false)
  }, [statusFilter, courseFilter, page, pageSize])

  useEffect(() => {
    const fetchMeta = async () => {
      const [ur, cr] = await Promise.all([
        fetch('/api/admin/users?pageSize=100'),
        fetch('/api/admin/courses?pageSize=100'),
      ])
      const [uj, cj] = await Promise.all([ur.json(), cr.json()])
      if (uj.success) setUsers(uj.data)
      if (cj.success) setCourses(cj.data)
    }
    fetchMeta()
  }, [])

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      setLoading(true)
      const params = new URLSearchParams()
      if (statusFilter !== 'all') params.set('status', statusFilter)
      if (courseFilter !== 'all') params.set('course_id', courseFilter)
      params.set('page', page.toString())
      params.set('pageSize', pageSize.toString())
      try {
        const res = await fetch(`/api/admin/enrollments?${params}`)
        const json = await res.json()
        if (!cancelled && json.success) {
          setEnrollments(json.data)
          setTotal(json.total || 0)
        }
      } catch (err) {
        if (!cancelled) console.error('Failed to fetch enrollments:', err)
      }
      if (!cancelled) setLoading(false)
    }
    load()
    return () => {
      cancelled = true
    }
  }, [statusFilter, courseFilter, page, pageSize])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSubmitting(true)
    const fd = new FormData(e.currentTarget)
    const body = {
      user_id: fd.get('user_id'),
      course_id: fd.get('course_id'),
      status: 'active',
    }
    try {
      const res = await fetch('/api/admin/enrollments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const json = await res.json()
      if (json.success) {
        setIsModalOpen(false)
        fetchEnrollments()
      } else {
        alert(json.error)
      }
    } catch {
      alert('Failed to assign course')
    }
    setSubmitting(false)
  }

  const handleDelete = async (id: string) => {
    await fetch(`/api/admin/enrollments/${id}`, { method: 'DELETE' })
    setDeletingId(null)
    fetchEnrollments()
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Enrollments</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{total} enrollments</p>
        </div>
        <Button
          variant="primary"
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700"
        >
          <PlusIcon className="h-4 w-4" /> Assign Course
        </Button>
      </div>

      {/* Filters */}
      <div className="flex gap-3">
        <select
          value={courseFilter}
          onChange={(e) => setCourseFilter(e.target.value)}
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
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="h-10 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 text-sm text-gray-700 dark:text-gray-300"
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="completed">Completed</option>
          <option value="expired">Expired</option>
        </select>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
          <thead className="bg-gray-50 dark:bg-gray-800/50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
                User
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
                Course
              </th>
              <th className="px-6 py-3 text-center text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
                Enrolled At
              </th>
              <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
            {loading ? (
              [...Array(5)].map((_, i) => <TableRowSkeleton key={i} />)
            ) : enrollments.length > 0 ? (
              enrollments.map((enrollment) => (
                <tr
                  key={enrollment.id}
                  className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {enrollment.profiles?.avatar_url ? (
                        <Image
                          src={enrollment.profiles.avatar_url}
                          alt=""
                          width={32}
                          height={32}
                          className="h-8 w-8 rounded-full object-cover"
                        />
                      ) : (
                        <div className="h-8 w-8 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-xs font-bold text-indigo-600">
                          {(enrollment.profiles?.full_name || 'U')[0].toUpperCase()}
                        </div>
                      )}
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {enrollment.profiles?.full_name || '—'}
                        </p>
                        <p className="text-xs text-gray-500">{enrollment.profiles?.email || ''}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-gray-900 dark:text-white">
                      {enrollment.courses?.title || '—'}
                    </p>
                    <span className="text-xs text-gray-500 capitalize">
                      {enrollment.courses?.level || ''}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span
                      className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${
                        STATUS_COLORS[enrollment.status] || ''
                      }`}
                    >
                      {enrollment.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                    {new Date(enrollment.enrolled_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => setDeletingId(enrollment.id)}
                      className="p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-sm text-gray-500">
                  No enrollments found
                </td>
              </tr>
            )}
          </tbody>
        </table>

        <Pagination
          page={page}
          pageSize={pageSize}
          total={total}
          setPage={setPage}
          setPageSize={setPageSize}
        />
      </div>

      {/* Assign Modal */}
      <Modal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Assign Course to User"
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Select
            name="user_id"
            label="User *"
            options={users.map((u) => ({
              value: u.id,
              label: `${u.full_name || 'No name'} (${u.email})`,
            }))}
          />
          <Select
            name="course_id"
            label="Course *"
            options={courses.map((c) => ({
              value: c.id,
              label: c.title,
            }))}
          />
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              loading={submitting}
              className="bg-indigo-600 hover:bg-indigo-700"
            >
              Assign
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <Modal
        open={!!deletingId}
        onClose={() => setDeletingId(null)}
        title="Remove Enrollment"
        size="sm"
      >
        <p className="text-sm text-gray-600">Remove this enrollment?</p>
        <div className="flex justify-end gap-3 mt-6">
          <Button variant="ghost" onClick={() => setDeletingId(null)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={() => deletingId && handleDelete(deletingId)}>
            Remove
          </Button>
        </div>
      </Modal>
    </div>
  )
}
