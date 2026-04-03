import Link from 'next/link'
import Image from 'next/image'
import { CheckCircle2, ChevronRight, Headphones, Brain, Sparkles, Globe } from 'lucide-react'
import { getDictionary } from '@/i18n/getDictionary'

export default async function LandingPage() {
  const dict = await getDictionary()
  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 font-sans selection:bg-indigo-100 selection:text-indigo-900">
      {/* Header */}
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

      <main className="isolate pt-24">
        {/* Hero section */}
        <div className="relative pt-14 flex items-center min-h-[90vh] overflow-hidden">
          {/* Decorative backgrounds */}
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,var(--tw-gradient-stops))] from-indigo-100 via-white to-white dark:from-indigo-950/20 dark:via-gray-950 dark:to-gray-950"></div>
          <div className="absolute top-0 right-0 -z-10 transform-gpu blur-3xl w-[600px] h-[600px] bg-linear-to-tr from-indigo-500 to-purple-400 opacity-20 dark:opacity-30 rounded-full mix-blend-multiply filter animate-blob"></div>
          <div className="absolute bottom-0 left-0 -z-10 transform-gpu blur-3xl w-[600px] h-[600px] bg-linear-to-tr from-cyan-400 to-blue-500 opacity-20 dark:opacity-30 rounded-full mix-blend-multiply filter animate-blob animation-delay-2000"></div>

          <div className="py-24 sm:py-32 lg:pb-40 className=w-full max-w-7xl mx-auto px-6 lg:px-8">
            <div className="mx-auto max-w-3xl text-center">
              <div className="mb-8 flex justify-center">
                <div className="relative rounded-full px-4 py-1.5 text-sm leading-6 text-indigo-600 dark:text-indigo-400 ring-1 ring-indigo-600/20 dark:ring-indigo-400/30 hover:ring-indigo-600/40 transition-all font-medium flex items-center gap-2 cursor-pointer bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm">
                  <Sparkles className="w-4 h-4" />
                  Announcing the new Power English course
                  <Link
                    href="/courses"
                    className="font-semibold text-indigo-600 dark:text-indigo-400 ml-2 group flex items-center"
                  >
                    <span className="absolute inset-0" aria-hidden="true" />
                    Explore{' '}
                    <span
                      className="ml-1 transition-transform group-hover:translate-x-1"
                      aria-hidden="true"
                    >
                      &rarr;
                    </span>
                  </Link>
                </div>
              </div>
              <h1 className="text-5xl font-extrabold tracking-tight text-gray-900 sm:text-7xl dark:text-white leading-[1.1]">
                {dict.landing?.title?.split(' ').slice(0, 2).join(' ')} <br />
                <span className="text-transparent bg-clip-text bg-linear-to-r from-indigo-600 to-cyan-500 dark:from-indigo-400 dark:to-cyan-400">
                  {dict.landing?.title?.split(' ').slice(2).join(' ')}{' '}
                  <br className="hidden sm:block" /> {dict.landing?.subtitle}
                </span>
              </h1>
              <p className="mt-8 text-lg leading-8 text-gray-600 dark:text-gray-300 max-w-2xl mx-auto font-medium">
                {dict.landing?.desc}
              </p>
              <div className="mt-12 flex items-center justify-center gap-x-6">
                <Link
                  href="/register"
                  className="rounded-full bg-indigo-600 px-8 py-4 text-base font-semibold text-white shadow-xl hover:bg-indigo-500 hover:shadow-indigo-500/20 hover:-translate-y-1 transition-all duration-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                >
                  {dict.landing?.start_now}
                </Link>
                <Link
                  href="/about"
                  className="text-base font-semibold leading-6 text-gray-900 dark:text-gray-100 flex items-center gap-2 group transition-colors hover:text-indigo-600 dark:hover:text-indigo-400"
                >
                  {dict.landing?.how_it_works}{' '}
                  <ChevronRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                </Link>
              </div>

              <div className="mt-16 pt-8 flex items-center justify-center gap-8 text-sm font-medium text-gray-500 dark:text-gray-400 border-t border-gray-200 dark:border-gray-800 max-w-2xl mx-auto">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-indigo-500" /> {dict.landing?.no_grammar}
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-indigo-500" />{' '}
                  {dict.landing?.deep_listening}
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-indigo-500" />{' '}
                  {dict.landing?.active_speaking}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Method Section */}
        <div className="py-24 sm:py-32 bg-gray-50 dark:bg-gray-900 border-y border-gray-100 dark:border-gray-800">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="mx-auto max-w-2xl sm:text-center">
              <h2 className="text-base font-semibold leading-7 text-indigo-600 dark:text-indigo-400">
                {dict.landing?.method_title}
              </h2>
              <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
                {dict.landing?.the_method}
              </p>
              <p className="mt-6 text-lg leading-8 text-gray-600 dark:text-gray-300">
                {dict.landing?.method_desc}
              </p>
            </div>

            <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
              <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">
                <div className="flex flex-col items-start bg-white dark:bg-gray-950 p-8 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 hover:shadow-md transition-shadow">
                  <div className="rounded-xl bg-indigo-50 dark:bg-indigo-900/30 p-4 ring-1 ring-indigo-100 dark:ring-indigo-800/50 mb-6">
                    <Headphones className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <dt className="text-xl font-bold leading-7 text-gray-900 dark:text-white mb-4">
                    Deep Listening
                  </dt>
                  <dd className="flex flex-auto flex-col text-base leading-7 text-gray-600 dark:text-gray-400">
                    <p className="flex-auto">
                      Listen to compelling stories rather than boring textbook dialogues. Master
                      real, native English vocabulary intuitively.
                    </p>
                  </dd>
                </div>

                <div className="flex flex-col items-start bg-white dark:bg-gray-950 p-8 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 hover:shadow-md transition-shadow">
                  <div className="rounded-xl bg-cyan-50 dark:bg-cyan-900/30 p-4 ring-1 ring-cyan-100 dark:ring-cyan-800/50 mb-6">
                    <Brain className="h-8 w-8 text-cyan-600 dark:text-cyan-400" />
                  </div>
                  <dt className="text-xl font-bold leading-7 text-gray-900 dark:text-white mb-4">
                    Listen & Answer
                  </dt>
                  <dd className="flex flex-auto flex-col text-base leading-7 text-gray-600 dark:text-gray-400">
                    <p className="flex-auto">
                      Instead of &ldquo;listen and repeat&rdquo;, our mini-stories train you to
                      think in English by asking simple questions that you answer quickly.
                    </p>
                  </dd>
                </div>

                <div className="flex flex-col items-start bg-white dark:bg-gray-950 p-8 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 hover:shadow-md transition-shadow">
                  <div className="rounded-xl bg-purple-50 dark:bg-purple-900/30 p-4 ring-1 ring-purple-100 dark:ring-purple-800/50 mb-6">
                    <Globe className="h-8 w-8 text-purple-600 dark:text-purple-400" />
                  </div>
                  <dt className="text-xl font-bold leading-7 text-gray-900 dark:text-white mb-4">
                    Point of View Stories
                  </dt>
                  <dd className="flex flex-auto flex-col text-base leading-7 text-gray-600 dark:text-gray-400">
                    <p className="flex-auto">
                      Learn grammar naturally without studying rules. We teach grammar intuitively
                      by telling the same story from different times (past, present, future).
                    </p>
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        </div>

        {/* CTA section */}
        <div className="relative isolate mt-32 px-6 py-32 sm:mt-40 sm:py-40 lg:px-8">
          <div className="absolute inset-0 -z-10 bg-indigo-600 dark:bg-indigo-900 transform-gpu overflow-hidden">
            <div className="absolute inset-0 bg-linear-to-tr from-indigo-700 to-indigo-500 dark:from-indigo-950 dark:to-indigo-800 opacity-90 mix-blend-multiply"></div>
            <div className="absolute -top-1/2 -right-1/2 w-full h-full bg-[radial-gradient(circle_at_center,var(--tw-gradient-stops))] from-white/20 to-transparent blur-3xl rounded-full"></div>
          </div>

          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-5xl">
              Ready to speak fluently?
            </h2>
            <p className="mx-auto mt-6 max-w-xl text-lg leading-8 text-indigo-100">
              Join thousands of successful English speakers who unlocked their potential with our
              courses.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Link
                href="/register"
                className="rounded-full bg-white px-8 py-4 text-base font-bold text-indigo-600 shadow-sm hover:bg-gray-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white transition-transform hover:-translate-y-1"
              >
                Get started today
              </Link>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white dark:bg-gray-950 py-12 border-t border-gray-100 dark:border-gray-800">
        <div className="mx-auto max-w-7xl px-6 lg:px-8 flex flex-col items-center">
          <div className="flex items-center gap-2 mb-6 text-gray-900 dark:text-white font-bold text-xl tracking-tight">
            <div className="flex items-center justify-center h-8 w-8 overflow-hidden rounded-lg">
              <Image src="/icon.png" alt="TAEnglish Logo" width={32} height={32} className="object-cover" unoptimized/>
            </div>
            TAEnglish
          </div>
          <p className="text-center text-sm leading-5 text-gray-500 dark:text-gray-400">
            &copy; 2026 TAEnglish LLC. All rights reserved. (Demo Clone)
          </p>
        </div>
      </footer>
    </div>
  )
}
