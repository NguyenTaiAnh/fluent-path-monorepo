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
    <div className="flex items-center gap-2 text-sm font-medium text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 px-3 py-1.5 rounded-full border border-gray-200 dark:border-gray-700">
      <Globe className="w-4 h-4" />
      <button onClick={() => switchLang('en')} className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">EN</button>
      <span className="text-gray-300 dark:text-gray-600">|</span>
      <button onClick={() => switchLang('vi')} className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">VI</button>
    </div>
  )
}
