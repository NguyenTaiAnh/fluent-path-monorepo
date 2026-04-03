'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  BookOpen,
  LayoutDashboard,
  Settings,
  User,
  ChevronLeft,
  ChevronRight,
  GraduationCap,
  Shield,
  X,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useUIStore } from '@/store/useUIStore'
import { useDictionary } from '@/i18n/DictionaryProvider'
import useSWR from 'swr'
import { fetcher } from '@/lib/fetcher'
import { useEffect } from 'react'

function SidebarContent({
  isSidebarCollapsed,
  isAdmin,
  pathname,
  dict,
  onClose,
}: {
  isSidebarCollapsed: boolean
  isAdmin: boolean
  pathname: string
  dict: ReturnType<typeof useDictionary>
  onClose?: () => void
}) {
  const navigation = [
    { name: dict.navigation?.dashboard || 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: dict.navigation?.courses || 'My Courses', href: '/my-courses', icon: BookOpen },
    { name: dict.navigation?.profile || 'Profile', href: '/profile', icon: User },
    { name: dict.navigation?.settings || 'Settings', href: '/settings', icon: Settings },
  ]

  return (
    <div className="flex flex-col h-full">
      {/* Logo area */}
      <div
        className={cn(
          'flex h-16 shrink-0 items-center border-b border-gray-100 dark:border-gray-800 px-4',
          isSidebarCollapsed ? 'justify-center' : 'justify-between',
        )}
      >
        <Link href="/dashboard" className="flex items-center gap-2.5 min-w-0" onClick={onClose}>
          <div className="bg-indigo-600 text-white p-1.5 rounded-lg shrink-0">
            <GraduationCap className="w-5 h-5" />
          </div>
          {!isSidebarCollapsed && (
            <span className="text-base font-bold tracking-tight text-gray-900 dark:text-white truncate">
              TAEnglish
            </span>
          )}
        </Link>
        {/* Mobile close button */}
        {onClose && (
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            aria-label="Close sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Nav items */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        {navigation.map((item) => {
          const isActive = pathname.startsWith(item.href)
          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={onClose}
              className={cn(
                'group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-all',
                isActive
                  ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-900',
                isSidebarCollapsed && 'justify-center px-2',
              )}
              title={isSidebarCollapsed ? item.name : undefined}
            >
              <item.icon
                className={cn(
                  'h-5 w-5 shrink-0',
                  isActive
                    ? 'text-indigo-600 dark:text-indigo-400'
                    : 'text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300',
                )}
                aria-hidden="true"
              />
              {!isSidebarCollapsed && <span className="truncate">{item.name}</span>}
            </Link>
          )
        })}
      </nav>

      {/* Admin button */}
      {isAdmin && (
        <div className="shrink-0 border-t border-gray-100 dark:border-gray-800 px-3 py-3">
          <Link
            href="/admin"
            onClick={onClose}
            className={cn(
              'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-900/40 transition-colors',
              isSidebarCollapsed && 'justify-center px-2',
            )}
            title={isSidebarCollapsed ? 'Admin Panel' : undefined}
          >
            <Shield className="h-5 w-5 shrink-0" />
            {!isSidebarCollapsed && <span className="truncate">Admin Panel</span>}
          </Link>
        </div>
      )}
    </div>
  )
}

export function DashboardSidebar() {
  const pathname = usePathname()
  const { isSidebarCollapsed, toggleSidebar, isMobileSidebarOpen, closeMobileSidebar } =
    useUIStore()
  const dict = useDictionary()
  const { data: me } = useSWR('/api/me', fetcher)
  const isAdmin = me?.role === 'admin'

  // Close mobile sidebar on route change
  useEffect(() => {
    closeMobileSidebar()
  }, [pathname, closeMobileSidebar])

  return (
    <>
      {/* ── Mobile Drawer ── */}
      {/* Backdrop */}
      <div
        className={cn(
          'fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden transition-opacity duration-300',
          isMobileSidebarOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none',
        )}
        onClick={closeMobileSidebar}
        aria-hidden="true"
      />

      {/* Drawer panel */}
      <div
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-72 flex flex-col bg-white dark:bg-gray-950 border-r border-gray-200 dark:border-gray-800 shadow-2xl transform transition-transform duration-300 ease-in-out lg:hidden',
          isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <SidebarContent
          isSidebarCollapsed={false}
          isAdmin={isAdmin}
          pathname={pathname}
          dict={dict}
          onClose={closeMobileSidebar}
        />
      </div>

      {/* ── Desktop Sidebar ── */}
      <div
        className={cn(
          'hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:flex-col transition-all duration-300',
          isSidebarCollapsed ? 'lg:w-20' : 'lg:w-64',
        )}
      >
        {/* Sidebar content */}
        <div className="flex flex-col h-full overflow-hidden border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950">
          <SidebarContent
            isSidebarCollapsed={isSidebarCollapsed}
            isAdmin={isAdmin}
            pathname={pathname}
            dict={dict}
          />
        </div>

        {/* Collapse toggle — outside overflow-hidden so it's never clipped */}
        <button
          onClick={toggleSidebar}
          className="absolute top-5 -right-4 z-50 flex items-center justify-center w-8 h-8 rounded-full bg-white dark:bg-gray-900 border-2 border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 shadow-lg hover:bg-indigo-50 dark:hover:bg-indigo-900/40 hover:border-indigo-400 dark:hover:border-indigo-500 transition-all duration-200"
          aria-label={isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isSidebarCollapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <ChevronLeft className="w-4 h-4" />
          )}
        </button>
      </div>
    </>
  )
}
