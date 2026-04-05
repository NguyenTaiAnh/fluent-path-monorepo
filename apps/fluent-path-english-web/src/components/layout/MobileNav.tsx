'use client'

import { useState, useSyncExternalStore } from 'react'
import { createPortal } from 'react-dom'
import Link from 'next/link'
import { Menu, X, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'

const emptySubscribe = () => () => {}
function useIsClient() {
  return useSyncExternalStore(emptySubscribe, () => true, () => false)
}

export function MobileNav({ dict }: { dict: Record<string, string | undefined> }) {
  const [isOpen, setIsOpen] = useState(false)
  const isClient = useIsClient()

  const drawerContent = (
    <>
      {/* Backdrop */}
      <div
        className={cn(
          'fixed inset-0 z-9990 bg-black/50 backdrop-blur-sm transition-opacity duration-300 lg:hidden',
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none',
        )}
        onClick={() => setIsOpen(false)}
        aria-hidden="true"
      />

      {/* Sidebar drawer — slides from right */}
      <div
        className={cn(
          'fixed inset-y-0 right-0 z-9995 w-72 bg-white dark:bg-gray-950 shadow-2xl transform transition-transform duration-300 ease-in-out lg:hidden flex flex-col',
          isOpen ? 'translate-x-0' : 'translate-x-full',
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-800">
          <span className="text-lg font-bold text-gray-900 dark:text-white tracking-tight">
            Menu
          </span>
          <button
            onClick={() => setIsOpen(false)}
            className="p-2 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Nav links */}
        <nav className="flex-1 px-4 py-6 space-y-1">
          <Link
            href="/about"
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            {dict.the_method || 'The Method'}
          </Link>
          <Link
            href="/courses"
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            {dict.courses || 'Courses'}
          </Link>
        </nav>

        {/* Auth buttons */}
        <div className="px-5 py-5 border-t border-gray-100 dark:border-gray-800 space-y-3">
          <Link
            href="/login"
            onClick={() => setIsOpen(false)}
            className="flex items-center justify-center w-full px-4 py-3 rounded-full text-sm font-semibold text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            {dict.login || 'Log in'}
          </Link>
          <Link
            href="/register"
            onClick={() => setIsOpen(false)}
            className="flex items-center justify-center gap-2 w-full px-4 py-3 rounded-full text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 shadow-lg shadow-indigo-200 dark:shadow-indigo-900/30 transition-all"
          >
            <Sparkles className="w-4 h-4" />
            {dict.register || 'Sign up free'}
          </Link>
        </div>
      </div>
    </>
  )

  return (
    <>
      {/* Hamburger button — stays in header */}
      <button
        onClick={() => setIsOpen(true)}
        className="lg:hidden p-2 -mr-2 rounded-lg text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        aria-label="Open menu"
      >
        <Menu className="w-6 h-6" />
      </button>

      {/* Portal to document.body — escapes header's backdrop-blur stacking context */}
      {isClient && createPortal(drawerContent, document.body)}
    </>
  )
}
