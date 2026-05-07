'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

interface Schedule {
  id: string
  user_id: string
  shift_id: string
  date: string
  shifts: {
    id: string
    name: string
    color: string
    type: string
  }
}

export default function ScheduleCalendarPage() {
  const router = useRouter()
  const [currentDate, setCurrentDate] = useState(new Date())
  const [schedules, setSchedules] = useState<Schedule[]>([])

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()

  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  const daysInMonth = lastDay.getDate()
  const startDay = firstDay.getDay()

  const dates = []
  for (let i = 0; i < startDay; i++) {
    dates.push(null)
  }
  for (let i = 1; i <= daysInMonth; i++) {
    dates.push(new Date(year, month, i))
  }

  const prevMonth = () => {
    const newDate = new Date(year, month - 1, 1)
    setCurrentDate(newDate)
  }

  const nextMonth = () => {
    const newDate = new Date(year, month + 1, 1)
    setCurrentDate(newDate)
  }

  useEffect(() => {
    const fetchSchedules = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const startDate = new Date(year, month, 1).toISOString().split('T')[0]
      const endDate = new Date(year, month + 1, 0).toISOString().split('T')[0]

      const { data } = await supabase
        .from('schedules')
        .select('*, shifts(*)')
        .eq('user_id', user.id)
        .gte('date', startDate)
        .lte('date', endDate)

      setSchedules(data || [])
    }

    fetchSchedules()
  }, [year, month])

  const scheduleMap = new Map()
  schedules.forEach(s => {
    scheduleMap.set(s.date, s)
  })

  const today = new Date()
  const isToday = (date: Date) => {
    return date.toDateString() === today.toDateString()
  }

  const weekDayNames = ['日', '一', '二', '三', '四', '五', '六']

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
        <h1 className="text-xl font-bold">排班日历</h1>
        <div className="w-10" />
      </header>

      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <button onClick={prevMonth} className="icon-btn bg-gray-100">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <span className="font-semibold">
            {year}年{month + 1}月
          </span>
          <button onClick={nextMonth} className="icon-btn bg-gray-100">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        <div className="grid grid-cols-7 gap-1 mb-2">
          {weekDayNames.map((day) => (
            <div key={day} className="text-center text-xs text-gray-500 py-2">
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {dates.map((date, index) => {
            if (!date) return <div key={index} />

            const dateStr = date.toISOString().split('T')[0]
            const schedule = scheduleMap.get(dateStr)

            return (
              <div
                key={index}
                className={`aspect-square flex flex-col items-center justify-center rounded-xl relative ${
                  isToday(date) ? 'ring-2 ring-blue-500' : ''
                }`}
              >
                <span className={`text-sm ${
                  isToday(date) ? 'text-blue-500 font-bold' : 'text-gray-700'
                }`}>
                  {date.getDate()}
                </span>
                {schedule && (
                  <div
                    className="absolute bottom-1 w-6 h-1 rounded-full"
                    style={{ backgroundColor: schedule.shifts.color }}
                  />
                )}
              </div>
            )
          })}
        </div>
      </div>

      <div className="card mt-4">
        <h3 className="font-semibold mb-3">班次图例</h3>
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-green-500" />
            <span className="text-sm text-gray-600">早班</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-yellow-500" />
            <span className="text-sm text-gray-600">中班</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-red-500" />
            <span className="text-sm text-gray-600">晚班</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-gray-400" />
            <span className="text-sm text-gray-600">休息</span>
          </div>
        </div>
      </div>
    </div>
  )
}
