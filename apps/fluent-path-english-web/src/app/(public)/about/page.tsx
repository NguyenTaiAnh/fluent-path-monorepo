import { Brain, Headphones, BookOpen, MessageCircle, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { getDictionary } from '@/i18n/getDictionary'

export default async function AboutPage() {
  const dict = await getDictionary()

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-6 sm:mb-8">
          <Link
            href="/"
            className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-900 dark:hover:text-gray-300 transition-colors"
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> {dict.about?.back_home || 'Back to Home'}
          </Link>
        </div>

        <div className="mx-auto max-w-2xl lg:text-center">
          <h2 className="text-base font-semibold leading-7 text-indigo-600 dark:text-indigo-400">
            {dict.about?.section_label || 'The Rules'}
          </h2>
          <p className="mt-2 text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-gray-900 dark:text-white">
            {dict.about?.title || 'The 7 Rules of TAEnglish'}
          </p>
          <p className="mt-4 sm:mt-6 text-base sm:text-lg leading-7 sm:leading-8 text-gray-600 dark:text-gray-300">
            {dict.about?.desc || 'Learn how to speak English fluently, confidently, and automatically without thinking about grammar rules.'}
          </p>
        </div>

        <div className="mx-auto mt-12 sm:mt-16 max-w-2xl lg:mt-24 lg:max-w-4xl">
          <dl className="grid max-w-xl grid-cols-1 gap-8 sm:gap-x-8 sm:gap-y-10 lg:max-w-none lg:grid-cols-2 lg:gap-y-16">
            <div className="relative pl-14 sm:pl-16">
              <dt className="text-sm sm:text-base font-semibold leading-7 text-gray-900 dark:text-white">
                <div className="absolute left-0 top-0 flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-lg bg-indigo-600">
                  <BookOpen className="h-5 w-5 sm:h-6 sm:w-6 text-white" aria-hidden="true" />
                </div>
                {dict.about?.rule1_title || 'Rule 1: Learn Phrases, Not Words'}
              </dt>
              <dd className="mt-2 text-sm sm:text-base leading-6 sm:leading-7 text-gray-600 dark:text-gray-400">
                {dict.about?.rule1_desc || 'Never study a single, isolated word. When you find a new word, always write down the phrase it is in. Phrases give you meaning, context, and grammar automatically.'}
              </dd>
            </div>

            <div className="relative pl-14 sm:pl-16">
              <dt className="text-sm sm:text-base font-semibold leading-7 text-gray-900 dark:text-white">
                <div className="absolute left-0 top-0 flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-lg bg-indigo-600">
                  <Brain className="h-5 w-5 sm:h-6 sm:w-6 text-white" aria-hidden="true" />
                </div>
                {dict.about?.rule2_title || 'Rule 2: Do Not Study Grammar Rules'}
              </dt>
              <dd className="mt-2 text-sm sm:text-base leading-6 sm:leading-7 text-gray-600 dark:text-gray-400">
                {dict.about?.rule2_desc || 'Put away your grammar books. Grammar teaches you to think about English, but you want to speak automatically. Stop studying grammar to speak faster.'}
              </dd>
            </div>

            <div className="relative pl-14 sm:pl-16">
              <dt className="text-sm sm:text-base font-semibold leading-7 text-gray-900 dark:text-white">
                <div className="absolute left-0 top-0 flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-lg bg-indigo-600">
                  <Headphones className="h-5 w-5 sm:h-6 sm:w-6 text-white" aria-hidden="true" />
                </div>
                {dict.about?.rule3_title || 'Rule 3: Learn with Your Ears, Not Your Eyes'}
              </dt>
              <dd className="mt-2 text-sm sm:text-base leading-6 sm:leading-7 text-gray-600 dark:text-gray-400">
                {dict.about?.rule3_desc || 'Listening is the absolute key to excellent speaking. You must listen to understandable English. You must listen to English EVERY DAY.'}
              </dd>
            </div>

            <div className="relative pl-14 sm:pl-16">
              <dt className="text-sm sm:text-base font-semibold leading-7 text-gray-900 dark:text-white">
                <div className="absolute left-0 top-0 flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-lg bg-indigo-600">
                  <MessageCircle className="h-5 w-5 sm:h-6 sm:w-6 text-white" aria-hidden="true" />
                </div>
                {dict.about?.rule4_title || 'Rule 4: Deep Learning'}
              </dt>
              <dd className="mt-2 text-sm sm:text-base leading-6 sm:leading-7 text-gray-600 dark:text-gray-400">
                {dict.about?.rule4_desc || "Deep learning is the secret to speaking easily. You must learn English deeply. It's not enough to know a word; you must put it deep into your brain through intense repetition."}
              </dd>
            </div>
          </dl>

          <div className="mt-12 sm:mt-16 text-center">
            <Link
              href="/register"
              className="w-full sm:w-auto inline-block text-center rounded-full bg-indigo-600 px-8 py-3.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 transition-colors"
            >
              {dict.about?.cta_button || 'Learn English with Tai Anh'}
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
