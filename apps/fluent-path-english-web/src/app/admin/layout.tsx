'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  HomeIcon,
  BookOpenIcon,
  UserGroupIcon,
  Cog6ToothIcon,
  ChartBarIcon,
  AcademicCapIcon,
  Bars3Icon,
  XMarkIcon,
  ArrowLeftEndOnRectangleIcon,
  DocumentTextIcon,
  MusicalNoteIcon,
  TicketIcon,
  MagnifyingGlassIcon,
  SunIcon,
  MoonIcon,
  LanguageIcon,
} from '@heroicons/react/24/outline'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { createClient } from '@/utils/supabase/client'
import { useTheme } from 'next-themes'

const navigation = [
  { name: 'Dashboard', nameVi: 'Tổng quan', href: '/admin', icon: HomeIcon },
  {
    name: 'Courses',
    nameVi: 'Khoá học',
    href: '/admin/courses',
    icon: BookOpenIcon,
  },
  {
    name: 'Sections',
    nameVi: 'Phần học',
    href: '/admin/sections',
    icon: DocumentTextIcon,
  },
  {
    name: 'Lessons',
    nameVi: 'Bài học',
    href: '/admin/lessons',
    icon: MusicalNoteIcon,
  },
  {
    name: 'Users',
    nameVi: 'Người dùng',
    href: '/admin/users',
    icon: UserGroupIcon,
  },
  {
    name: 'Enrollments',
    nameVi: 'Đăng ký',
    href: '/admin/enrollments',
    icon: TicketIcon,
  },
  {
    name: 'Analytics',
    nameVi: 'Thống kê',
    href: '/admin/analytics',
    icon: ChartBarIcon,
  },
  {
    name: 'Settings',
    nameVi: 'Cài đặt',
    href: '/admin/settings',
    icon: Cog6ToothIcon,
  },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [locale, setLocale] = useState<'vi' | 'en'>('vi')

  useEffect(() => {
    // Reading from browser APIs (cookies) is a valid external system sync
    const saved = document.cookie
      .split('; ')
      .find((row) => row.startsWith('NEXT_LOCALE='))
      ?.split('=')[1]
    const nextLocale = saved === 'en' ? 'en' : 'vi'
    // eslint-disable-next-line react-hooks/set-state-in-effect -- syncing from external browser cookie
    setLocale((prev) => (prev !== nextLocale ? nextLocale : prev))
    setMounted((prev) => (prev ? prev : true))
  }, [])

  const toggleLocale = () => {
    const newLocale = locale === 'vi' ? 'en' : 'vi'
    document.cookie = `NEXT_LOCALE=${newLocale};path=/;max-age=31536000`
    window.location.reload()
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      // Future: implement global search
      console.log('Search:', searchQuery)
    }
  }

  const isActive = (href: string) => {
    if (href === '/admin') return pathname === '/admin'
    return pathname.startsWith(href)
  }

  const sidebarContent = (
    <>
      {/* Logo */}
      <div className="flex h-16 items-center px-6 border-b border-gray-200 dark:border-gray-800">
        <AcademicCapIcon className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
        <span className="ml-2 text-lg font-bold bg-linear-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
          FluentPath Admin
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-4 overflow-y-auto">
        {navigation.map((item) => {
          const active = isActive(item.href)
          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={() => setSidebarOpen(false)}
              className={cn(
                'group flex items-center rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200',
                active
                  ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300 shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/50 hover:text-gray-900 dark:hover:text-gray-200',
              )}
            >
              <item.icon
                className={cn(
                  'mr-3 h-5 w-5 transition-colors',
                  active
                    ? 'text-indigo-600 dark:text-indigo-400'
                    : 'text-gray-400 dark:text-gray-500 group-hover:text-gray-600 dark:group-hover:text-gray-300',
                )}
              />
              {locale === 'vi' ? item.nameVi : item.name}
              {active && (
                <span className="ml-auto h-2 w-2 rounded-full bg-indigo-600 dark:bg-indigo-400" />
              )}
            </Link>
          )
        })}
      </nav>

      {/* Bottom section */}
      <div className="border-t border-gray-200 dark:border-gray-800 p-3 space-y-1">
        <Link
          href="/dashboard"
          className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 transition-colors"
        >
          <ArrowLeftEndOnRectangleIcon className="h-5 w-5 shrink-0" />
          <span>{locale === 'vi' ? 'Về trang học' : 'Student View'}</span>
        </Link>
      </div>
    </>
  )

  if (!mounted) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors">
      {/* Mobile sidebar overlay */}
      <div
        className={cn(
          'fixed inset-0 z-50 lg:hidden transition-opacity duration-300',
          sidebarOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none',
        )}
      >
        <div
          className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />
        <div
          className={cn(
            'fixed inset-y-0 left-0 flex w-72 flex-col bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 transform transition-transform duration-300 shadow-2xl',
            sidebarOpen ? 'translate-x-0' : '-translate-x-full',
          )}
        >
          <div className="absolute right-0 top-0 -mr-12 pt-2">
            <button
              type="button"
              className="ml-1 flex h-10 w-10 items-center justify-center rounded-full text-white hover:bg-white/10 transition-colors"
              onClick={() => setSidebarOpen(false)}
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>
          {sidebarContent}
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex grow flex-col overflow-y-auto bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800">
          {sidebarContent}
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top bar */}
        <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl px-4 sm:px-6 lg:px-8">
          {/* Mobile menu button */}
          <button
            type="button"
            className="lg:hidden rounded-lg p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            onClick={() => setSidebarOpen(true)}
          >
            <Bars3Icon className="h-5 w-5" />
          </button>

          {/* Divider */}
          <div className="h-6 w-px bg-gray-200 dark:bg-gray-700 lg:hidden" />

          {/* Search */}
          <form onSubmit={handleSearch} className="flex flex-1 max-w-lg">
            <div className="relative w-full">
              <MagnifyingGlassIcon className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                id="admin-global-search"
                type="search"
                placeholder={
                  locale === 'vi'
                    ? 'Tìm kiếm khoá học, bài học, người dùng...'
                    : 'Search courses, lessons, users...'
                }
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="block h-9 w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 py-0 pl-9 pr-3 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:bg-white dark:focus:bg-gray-900 transition-colors"
              />
            </div>
          </form>

          {/* Right actions */}
          <div className="flex items-center gap-x-2">
            {/* Language toggle */}
            <button
              type="button"
              onClick={toggleLocale}
              className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              title={locale === 'vi' ? 'Switch to English' : 'Chuyển sang Tiếng Việt'}
            >
              <LanguageIcon className="h-4 w-4" />
              <span className="hidden sm:inline">{locale === 'vi' ? 'VI' : 'EN'}</span>
            </button>

            {/* Theme toggle */}
            <button
              type="button"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="rounded-lg p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              title={theme === 'dark' ? 'Light mode' : 'Dark mode'}
            >
              {theme === 'dark' ? (
                <SunIcon className="h-4 w-4" />
              ) : (
                <MoonIcon className="h-4 w-4" />
              )}
            </button>

            {/* Divider */}
            <div className="h-6 w-px bg-gray-200 dark:bg-gray-700" />

            {/* Logout */}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              {locale === 'vi' ? 'Đăng xuất' : 'Logout'}
            </Button>
          </div>
        </div>

        {/* Page content */}
        <main className="py-6 lg:py-8">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">{children}</div>
        </main>
      </div>
    </div>
  )
}
