'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'

interface User {
  id: string
  name: string
  email: string
  avatar_url?: string
  department_id?: string
  position?: string
}

interface UserCardProps {
  user: User | null
}

export default function UserCard({ user }: UserCardProps) {
  const t = useTranslations()
  const router = useRouter()

  const handleLogin = async () => {
    router.push('/login')
  }

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.refresh()
  }

  if (!user) {
    return (
      <div className="card">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <div className="flex-1">
            <p className="text-gray-400 mb-2">{t('home.loginToView')}</p>
            <button 
              onClick={handleLogin}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg text-sm font-medium hover:bg-blue-600 transition"
            >
              {t('common.login')}
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="card">
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
          {user.avatar_url ? (
            <img src={user.avatar_url} alt={user.name} className="w-full h-full rounded-full object-cover" />
          ) : (
            <span className="text-white text-xl font-bold">{user.name.charAt(0)}</span>
          )}
        </div>
        <div className="flex-1">
          <h2 className="text-lg font-semibold">{user.name}</h2>
          <p className="text-sm text-gray-500">{user.position || t('home.employee')}</p>
        </div>
        <button 
          onClick={handleLogout}
          className="px-3 py-1.5 text-sm text-gray-500 hover:text-red-500 transition"
        >
          {t('common.logout')}
        </button>
      </div>
    </div>
  )
}
