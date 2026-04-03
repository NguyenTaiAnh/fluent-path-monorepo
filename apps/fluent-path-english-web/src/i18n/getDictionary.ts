import 'server-only'
import { cookies } from 'next/headers'

const dictionaries = {
  en: () => import('./dictionaries/en.json').then((module) => module.default),
  vi: () => import('./dictionaries/vi.json').then((module) => module.default),
}

export type Locale = keyof typeof dictionaries

export const getDictionary = async () => {
  const cookieStore = await cookies()
  const locale = (cookieStore.get('NEXT_LOCALE')?.value || 'vi') as Locale
  const validLocale = dictionaries[locale] ? locale : 'vi'
  return dictionaries[validLocale]()
}
