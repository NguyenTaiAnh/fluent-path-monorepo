'use client'

import { useState, useCallback, use } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input, Select, Textarea } from '@/components/ui/form'
import { CourseThumbnail } from '@/components/ui/CourseThumbnail'
import {
  ArrowLeftIcon,
  PencilSquareIcon,
  BookOpenIcon,
  UsersIcon,
  ChartBarIcon,
  PhotoIcon,
  XMarkIcon,
  CheckIcon,
  EyeIcon,
} from '@heroicons/react/24/outline'
import useSWR from 'swr'
import { fetcher } from '@/lib/fetcher'
import { Course } from 'my-libs'

const LEVELS = [
  { value: 'beginner', label: 'Beginner' },
  { value: 'elementary', label: 'Elementary' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', label: 'Advanced' },
]

const STATUSES = [
  { value: 'draft', label: 'Draft' },
  { value: 'published', label: 'Published' },
  { value: 'archived', label: 'Archived' },
]

interface CourseDetailData extends Omit<Course, 'sections'> {
  sections?: Array<{
    id: string
    title: string
    order_index: number
    total_lessons: number
    lessons?: Array<{ id: string }>
  }>
}

export default function AdminCourseDetailPage({
  params,
}: {
  params: Promise<{ courseId: string }>
}) {
  const resolvedParams = use(params)
  const courseId = resolvedParams.courseId
  const router = useRouter()
  const { data: response, isLoading, mutate } = useSWR(`/api/admin/courses/${courseId}`, fetcher)
  // API returns { success: true, data: {...} }
  const course: CourseDetailData | null = response?.data ?? null

  const [isEditing, setIsEditing] = useState(false)
  const [saving, setSaving] = useState(false)

  // Thumbnail upload state
  const [uploadingImage, setUploadingImage] = useState(false)
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [dragOver, setDragOver] = useState(false)

  const handleImageUpload = useCallback(
    async (file: File) => {
      if (!file.type.startsWith('image/')) {
        setUploadError('Chỉ hỗ trợ file ảnh (JPG, PNG, WebP)')
        return
      }
      if (file.size > 5 * 1024 * 1024) {
        setUploadError('Ảnh tối đa 5MB')
        return
      }

      setUploadingImage(true)
      setUploadError(null)
      const fd = new FormData()
      fd.append('file', file)
      // Pass old URL so server can delete it from Cloudinary after successful upload
      if (course?.thumbnail_url) {
        fd.append('oldUrl', course.thumbnail_url)
      }

      try {
        const res = await fetch('/api/upload/image', { method: 'POST', body: fd })
        const json = await res.json()
        if (json.success) {
          const newUrl = json.data.url
          setUploadedUrl(newUrl)

          // Auto-save thumbnail to DB immediately — no need to wait for Save form
          const saveRes = await fetch(`/api/admin/courses/${courseId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              title: course?.title,
              description: course?.description || '',
              level: course?.level,
              status: course?.status,
              order_index: course?.order_index ?? 0,
              price: course?.price ?? 0,
              original_price: course?.original_price ?? 0,
              thumbnail_url: newUrl,
            }),
          })
          const saveJson = await saveRes.json()
          if (saveJson.success) {
            setUploadedUrl(null) // clear temp state since it's now in DB
            mutate() // refresh course data from server
          } else {
            setUploadError(saveJson.error || 'Lưu thumbnail thất bại')
          }
        } else {
          setUploadError(json.error || 'Upload thất bại')
        }
      } catch {
        setUploadError('Lỗi kết nối khi upload')
      } finally {
        setUploadingImage(false)
      }
    },
    [courseId, course, mutate],
  )

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSaving(true)
    const fd = new FormData(e.currentTarget)
    const body: Record<string, unknown> = {
      title: fd.get('title'),
      description: fd.get('description') || '',
      level: fd.get('level'),
      status: fd.get('status'),
      order_index: parseInt(fd.get('order_index') as string) || 0,
      price: parseInt(fd.get('price') as string) || 0,
      original_price: parseInt(fd.get('original_price') as string) || 0,
      thumbnail_url: uploadedUrl ?? course?.thumbnail_url ?? '',
    }

    try {
      const res = await fetch(`/api/admin/courses/${courseId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const json = await res.json()
      if (json.success) {
        setIsEditing(false)
        setUploadedUrl(null)
        mutate()
      } else {
        alert(json.error || 'Lưu thất bại')
      }
    } catch {
      alert('Lỗi kết nối')
    } finally {
      setSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600" />
      </div>
    )
  }

  if (!course) {
    return (
      <div className="text-center py-20">
        <BookOpenIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
        <p className="text-gray-500">Course not found</p>
        <Link href="/admin/courses" className="mt-4 inline-block text-indigo-600 hover:underline">
          ← Back to courses
        </Link>
      </div>
    )
  }

  const currentThumbnail = uploadedUrl ?? course.thumbnail_url

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Back + actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            <ArrowLeftIcon className="h-4 w-4" />
            Back to Courses
          </button>
          <Link
            href={`/my-courses/${courseId}`}
            target="_blank"
            className="flex items-center gap-1.5 text-sm text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300 transition-colors"
          >
            <EyeIcon className="h-4 w-4" />
            View Course
          </Link>
        </div>
        <div className="flex gap-2">
          {isEditing ? (
            <Button
              variant="ghost"
              onClick={() => {
                setIsEditing(false)
                setUploadedUrl(null)
                setUploadError(null)
              }}
            >
              Cancel
            </Button>
          ) : (
            <Button
              variant="primary"
              className="flex items-center gap-2 bg-indigo-600"
              onClick={() => setIsEditing(true)}
            >
              <PencilSquareIcon className="h-4 w-4" />
              Edit Course
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column - thumbnail + stats */}
        <div className="lg:col-span-1 space-y-4">
          {/* Thumbnail card */}
          <div className="rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
            <div className="relative h-48 w-full">
              <CourseThumbnail src={currentThumbnail} title={course.title} />
              {uploadedUrl && (
                <div className="absolute top-2 right-2">
                  <span className="flex items-center gap-1 bg-emerald-500 text-white text-xs px-2 py-1 rounded-full">
                    <CheckIcon className="h-3 w-3" /> New
                  </span>
                </div>
              )}
            </div>

            {/* Image upload area — always visible */}
            <div className="p-4 border-t border-gray-100 dark:border-gray-800">
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">
                Thumbnail
              </p>

              {/* Drop zone */}
              <label
                className={`flex flex-col items-center justify-center w-full h-24 rounded-xl border-2 border-dashed cursor-pointer transition-all
                  ${
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
                  const file = e.dataTransfer.files[0]
                  if (file) handleImageUpload(file)
                }}
              >
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) handleImageUpload(file)
                  }}
                />
                {uploadingImage ? (
                  <div className="flex flex-col items-center gap-1">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600" />
                    <span className="text-xs text-gray-500">Đang upload...</span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-1 text-center">
                    <PhotoIcon className="h-6 w-6 text-gray-400" />
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      Click hoặc kéo thả ảnh
                    </span>
                    <span className="text-xs text-gray-400">JPG, PNG, WebP · Max 5MB</span>
                  </div>
                )}
              </label>

              {uploadError && (
                <p className="mt-2 text-xs text-red-500 flex items-center gap-1">
                  <XMarkIcon className="h-3 w-3" /> {uploadError}
                </p>
              )}

              {uploadedUrl && (
                <p className="mt-2 text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  <CheckIcon className="h-3 w-3" /> Ảnh mới đã sẵn sàng — lưu course để áp dụng
                </p>
              )}
            </div>
          </div>

          {/* Stats */}
          <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4 space-y-3">
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
              Statistics
            </p>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg">
                <BookOpenIcon className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
              </div>
              <div>
                <p className="text-lg font-bold text-gray-900 dark:text-white">
                  {course.sections?.reduce((sum, s) => sum + (s.lessons?.length ?? 0), 0) ??
                    course.total_lessons}
                </p>
                <p className="text-xs text-gray-500">Total Lessons</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-50 dark:bg-emerald-900/30 rounded-lg">
                <UsersIcon className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <p className="text-lg font-bold text-gray-900 dark:text-white">
                  {course.enrolled_count}
                </p>
                <p className="text-xs text-gray-500">Enrolled Students</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-50 dark:bg-purple-900/30 rounded-lg">
                <ChartBarIcon className="h-4 w-4 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-lg font-bold text-gray-900 dark:text-white capitalize">
                  {course.level}
                </p>
                <p className="text-xs text-gray-500">Level</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right column - detail / edit form */}
        <div className="lg:col-span-2">
          {isEditing ? (
            <form
              key={course.id}
              onSubmit={handleSave}
              className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 space-y-4"
            >
              <h2 className="text-lg font-bold text-gray-900 dark:text-white pb-2 border-b border-gray-100 dark:border-gray-800">
                Edit Course
              </h2>

              <Input name="title" label="Title *" defaultValue={course.title} required />
              <Textarea
                name="description"
                label="Description"
                defaultValue={course.description ?? ''}
              />

              <div className="grid grid-cols-2 gap-4">
                <Select name="level" label="Level" defaultValue={course.level} options={LEVELS} />
                <Select
                  name="status"
                  label="Status"
                  defaultValue={course.status}
                  options={STATUSES}
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <Input
                  name="order_index"
                  label="Order"
                  type="number"
                  defaultValue={course.order_index}
                />
                <Input name="price" label="Price" type="number" defaultValue={course.price} />
                <Input
                  name="original_price"
                  label="Original Price"
                  type="number"
                  defaultValue={course.original_price}
                />
              </div>

              {/* Thumbnail URL (editable, but upload above is preferred) */}
              <div>
                <Input
                  name="thumbnail_url"
                  label="Thumbnail URL (hoặc upload ảnh bên trái)"
                  defaultValue={uploadedUrl ?? course.thumbnail_url ?? ''}
                  placeholder="https://res.cloudinary.com/..."
                />
                {uploadedUrl && (
                  <p className="mt-1 text-xs text-emerald-600">
                    ✓ Dùng ảnh vừa upload: {uploadedUrl.slice(0, 60)}...
                  </p>
                )}
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-800">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => {
                    setIsEditing(false)
                    setUploadedUrl(null)
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit" variant="primary" loading={saving} className="bg-indigo-600">
                  Save Changes
                </Button>
              </div>
            </form>
          ) : (
            <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 space-y-6">
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {course.title}
                  </h1>
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize
                    ${
                      course.status === 'published'
                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300'
                        : course.status === 'archived'
                          ? 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'
                          : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300'
                    }`}
                  >
                    {course.status}
                  </span>
                </div>
                <p className="text-sm text-gray-500">/{course.slug}</p>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Description
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                  {course.description || (
                    <span className="italic text-gray-400">No description</span>
                  )}
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-4 border-t border-gray-100 dark:border-gray-800">
                {[
                  { label: 'Level', value: course.level },
                  { label: 'Order Index', value: course.order_index },
                  {
                    label: 'Price',
                    value: course.price === 0 ? 'Free' : `${course.price.toLocaleString()} VND`,
                  },
                  {
                    label: 'Original Price',
                    value: `${course.original_price?.toLocaleString() ?? 0} VND`,
                  },
                ].map(({ label, value }) => (
                  <div key={label}>
                    <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                      {label}
                    </p>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white capitalize mt-0.5">
                      {value}
                    </p>
                  </div>
                ))}
              </div>

              {/* Sections list */}
              {course.sections && course.sections.length > 0 && (
                <div className="pt-4 border-t border-gray-100 dark:border-gray-800">
                  <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                    Sections ({course.sections.length})
                  </p>
                  <div className="space-y-2">
                    {course.sections.map((section) => (
                      <div
                        key={section.id}
                        className="flex items-center justify-between px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800/50"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-xs text-gray-400 w-5 text-right">
                            {section.order_index}.
                          </span>
                          <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
                            {section.title}
                          </p>
                        </div>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {section.lessons?.length ?? section.total_lessons} lessons
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
