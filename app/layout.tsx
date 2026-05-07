import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { NextIntlClientProvider } from 'next-intl'
import { getMessages, getLocale } from 'next-intl/server'
import BottomNav from '@/components/BottomNav'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'KOMO OA',
  description: 'Mobile Office Automation System',
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const locale = await getLocale()
  const messages = await getMessages()

  return (
    <html lang={locale}>
      <body className={`${inter.className} bg-gray-100 min-h-screen`}>
        <NextIntlClientProvider messages={messages}>
          <div className="max-w-md mx-auto bg-white min-h-screen shadow-xl">
            {children}
            <BottomNav />
          </div>
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
