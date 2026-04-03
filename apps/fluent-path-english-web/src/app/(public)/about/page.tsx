import { Brain, Headphones, BookOpen, MessageCircle, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 py-12 sm:py-24">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-900 dark:hover:text-gray-300"
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Home
          </Link>
        </div>

        <div className="mx-auto max-w-2xl lg:text-center">
          <h2 className="text-base font-semibold leading-7 text-indigo-600 dark:text-indigo-400">
            The Rules
          </h2>
          <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
            The 7 Rules of TAEnglish
          </p>
          <p className="mt-6 text-lg leading-8 text-gray-600 dark:text-gray-300">
            Learn how to speak English fluently, confidently, and automatically without thinking
            about grammar rules.
          </p>
        </div>

        <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-4xl">
          <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-10 lg:max-w-none lg:grid-cols-2 lg:gap-y-16">
            <div className="relative pl-16">
              <dt className="text-base font-semibold leading-7 text-gray-900 dark:text-white">
                <div className="absolute left-0 top-0 flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-600">
                  <BookOpen className="h-6 w-6 text-white" aria-hidden="true" />
                </div>
                Rule 1: Learn Phrases, Not Words
              </dt>
              <dd className="mt-2 text-base leading-7 text-gray-600 dark:text-gray-400">
                Never study a single, isolated word. When you find a new word, always write down the
                phrase it is in. Phrases give you meaning, context, and grammar automatically.
              </dd>
            </div>

            <div className="relative pl-16">
              <dt className="text-base font-semibold leading-7 text-gray-900 dark:text-white">
                <div className="absolute left-0 top-0 flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-600">
                  <Brain className="h-6 w-6 text-white" aria-hidden="true" />
                </div>
                Rule 2: Do Not Study Grammar Rules
              </dt>
              <dd className="mt-2 text-base leading-7 text-gray-600 dark:text-gray-400">
                Put away your grammar books. Grammar teaches you to think about English, but you
                want to speak automatically. Stop studying grammar to speak faster.
              </dd>
            </div>

            <div className="relative pl-16">
              <dt className="text-base font-semibold leading-7 text-gray-900 dark:text-white">
                <div className="absolute left-0 top-0 flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-600">
                  <Headphones className="h-6 w-6 text-white" aria-hidden="true" />
                </div>
                Rule 3: Learn with Your Ears, Not Your Eyes
              </dt>
              <dd className="mt-2 text-base leading-7 text-gray-600 dark:text-gray-400">
                Listening is the absolute key to excellent speaking. You must listen to
                understandable English. You must listen to English EVERY DAY.
              </dd>
            </div>

            <div className="relative pl-16">
              <dt className="text-base font-semibold leading-7 text-gray-900 dark:text-white">
                <div className="absolute left-0 top-0 flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-600">
                  <MessageCircle className="h-6 w-6 text-white" aria-hidden="true" />
                </div>
                Rule 4: Deep Learning
              </dt>
              <dd className="mt-2 text-base leading-7 text-gray-600 dark:text-gray-400">
                Deep learning is the secret to speaking easily. You must learn English deeply.
                It&apos;s not enough to know a word; you must put it deep into your brain through
                intense repetition.
              </dd>
            </div>
          </dl>

          <div className="mt-16 text-center">
            <Link
              href="/register"
              className="rounded-full bg-indigo-600 px-8 py-3.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            >
              Learn English with Tai Anh
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
