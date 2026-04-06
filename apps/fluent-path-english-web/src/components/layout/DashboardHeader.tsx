'use client'

import { Menu, LogOut } from 'lucide-react'
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
  const nav = dict?.navigation || {}
  const { toggleMobileSidebar } = useUIStore()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <div className="sticky top-0 z-40 flex h-12 sm:h-16 shrink-0 items-center gap-x-2 sm:gap-x-4 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-3 sm:px-4 shadow-sm lg:gap-x-6 lg:px-8">
      {/* Mobile menu button */}
      <button
        type="button"
        className="-m-1.5 p-1.5 text-gray-700 dark:text-gray-300 lg:hidden rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        onClick={toggleMobileSidebar}
        aria-label="Open sidebar"
      >
        <Menu className="h-5 w-5" aria-hidden="true" />
      </button>

      {/* Separator */}
      <div className="h-5 w-px bg-gray-200 dark:bg-gray-800 lg:hidden" aria-hidden="true" />

      {/* Spacer — push right items to the end */}
      <div className="flex-1" />

      {/* Action buttons — compact on mobile */}
      <div className="flex items-center gap-x-1.5 sm:gap-x-3 lg:gap-x-5">
        <LanguageSwitcher />
        <ThemeSwitcher className="p-1.5 sm:p-2" />

        {/* Separator — desktop only */}
        <div className="hidden lg:block lg:h-6 lg:w-px lg:bg-gray-200 dark:bg-gray-800" aria-hidden="true" />

        {/* Sign out: text on desktop, icon on mobile */}
        <button
          onClick={handleSignOut}
          className="hidden sm:block text-sm font-semibold leading-6 text-gray-900 dark:text-gray-100 hover:text-indigo-600 transition-colors whitespace-nowrap"
        >
          {nav.logout || 'Sign out'}
        </button>
        <button
          onClick={handleSignOut}
          className="sm:hidden -m-1 p-1.5 text-gray-400 hover:text-red-500 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          aria-label={nav.logout || 'Sign out'}
        >
          <LogOut className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
    </div>
  )
}
