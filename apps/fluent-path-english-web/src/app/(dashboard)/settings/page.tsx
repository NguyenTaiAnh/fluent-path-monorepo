'use client'

import { useState } from 'react'
import { User, Globe, Moon, Sun, Save, Camera, Laptop } from 'lucide-react'
import { useDictionary } from '@/i18n/DictionaryProvider'
import { useTheme } from 'next-themes'
import { useRouter } from 'next/navigation'

export default function SettingsPage() {
  const dict = useDictionary()
  const { theme, setTheme } = useTheme()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('profile')

  const switchLang = (locale: string) => {
    document.cookie = `NEXT_LOCALE=${locale}; path=/; max-age=31536000`
    router.refresh()
  }

  const sDict = dict.settings || {}

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h2 className="text-2xl font-bold leading-7 text-gray-900 dark:text-white sm:truncate sm:text-3xl sm:tracking-tight">
          {sDict.title || 'Settings'}
        </h2>
        <p className="mt-1 text-sm leading-6 text-gray-500 dark:text-gray-400">
          {sDict.subtitle || 'Manage application preferences, language, and theme.'}
        </p>
      </div>

      <div className="bg-white dark:bg-gray-950 shadow-sm ring-1 ring-gray-200 dark:ring-gray-800 rounded-xl overflow-hidden flex flex-col md:flex-row min-h-[500px]">
        {/* Settings Sidebar */}
        <aside className="w-full md:w-64 border-b md:border-b-0 md:border-r border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50 p-4">
          <nav className="flex space-x-2 md:space-x-0 md:flex-col md:space-y-1">
             <button
              onClick={() => setActiveTab('profile')}
              className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg w-full ${activeTab === 'profile' ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'}`}
             >
               <User className="w-4 h-4" />
               Profile
             </button>
             <button
              onClick={() => setActiveTab('preferences')}
              className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg w-full ${activeTab === 'preferences' ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'}`}
             >
               <Globe className="w-4 h-4" />
               Preferences
             </button>
          </nav>
        </aside>

        {/* Settings Content */}
        <div className="flex-1 p-6 sm:p-8">
          {activeTab === 'profile' && (
            <div className="space-y-6 max-w-xl">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-800 pb-2">Profile Information</h3>
              
              <div className="flex items-center gap-x-6">
                <div className="relative">
                  <div className="h-20 w-20 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center text-indigo-600 dark:text-indigo-400 text-2xl font-bold">
                    EE
                  </div>
                  <button className="absolute bottom-0 right-0 rounded-full bg-white dark:bg-gray-800 p-1.5 shadow-sm ring-1 ring-gray-200 dark:ring-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
                    <Camera className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium leading-6 text-gray-900 dark:text-gray-100">Full Name</label>
                  <input
                    type="text"
                    className="mt-2 block w-full rounded-md border-0 py-1.5 bg-white dark:bg-gray-900 text-gray-900 dark:text-white ring-1 ring-inset ring-gray-300 dark:ring-gray-700 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                    placeholder="Your Name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium leading-6 text-gray-900 dark:text-gray-100">Email address</label>
                  <input
                    type="email"
                    className="mt-2 block w-full rounded-md border-0 py-1.5 bg-gray-50 dark:bg-gray-800/50 text-gray-500 dark:text-gray-400 ring-1 ring-inset ring-gray-300 dark:ring-gray-700 sm:text-sm sm:leading-6 cursor-not-allowed"
                    placeholder="you@example.com"
                    disabled
                  />
                </div>
                <div className="pt-2">
                  <button className="inline-flex items-center gap-x-2 rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500">
                    <Save className="-ml-0.5 h-4 w-4" /> Save Profile
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'preferences' && (
            <div className="space-y-8 max-w-xl">
               <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-800 pb-2 mb-4">
                    {sDict.language || 'Language'}
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      onClick={() => switchLang('en')}
                      className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${typeof document !== 'undefined' && document.cookie.includes('NEXT_LOCALE=en') ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20' : 'border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700 bg-white dark:bg-gray-950'}`}
                    >
                      <span className="text-2xl mb-2">🇬🇧</span>
                      <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{sDict.english || 'English'}</span>
                    </button>
                    <button
                      onClick={() => switchLang('vi')}
                      className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${typeof document !== 'undefined' && document.cookie.includes('NEXT_LOCALE=vi') ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20' : 'border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700 bg-white dark:bg-gray-950'}`}
                    >
                      <span className="text-2xl mb-2">🇻🇳</span>
                      <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{sDict.vietnamese || 'Vietnamese'}</span>
                    </button>
                  </div>
               </div>

               <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-800 pb-2 mb-4">
                    {sDict.theme || 'Theme'}
                  </h3>
                  <div className="grid grid-cols-3 gap-4">
                    <button
                      onClick={() => setTheme('light')}
                      className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${theme === 'light' ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20' : 'border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700 bg-white dark:bg-gray-950'}`}
                    >
                      <Sun className={`h-6 w-6 mb-2 ${theme === 'light' ? 'text-indigo-600' : 'text-gray-400'}`} />
                      <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{sDict.light || 'Light'}</span>
                    </button>
                    <button
                      onClick={() => setTheme('dark')}
                      className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${theme === 'dark' ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20' : 'border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700 bg-white dark:bg-gray-950'}`}
                    >
                      <Moon className={`h-6 w-6 mb-2 ${theme === 'dark' ? 'text-indigo-600' : 'text-gray-400'}`} />
                      <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{sDict.dark || 'Dark'}</span>
                    </button>
                    <button
                      onClick={() => setTheme('system')}
                      className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${theme === 'system' ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20' : 'border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700 bg-white dark:bg-gray-950'}`}
                    >
                      <Laptop className={`h-6 w-6 mb-2 ${theme === 'system' ? 'text-indigo-600' : 'text-gray-400'}`} />
                      <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{sDict.system || 'System'}</span>
                    </button>
                  </div>
               </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
