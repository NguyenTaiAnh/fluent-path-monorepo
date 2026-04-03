'use client'

import { Bell, Menu, Search } from 'lucide-react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import { ThemeSwitcher } from '@/components/ThemeSwitcher'
import { LanguageSwitcher } from '@/components/LanguageSwitcher'
import { useDictionary } from '@/i18n/DictionaryProvider'
import { useUIStore } from '@/store/useUIStore'

export function DashboardHeader() {
  const router = useRouter()
  const supabase = createClient()
  const dict = useDictionary()
  const { toggleMobileSidebar } = useUIStore()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
      <button
        type="button"
        className="-m-2.5 p-2.5 text-gray-700 dark:text-gray-300 lg:hidden rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        onClick={toggleMobileSidebar}
        aria-label="Open sidebar"
      >
        <Menu className="h-6 w-6" aria-hidden="true" />
      </button>

      {/* Separator */}
      <div className="h-6 w-px bg-gray-200 dark:bg-gray-800 lg:hidden" aria-hidden="true" />

      <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
        <form className="relative flex flex-1" action="#" method="GET">
          <label htmlFor="search-field" className="sr-only">
            Search
          </label>
          <Search
            className="pointer-events-none absolute inset-y-0 left-0 h-full w-5 text-gray-400"
            aria-hidden="true"
          />
          <input
            id="search-field"
            className="block h-full w-full border-0 py-0 pl-8 pr-0 bg-transparent text-gray-900 dark:text-gray-100 placeholder:text-gray-400 focus:ring-0 sm:text-sm"
            placeholder="Search courses, lessons..."
            type="search"
            name="search"
          />
        </form>
        <div className="flex items-center gap-x-4 lg:gap-x-6">
          <button type="button" className="-m-2.5 p-2.5 text-gray-400 hover:text-gray-500">
            <span className="sr-only">View notifications</span>
            <Bell className="h-6 w-6" aria-hidden="true" />
          </button>

          <LanguageSwitcher />
          <ThemeSwitcher />

          {/* Separator */}
          <div
            className="hidden lg:block lg:h-6 lg:w-px lg:bg-gray-200 dark:bg-gray-800"
            aria-hidden="true"
          />

          {/* User profile actions */}
          <button
            onClick={handleSignOut}
            className="text-sm font-semibold leading-6 text-gray-900 dark:text-gray-100 hover:text-indigo-600"
          >
            {dict.logout || 'Sign out'}
          </button>
        </div>
      </div>
    </div>
  )
}
