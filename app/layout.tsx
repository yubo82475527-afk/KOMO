import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { NextIntlClientProvider } from 'next-intl'
import { cookies } from 'next/headers'
import BottomNav from '@/components/BottomNav'
import zhMessages from '../messages/zh.json'
import enMessages from '../messages/en.json'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'KOMO OA',
  description: 'Mobile Office Automation System',
}

const locales = ['zh', 'en'] as const
type Locale = typeof locales[number]
const defaultLocale: Locale = 'zh'

const messages: Record<Locale, any> = {
  zh: zhMessages,
  en: enMessages
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const cookieStore = await cookies()
  const localeCookie = cookieStore.get('locale')?.value as Locale | undefined
  
  let locale = localeCookie
  if (!locale || !locales.includes(locale)) {
    locale = defaultLocale
  }

  return (
    <html lang={locale}>
      <body className={`${inter.className} bg-gray-100 min-h-screen`}>
        <NextIntlClientProvider messages={messages[locale]} locale={locale}>
          <div className="max-w-md mx-auto bg-white min-h-screen shadow-xl">
            {children}
            <BottomNav />
          </div>
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
