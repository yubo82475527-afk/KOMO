import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import BottomNav from '@/components/BottomNav'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'OA系统',
  description: '移动端办公自动化系统',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN">
      <body className={`${inter.className} bg-gray-100 min-h-screen`}>
        <div className="max-w-md mx-auto bg-white min-h-screen shadow-xl">
          {children}
          <BottomNav />
        </div>
      </body>
    </html>
  )
}
