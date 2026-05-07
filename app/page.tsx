'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useTranslations } from 'next-intl'
import UserCard from '@/components/UserCard'
import QuickActions from '@/components/QuickActions'
import TodaySchedule from '@/components/TodaySchedule'
import PendingApproval from '@/components/PendingApproval'
import Announcements from '@/components/Announcements'

export default function Home() {
  const t = useTranslations()
  const [user, setUser] = useState<any>(null)
  const [schedule, setSchedule] = useState<any>(null)
  const [pendingCount, setPendingCount] = useState(0)
  const [announcements, setAnnouncements] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      const supabase = createClient()
      
      const { data: { user: authUser } } = await supabase.auth.getUser()
      if (!authUser) {
        setLoading(false)
        return
      }

      const { data: userData } = await supabase
        .from('users')
        .select('*')
        .eq('id', authUser.id)
        .single()
      setUser(userData)

      const today = new Date().toISOString().split('T')[0]
      const { data: scheduleData } = await supabase
        .from('schedules')
        .select('*, shifts(*)')
        .eq('user_id', authUser.id)
        .eq('date', today)
        .single()
      setSchedule(scheduleData)

      const { data: pendingData } = await supabase
        .from('approval_requests')
        .select('*')
        .eq('user_id', authUser.id)
        .eq('status', 'pending')
      setPendingCount(pendingData?.length || 0)

      const { data: announcementsData } = await supabase
        .from('announcements')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(5)
      setAnnouncements(announcementsData || [])

      setLoading(false)
    }

    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="p-4 pb-24">
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 pb-24">
      <header className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold">{t('home.title')}</h1>
        <div className="icon-btn bg-blue-50">
          <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
        </div>
      </header>

      <UserCard user={user} />

      <QuickActions />

      <TodaySchedule schedule={schedule} />

      <PendingApproval count={pendingCount} />

      <Announcements announcements={announcements} />
    </div>
  )
}
