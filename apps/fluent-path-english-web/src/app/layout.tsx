import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from '@/components/ThemeProvider'
import { AuthProvider } from '@/components/AuthProvider'
import { getDictionary } from '@/i18n/getDictionary'
import { DictionaryProvider } from '@/i18n/DictionaryProvider'
import NextTopLoader from 'nextjs-toploader'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})
export async function generateMetadata(): Promise<Metadata> {
  const dict = await getDictionary()

  return {
    title: {
      default: dict.metadata?.title_default || 'Học TA cùng TA',
      template: dict.metadata?.title_template || '%s | Học TA cùng TA',
    },
    description:
      dict.metadata?.description || 'Học tiếng Anh cùng Tài Anh. Phương pháp nghe sâu — nói đúng — tư duy bằng tiếng Anh, không cần học ngữ pháp từ đầu.',
    keywords: [
      'học tiếng anh',
      'Học TA cùng TA',
      'tiếng anh giao tiếp',
      'luyện nghe tiếng anh',
      'english speaking',
      'fluent english',
      'Học tiếng Anh cùng Tài Anh'
    ],
    authors: [{ name: 'Nguyễn Tài Anh (Leon Nguyen)', url: 'https://github.com/nguyentaianh' }],
    creator: 'Nguyễn Tài Anh (Leon Nguyen)',
    icons: {
      icon: [
        { url: '/icon.png', type: 'image/png' },
      ],
      apple: [
        { url: '/apple-icon.png', type: 'image/png' },
      ],
    },
    openGraph: {
      title: dict.metadata?.og_title || 'Học TA cùng TA',
      description:
        dict.metadata?.og_description || 'Học tiếng Anh tự nhiên và thực chiến cùng Tài Anh. Phương pháp nghe sâu — nói đúng — tư duy bằng tiếng Anh.',
      siteName: dict.metadata?.site_name || 'Học TA cùng TA',
      images: [{ url: '/og-image.png', width: 1024, height: 1024 }],
      locale: 'vi_VN',
      type: 'website',
    },
  }
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const dict = await getDictionary()
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen transition-colors duration-300`}
      >
        <DictionaryProvider dict={dict}>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
            enableColorScheme
          >
            <NextTopLoader
              color="#6366f1"
              initialPosition={0.08}
              crawlSpeed={200}
              height={3}
              crawl={true}
              showSpinner={false}
              easing="ease"
              speed={200}
              shadow="0 0 10px #6366f1,0 0 5px #818cf8"
            />
            <AuthProvider>{children}</AuthProvider>
          </ThemeProvider>
        </DictionaryProvider>
      </body>
    </html>
  )
}
