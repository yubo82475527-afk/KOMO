'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

interface User {
  id: string
  name: string
  email: string
}

export default function AdminScheduleListPage() {
  const router = useRouter()
  const supabase = createClient()
  const [users, setUsers] = useState<User[]>([])
  const [selectedUser, setSelectedUser] = useState<string | null>(null)
  const [schedules, setSchedules] = useState<any[]>([])
  
  useEffect(() => {
    const fetchUsers = async () => {
      const { data } = await supabase
        .from('users')
        .select('id, name, email')
      setUsers(data || [])
    }
    fetchUsers()
  }, [])
  
  useEffect(() => {
    const fetchSchedules = async () => {
      if (!selectedUser) return
      
      const { data } = await supabase
        .from('schedules')
        .select('*, shifts(*)')
        .eq('user_id', selectedUser)
        .order('date')
      setSchedules(data || [])
    }
    fetchSchedules()
  }, [selectedUser])

  return (
    <div className="p-4 pb-24">
      <header className="flex items-center justify-between mb-6">
        <button 
          type="button"
          onClick={() => router.back()}
          className="icon-btn bg-gray-100"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="text-xl font-bold">排班管理</h1>
        <Link href="/admin/schedule/import" className="btn btn-primary text-sm">导入</Link>
      </header>
      
      <div className="card">
        <h3 className="font-semibold mb-3">选择员工</h3>
        <div className="space-y-2 max-h-40 overflow-y-auto">
          {users.map((user) => (
            <button
              key={user.id}
              type="button"
              onClick={() => setSelectedUser(user.id)}
              className={`w-full flex items-center justify-between p-3 rounded-xl transition-colors ${
                selectedUser === user.id ? 'bg-blue-50 text-blue-500' : 'bg-gray-50 hover:bg-gray-100'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  selectedUser === user.id ? 'bg-blue-100' : 'bg-gray-200'
                }`}>
                  <span className="text-sm font-medium">{user.name.charAt(0)}</span>
                </div>
                <div className="text-left">
                  <p className="font-medium text-sm">{user.name}</p>
                  <p className="text-xs text-gray-500">{user.email}</p>
                </div>
              </div>
              {selectedUser === user.id && (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              )}
            </button>
          ))}
        </div>
      </div>
      
      {selectedUser && (
        <div className="card mt-4">
          <h3 className="font-semibold mb-3">排班列表</h3>
          {schedules.length > 0 ? (
            <div className="space-y-2">
              {schedules.map((schedule) => (
                <div key={schedule.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-3 h-6 rounded-full"
                      style={{ backgroundColor: schedule.shifts.color }}
                    />
                    <div>
                      <p className="font-medium text-sm">{schedule.date}</p>
                      <p className="text-xs text-gray-500">{schedule.shifts.name} · {schedule.shifts.start_time} - {schedule.shifts.end_time}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button type="button" className="icon-btn bg-blue-50 text-blue-500">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button type="button" className="icon-btn bg-red-50 text-red-500">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-400">
              <p>该员工暂无排班记录</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
