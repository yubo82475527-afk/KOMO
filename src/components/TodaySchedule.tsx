'use client'

import { useTranslations, useLocale } from 'next-intl'

interface Shift {
  id: string
  name: string
  start_time: string
  end_time: string
  color: string
  type: string
}

interface Schedule {
  id: string
  user_id: string
  shift_id: string
  date: string
  shifts: Shift
}

interface TodayScheduleProps {
  schedule: Schedule | null
}

export default function TodaySchedule({ schedule }: TodayScheduleProps) {
  const t = useTranslations()
  const locale = useLocale()
  const today = new Date()
  const dateStr = locale === 'zh' 
    ? `${today.getMonth() + 1}月${today.getDate()}日`
    : today.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })
  const weekday = locale === 'zh'
    ? t('schedule.weekdays.' + ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'][today.getDay()])
    : t('schedule.weekdays.' + ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'][today.getDay()])

  const getShiftTypeLabel = (type: string) => {
    switch (type) {
      case 'morning': return t('schedule.shiftTypes.morning')
      case 'afternoon': return t('schedule.shiftTypes.afternoon')
      case 'evening': return t('schedule.shiftTypes.evening')
      case 'off': return t('schedule.shiftTypes.off')
      default: return type
    }
  }

  if (!schedule) {
    return (
      <div className="card">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold">{t('home.todaySchedule')}</h3>
          <span className="text-sm text-gray-500">{dateStr} {weekday}</span>
        </div>
        <div className="flex items-center justify-center py-8 text-gray-400">
          <div className="text-center">
            <svg className="w-12 h-12 mx-auto mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p>{t('home.noSchedule')}</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold">{t('home.todaySchedule')}</h3>
        <span className="text-sm text-gray-500">{dateStr} {weekday}</span>
      </div>
      <div className="flex items-center gap-4">
        <div 
          className="w-3 h-16 rounded-full"
          style={{ backgroundColor: schedule.shifts.color }}
        />
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-medium">{schedule.shifts.name}</span>
            <span 
              className="status-badge"
              style={{ 
                backgroundColor: `${schedule.shifts.color}20`,
                color: schedule.shifts.color 
              }}
            >
              {getShiftTypeLabel(schedule.shifts.type)}
            </span>
          </div>
          <p className="text-sm text-gray-500">
            {schedule.shifts.start_time} - {schedule.shifts.end_time}
          </p>
        </div>
      </div>
    </div>
  )
}
