'use client'

import Link from 'next/link'
import { useTranslations } from 'next-intl'

interface PendingApprovalProps {
  count: number
}

export default function PendingApproval({ count }: PendingApprovalProps) {
  const t = useTranslations()
  
  if (count === 0) return null
  
  return (
    <Link href="/approval/pending">
      <div className="card cursor-pointer hover:bg-gray-50 transition-colors">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="icon-btn bg-yellow-50">
              <svg className="w-5 h-5 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div>
              <p className="font-medium">{t('home.pendingApproval')}</p>
              <p className="text-sm text-gray-500">{t('home.waitingForYou')}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full min-w-[24px] text-center">
              {count}
            </span>
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>
      </div>
    </Link>
  )
}
