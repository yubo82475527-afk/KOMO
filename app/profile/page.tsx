'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useTranslations } from 'next-intl'
import LanguageSwitcher from '@/components/LanguageSwitcher'

export default function ProfilePage() {
  const supabase = createClient()
  const router = useRouter()
  const t = useTranslations()
  const [userData, setUserData] = useState<any>(null)
  const [myRequests, setMyRequests] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setLoading(false)
        return
      }

      const { data: profile } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single()
      setUserData(profile)

      const { data: requests } = await supabase
        .from('approval_requests')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(3)
      setMyRequests(requests || [])

      setLoading(false)
    }

    fetchData()
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  const menuItems = [
    {
      id: 'my_requests',
      label: t('approval.initiated'),
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      ),
      href: '/approval/initiated'
    },
    {
      id: 'schedule',
      label: t('schedule.mySchedule'),
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
      href: '/schedule/my'
    },
    {
      id: 'checkin_history',
      label: t('checkin.todayRecords'),
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      href: '/checkin'
    },
    {
      id: 'settings',
      label: t('profile.settings'),
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      href: '/settings'
    }
  ]

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending': return t('approval.status.pending')
      case 'approved': return t('approval.status.approved')
      case 'rejected': return t('approval.status.rejected')
      default: return status
    }
  }

  if (loading) {
    return (
      <div className="p-4">
        <p className="text-gray-500 text-center">{t('common.loading')}</p>
      </div>
    )
  }

  if (!userData) {
    return (
      <div className="p-4">
        <p className="text-gray-500 text-center">{t('errors.unauthorized')}</p>
      </div>
    )
  }

  return (
    <div className="p-4 pb-24">
      <header className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold">{t('profile.title')}</h1>
        {userData?.is_admin && (
          <Link href="/admin" className="btn btn-secondary text-sm">
            {t('admin.title')}
          </Link>
        )}
      </header>

      <div className="card">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
            {userData?.avatar_url ? (
              <img src={userData.avatar_url} alt={userData.name} className="w-full h-full rounded-full object-cover" />
            ) : (
              <span className="text-white text-xl font-bold">{userData?.name?.charAt(0) || '?'}</span>
            )}
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-semibold">{userData?.name}</h2>
            <p className="text-sm text-gray-500">{userData?.position || t('home.employee')}</p>
          </div>
          <div className="icon-btn bg-gray-100">
            <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="grid grid-cols-4 gap-4">
          {menuItems.map((item) => (
            <Link
              key={item.id}
              href={item.href}
              className="flex flex-col items-center gap-2 py-2"
            >
              <div className="icon-btn bg-gray-50 text-gray-600">
                {item.icon}
              </div>
              <span className="text-xs text-gray-600">{item.label}</span>
            </Link>
          ))}
        </div>
      </div>

      <LanguageSwitcher />

      <div className="card">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold">{t('approval.initiated')}</h3>
          <Link href="/approval/initiated" className="text-sm text-blue-500">{t('home.viewAll')}</Link>
        </div>

        {myRequests && myRequests.length > 0 ? (
          <div className="space-y-3">
            {myRequests.map((request) => (
              <Link key={request.id} href={`/approval/${request.id}`} className="block">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                  <div>
                    <p className="font-medium text-sm">{request.title}</p>
                    <p className="text-xs text-gray-500">{request.start_date} - {request.end_date}</p>
                  </div>
                  <span className={`status-badge ${
                    request.status === 'pending' ? 'bg-yellow-100 text-yellow-600' :
                    request.status === 'approved' ? 'bg-green-100 text-green-600' :
                    'bg-red-100 text-red-600'
                  }`}>
                    {getStatusLabel(request.status)}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-6 text-gray-400">
            <p>{t('common.noData')}</p>
          </div>
        )}
      </div>

      <div className="card mt-4">
        <button onClick={handleLogout} className="w-full flex items-center justify-between text-red-500">
          <span>{t('common.logout')}</span>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
        </button>
      </div>
    </div>
  )
}
