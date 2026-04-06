'use client'

import { useRouter } from 'next/navigation'
import { Globe } from 'lucide-react'

export function LanguageSwitcher() {
  const router = useRouter()
  
  const switchLang = (locale: string) => {
    document.cookie = `NEXT_LOCALE=${locale}; path=/; max-age=31536000`
    router.refresh()
  }

  return (
    <div className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400 sm:bg-gray-50 sm:dark:bg-gray-800 sm:px-3 sm:py-1.5 sm:rounded-full sm:border sm:border-gray-200 sm:dark:border-gray-700">
      <Globe className="w-3.5 h-3.5 sm:w-4 sm:h-4 hidden sm:block" />
      <button onClick={() => switchLang('en')} className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors px-1 py-0.5">EN</button>
      <span className="text-gray-300 dark:text-gray-600">|</span>
      <button onClick={() => switchLang('vi')} className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors px-1 py-0.5">VI</button>
    </div>
  )
}
