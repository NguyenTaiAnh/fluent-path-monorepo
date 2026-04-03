'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { StatCardSkeleton } from '@/components/ui/Skeleton'
import {
  BookOpenIcon,
  UserGroupIcon,
  PlusIcon,
  DocumentTextIcon,
  MusicalNoteIcon,
  TicketIcon,
  ArrowTrendingUpIcon,
  ArrowUpIcon,
} from '@heroicons/react/24/outline'
import Image from 'next/image'

interface DashboardCourse {
  id: string
  title: string
  level: string
  status: string
  thumbnail_url?: string
  total_lessons?: number
  enrolled_count?: number
}

interface DashboardData {
  stats: {
    totalUsers: number
    totalCourses: number
    totalSections: number
    totalLessons: number
    totalEnrollments: number
    newUsersThisWeek: number
    newEnrollmentsThisWeek: number
  }
  recentCourses: DashboardCourse[]
  recentActivity: Record<string, unknown>[]
  topCourses: DashboardCourse[]
}

export default function AdminDashboard() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/admin/dashboard')
      const json = await res.json()
      if (json.success) {
        setData(json.data)
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const stats = data?.stats

  const statCards = [
    {
      title: 'Users',
      value: stats?.totalUsers ?? 0,
      badge: stats?.newUsersThisWeek ? `+${stats.newUsersThisWeek} this week` : null,
      icon: UserGroupIcon,
      gradient: 'from-violet-500 to-purple-600',
      bgLight: 'bg-violet-50 dark:bg-violet-900/20',
      href: '/admin/users',
    },
    {
      title: 'Courses',
      value: stats?.totalCourses ?? 0,
      badge: null,
      icon: BookOpenIcon,
      gradient: 'from-blue-500 to-cyan-500',
      bgLight: 'bg-blue-50 dark:bg-blue-900/20',
      href: '/admin/courses',
    },
    {
      title: 'Sections',
      value: stats?.totalSections ?? 0,
      badge: null,
      icon: DocumentTextIcon,
      gradient: 'from-emerald-500 to-teal-500',
      bgLight: 'bg-emerald-50 dark:bg-emerald-900/20',
      href: '/admin/sections',
    },
    {
      title: 'Lessons',
      value: stats?.totalLessons ?? 0,
      badge: null,
      icon: MusicalNoteIcon,
      gradient: 'from-amber-500 to-orange-500',
      bgLight: 'bg-amber-50 dark:bg-amber-900/20',
      href: '/admin/lessons',
    },
    {
      title: 'Enrollments',
      value: stats?.totalEnrollments ?? 0,
      badge: stats?.newEnrollmentsThisWeek ? `+${stats.newEnrollmentsThisWeek} this week` : null,
      icon: TicketIcon,
      gradient: 'from-rose-500 to-pink-500',
      bgLight: 'bg-rose-50 dark:bg-rose-900/20',
      href: '/admin/enrollments',
    },
  ]

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
            Dashboard
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Overview of your learning platform.
          </p>
        </div>
        <div className="flex gap-3">
          <Link href="/admin/courses">
            <Button
              variant="primary"
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700"
            >
              <PlusIcon className="h-4 w-4" />
              New Course
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      {loading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {[...Array(5)].map((_, i) => (
            <StatCardSkeleton key={i} />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {statCards.map((stat) => (
            <Link key={stat.title} href={stat.href}>
              <div
                className={`relative overflow-hidden rounded-2xl border border-gray-200 dark:border-gray-800 ${stat.bgLight} p-5 transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 cursor-pointer`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      {stat.title}
                    </p>
                    <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
                      {stat.value.toLocaleString()}
                    </p>
                    {stat.badge && (
                      <span className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                        <ArrowUpIcon className="h-3 w-3" />
                        {stat.badge}
                      </span>
                    )}
                  </div>
                  <div className={`rounded-xl bg-gradient-to-br ${stat.gradient} p-2.5 shadow-lg`}>
                    <stat.icon className="h-5 w-5 text-white" />
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Courses */}
        <div className="lg:col-span-2">
          <Card className="border-gray-200 dark:border-gray-800 dark:bg-gray-900">
            <CardHeader>
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Recent Courses
                </h2>
                <Link href="/admin/courses">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20"
                  >
                    View all
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <div
                      key={i}
                      className="h-20 rounded-xl bg-gray-100 dark:bg-gray-800 animate-pulse"
                    />
                  ))}
                </div>
              ) : (data?.recentCourses?.length ?? 0) > 0 ? (
                <div className="space-y-3">
                  {data!.recentCourses.map((course) => (
                    <Link
                      key={course.id}
                      href={`/admin/courses/${course.id}`}
                      className="flex items-center gap-4 p-3 rounded-xl border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                    >
                      {course.thumbnail_url ? (
                        <Image
                          src={course.thumbnail_url}
                          alt={course.title}
                          width={56}
                          height={56}
                          className="h-14 w-14 rounded-lg object-cover"
                        />
                      ) : (
                        <div className="h-14 w-14 rounded-lg bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/30 flex items-center justify-center">
                          <BookOpenIcon className="h-6 w-6 text-indigo-500" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {course.title}
                        </h3>
                        <div className="flex items-center mt-1 gap-2">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 capitalize">
                            {course.level}
                          </span>
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium capitalize ${
                              course.status === 'published'
                                ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300'
                                : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300'
                            }`}
                          >
                            {course.status}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">
                          {course.total_lessons ?? 0}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">lessons</p>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <BookOpenIcon className="mx-auto h-12 w-12 text-gray-300 dark:text-gray-600" />
                  <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">No courses yet</p>
                  <Link href="/admin/courses">
                    <Button
                      variant="primary"
                      size="sm"
                      className="mt-4 bg-indigo-600 hover:bg-indigo-700"
                    >
                      Create First Course
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions & Top Courses */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <Card className="border-gray-200 dark:border-gray-800 dark:bg-gray-900">
            <CardHeader>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Quick Actions</h2>
            </CardHeader>
            <CardContent className="space-y-2">
              <Link href="/admin/courses" className="block">
                <Button
                  variant="primary"
                  className="w-full justify-start bg-indigo-600 hover:bg-indigo-700"
                >
                  <BookOpenIcon className="h-4 w-4 mr-2" />
                  Manage Courses
                </Button>
              </Link>
              <Link href="/admin/lessons" className="block">
                <Button
                  variant="secondary"
                  className="w-full justify-start dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
                >
                  <MusicalNoteIcon className="h-4 w-4 mr-2" />
                  Manage Lessons
                </Button>
              </Link>
              <Link href="/admin/users" className="block">
                <Button
                  variant="secondary"
                  className="w-full justify-start dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
                >
                  <UserGroupIcon className="h-4 w-4 mr-2" />
                  Manage Users
                </Button>
              </Link>
              <Link href="/admin/enrollments" className="block">
                <Button
                  variant="secondary"
                  className="w-full justify-start dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
                >
                  <TicketIcon className="h-4 w-4 mr-2" />
                  Manage Enrollments
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Top Courses */}
          {(data?.topCourses?.length ?? 0) > 0 && (
            <Card className="border-gray-200 dark:border-gray-800 dark:bg-gray-900">
              <CardHeader>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <ArrowTrendingUpIcon className="h-5 w-5 text-emerald-500" />
                  Top Courses
                </h2>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {data!.topCourses.map((course, index) => (
                    <div key={course.id} className="flex items-center gap-3">
                      <span
                        className={`flex-shrink-0 h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold ${
                          index === 0
                            ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                            : index === 1
                              ? 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300'
                              : 'bg-orange-50 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400'
                        }`}
                      >
                        {index + 1}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {course.title}
                        </p>
                      </div>
                      <span className="text-sm font-semibold text-gray-600 dark:text-gray-300">
                        {course.enrolled_count}
                        <span className="text-xs font-normal text-gray-400 ml-1">enrolled</span>
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
