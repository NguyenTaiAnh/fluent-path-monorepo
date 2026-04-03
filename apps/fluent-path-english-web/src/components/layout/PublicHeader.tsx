'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useDictionary } from '@/i18n/DictionaryProvider'

export function PublicHeader() {
  const dict = useDictionary()

  return (
    <header className="fixed inset-x-0 top-0 z-50 bg-white/80 dark:bg-gray-950/80 backdrop-blur-md border-b border-gray-100 dark:border-gray-800 transition-all">
      <nav
        className="mx-auto flex max-w-7xl items-center justify-between p-6 lg:px-8"
        aria-label="Global"
      >
        <div className="flex lg:flex-1">
          <Link href="/" className="-m-1.5 p-1.5 flex items-center gap-2">
            <div className="flex items-center justify-center h-8 w-8 overflow-hidden rounded-lg">
              <Image src="/icon.png" alt="TAEnglish Logo" width={32} height={32} className="object-cover" unoptimized/>
            </div>
            <span className="font-bold text-xl tracking-tight text-gray-900 dark:text-white">
              TAEnglish
            </span>
          </Link>
        </div>
        <div className="hidden lg:flex lg:gap-x-12">
          <Link
            href="/about"
            className="text-sm font-semibold leading-6 text-gray-900 hover:text-indigo-600 dark:text-gray-100 dark:hover:text-indigo-400 transition-colors"
          >
            {dict.landing?.the_method || 'The Method'}
          </Link>
          <Link
            href="/courses"
            className="text-sm font-semibold leading-6 text-gray-900 hover:text-indigo-600 dark:text-gray-100 dark:hover:text-indigo-400 transition-colors"
          >
            {dict.navigation?.courses || 'Courses'}
          </Link>
        </div>
        <div className="hidden lg:flex lg:flex-1 lg:justify-end gap-4 items-center">
          <Link
            href="/login"
            className="text-sm font-semibold leading-6 text-gray-900 dark:text-gray-100 hover:text-indigo-600 transition-colors"
          >
            {dict.landing?.login || 'Log in'}
          </Link>
          <Link
            href="/register"
            className="rounded-full bg-gray-900 dark:bg-white px-5 py-2.5 text-sm font-semibold text-white dark:text-gray-900 shadow-sm hover:bg-indigo-600 dark:hover:bg-indigo-500 hover:text-white transition-all duration-300 transform hover:-translate-y-0.5"
          >
            {dict.landing?.register || 'Sign up free'}
          </Link>
        </div>
      </nav>
    </header>
  )
}
