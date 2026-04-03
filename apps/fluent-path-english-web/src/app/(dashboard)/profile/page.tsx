'use client'

import { User, Mail, Shield, Save, Camera } from 'lucide-react'

export default function ProfilePage() {
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h2 className="text-2xl font-bold leading-7 text-gray-900 dark:text-white sm:truncate sm:text-3xl sm:tracking-tight">
          Profile Settings
        </h2>
        <p className="mt-1 text-sm leading-6 text-gray-500 dark:text-gray-400">
          Manage your account details and learning preferences.
        </p>
      </div>

      <div className="bg-white dark:bg-gray-950 shadow-sm ring-1 ring-gray-200 dark:ring-gray-800 rounded-xl overflow-hidden">
        <div className="px-4 py-6 sm:p-8">
          <div className="flex items-center gap-x-8 mb-8 pb-8 border-b border-gray-100 dark:border-gray-800">
            <div className="relative">
              <div className="h-24 w-24 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center text-indigo-600 dark:text-indigo-400 text-3xl font-bold">
                NT
              </div>
              <button className="absolute bottom-0 right-0 rounded-full bg-white dark:bg-gray-800 p-1.5 shadow-sm ring-1 ring-gray-200 dark:ring-gray-700 hover:bg-gray-50">
                <Camera className="w-4 h-4 text-gray-500 dark:text-gray-400" />
              </button>
            </div>
            <div>
              <h3 className="text-xl font-medium text-gray-900 dark:text-white">Profile Photo</h3>
              <p className="text-sm text-gray-500 mt-1">We recommend a 300x300px image.</p>
            </div>
          </div>

          <form className="space-y-6 max-w-xl">
            <div>
              <label htmlFor="name" className="block text-sm font-medium leading-6 text-gray-900 dark:text-gray-100">
                Full Name
              </label>
              <div className="relative mt-2 rounded-md shadow-sm">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <User className="h-5 w-5 text-gray-400" aria-hidden="true" />
                </div>
                <input
                  type="text"
                  name="name"
                  id="name"
                  className="block w-full rounded-md border-0 py-1.5 pl-10 text-gray-900 dark:text-white dark:bg-gray-900 ring-1 ring-inset ring-gray-300 dark:ring-gray-700 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                  placeholder="John Doe"
                  defaultValue="Nguyen Tai Anh"
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium leading-6 text-gray-900 dark:text-gray-100">
                Email address
              </label>
              <div className="relative mt-2 rounded-md shadow-sm">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <Mail className="h-5 w-5 text-gray-400" aria-hidden="true" />
                </div>
                <input
                  type="email"
                  name="email"
                  id="email"
                  className="block w-full rounded-md border-0 py-1.5 pl-10 text-gray-900 dark:text-white dark:bg-gray-900 ring-1 ring-inset ring-gray-300 dark:ring-gray-700 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 cursor-not-allowed bg-gray-50"
                  placeholder="you@example.com"
                  defaultValue="nta@example.com"
                  disabled
                />
              </div>
              <p className="mt-2 text-xs text-gray-500">Your email address is managed via your identity provider.</p>
            </div>
            
            <div className="pt-4 flex gap-4">
              <button
                type="button"
                className="inline-flex items-center gap-x-2 rounded-md bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 transition-colors"
              >
                <Save className="-ml-0.5 h-4 w-4" aria-hidden="true" />
                Save Changes
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
