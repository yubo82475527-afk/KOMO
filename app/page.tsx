import { supabase } from '@/lib/supabase'
import UserCard from '@/components/UserCard'
import QuickActions from '@/components/QuickActions'
import TodaySchedule from '@/components/TodaySchedule'
import PendingApproval from '@/components/PendingApproval'
import Announcements from '@/components/Announcements'

async function getCurrentUser() {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single()
  
  return data
}

async function getTodaySchedule(userId: string) {
  const today = new Date().toISOString().split('T')[0]
  const { data, error } = await supabase
    .from('schedules')
    .select('*, shifts(*)')
    .eq('user_id', userId)
    .eq('date', today)
    .single()
  
  return data
}

async function getPendingApprovals(userId: string) {
  const { data, error } = await supabase
    .from('approval_requests')
    .select('*')
    .eq('user_id', userId)
    .eq('status', 'pending')
  
  return data?.length || 0
}

async function getAnnouncements() {
  const { data, error } = await supabase
    .from('announcements')
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: false })
    .limit(5)
  
  return data
}

export default async function Home() {
  const user = await getCurrentUser()
  const schedule = user ? await getTodaySchedule(user.id) : null
  const pendingCount = user ? await getPendingApprovals(user.id) : 0
  const announcements = await getAnnouncements() || []
  
  console.log('Supabase URL configured:', process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Yes' : 'No')
  console.log('Current user:', user)
  
  return (
    <div className="p-4 pb-24">
      <header className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold">OA系统</h1>
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
