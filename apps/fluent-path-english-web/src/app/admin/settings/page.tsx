'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select } from '@/components/ui/form'
import { useTheme } from 'next-themes'
import {
  Cog6ToothIcon,
  MoonIcon,
  SunIcon,
  ComputerDesktopIcon,
  LanguageIcon,
} from '@heroicons/react/24/outline'

export default function SettingsPage() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [lang, setLang] = useState('vi')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true)
    const savedLang = localStorage.getItem('admin_lang')
    if (savedLang) {
      setLang(savedLang)
    }
  }, [])

  const handleSave = () => {
    setSaving(true)
    localStorage.setItem('admin_lang', lang)
    // Giả lập thời gian lưu network
    setTimeout(() => {
      setSaving(false)
    }, 600)
  }

  if (!mounted) return null

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-900/30">
            <Cog6ToothIcon className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Settings</h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Manage your display preferences and languages.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Appearance Settings */}
        <Card>
          <CardContent className="p-6 space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white flex items-center gap-2">
                <SunIcon className="h-5 w-5 text-amber-500" />
                Appearance
              </h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Customize the UI theme of the admin dashboard.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <button
                onClick={() => setTheme('light')}
                className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${
                  theme === 'light'
                    ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 text-gray-600 dark:text-gray-400'
                }`}
              >
                <SunIcon className="h-6 w-6 mb-2" />
                <span className="text-sm font-medium">Light</span>
              </button>

              <button
                onClick={() => setTheme('dark')}
                className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${
                  theme === 'dark'
                    ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 text-gray-600 dark:text-gray-400'
                }`}
              >
                <MoonIcon className="h-6 w-6 mb-2" />
                <span className="text-sm font-medium">Dark</span>
              </button>

              <button
                onClick={() => setTheme('system')}
                className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${
                  theme === 'system'
                    ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 text-gray-600 dark:text-gray-400'
                }`}
              >
                <ComputerDesktopIcon className="h-6 w-6 mb-2" />
                <span className="text-sm font-medium">System</span>
              </button>
            </div>
          </CardContent>
        </Card>

        {/* Language Settings */}
        <Card>
          <CardContent className="p-6 space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white flex items-center gap-2">
                <LanguageIcon className="h-5 w-5 text-blue-500" />
                Language
              </h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Choose the preferred language for the admin interface.
              </p>
            </div>

            <div className="space-y-4">
              <Select
                value={lang}
                onChange={(e) => setLang(e.target.value)}
                options={[
                  { value: 'vi', label: 'Tiếng Việt (Vietnamese)' },
                  { value: 'en', label: 'English (US)' },
                ]}
              />

              <div className="pt-4 flex justify-end">
                <Button
                  variant="primary"
                  onClick={handleSave}
                  loading={saving}
                  className="bg-indigo-600 hover:bg-indigo-700"
                >
                  Save Changes
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
