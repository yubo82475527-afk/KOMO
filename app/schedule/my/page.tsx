import Link from 'next/link'
import { supabase } from '@/lib/supabase'

export default async function MySchedulePage() {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return (
      <div className="p-4">
        <p className="text-gray-500 text-center">请先登录</p>
      </div>
    )
  }
  
  const today = new Date()
  const startOfWeek = new Date(today)
  startOfWeek.setDate(today.getDate() - today.getDay() + 1)
  
  const weekDays = []
  for (let i = 0; i < 7; i++) {
    const date = new Date(startOfWeek)
    date.setDate(startOfWeek.getDate() + i)
    weekDays.push(date)
  }
  
  const dates = weekDays.map(d => d.toISOString().split('T')[0])
  
  const { data: schedules } = await supabase
    .from('schedules')
    .select('*, shifts(*)')
    .eq('user_id', user.id)
    .in('date', dates)
  
  const scheduleMap = new Map()
  schedules?.forEach(s => {
    scheduleMap.set(s.date, s)
  })
  
  const weekDayNames = ['一', '二', '三', '四', '五', '六', '日']

  return (
    <div className="p-4 pb-24">
      <header className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold">我的排班</h1>
        <div className="flex gap-2">
          <Link href="/schedule/calendar" className="btn btn-secondary text-sm">日历</Link>
          <Link href="/schedule/stats" className="btn btn-secondary text-sm">统计</Link>
        </div>
      </header>
      
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm text-gray-500">
            {startOfWeek.getMonth() + 1}月{startOfWeek.getDate()}日 - {weekDays[6].getMonth() + 1}月{weekDays[6].getDate()}日
          </span>
          <div className="flex gap-1">
            <button className="icon-btn bg-gray-100">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button className="icon-btn bg-gray-100">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-7 gap-1">
          {weekDays.map((day, index) => {
            const isToday = day.toDateString() === today.toDateString()
            const schedule = scheduleMap.get(day.toISOString().split('T')[0])
            
            return (
              <div key={index} className="flex flex-col items-center">
                <span className={`text-xs mb-1 ${
                  isToday ? 'text-blue-500 font-bold' : 'text-gray-500'
                }`}>周{weekDayNames[index]}</span>
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xs font-medium ${
                  isToday ? 'bg-blue-50 text-blue-500' : 'bg-gray-50'
                }`}>
                  {day.getDate()}
                </div>
                {schedule && (
                  <div 
                    className="w-8 h-1.5 rounded-full mt-1"
                    style={{ backgroundColor: schedule.shifts.color }}
                  />
                )}
              </div>
            )
          })}
        </div>
      </div>
      
      <div className="card">
        <h3 className="font-semibold mb-3">班次详情</h3>
        <div className="space-y-3">
          {weekDays.map((day) => {
            const schedule = scheduleMap.get(day.toISOString().split('T')[0])
            const isToday = day.toDateString() === today.toDateString()
            
            return (
              <div key={day.toISOString()} className={`flex items-center justify-between p-2 rounded-xl ${
                isToday ? 'bg-blue-50' : ''
              }`}>
                <div className="flex items-center gap-3">
                  <span className={`text-sm font-medium w-16 ${
                    isToday ? 'text-blue-500' : 'text-gray-700'
                  }`}>
                    {day.getMonth() + 1}/{day.getDate()}
                  </span>
                  {schedule ? (
                    <>
                      <div 
                        className="w-2 h-6 rounded-full"
                        style={{ backgroundColor: schedule.shifts.color }}
                      />
                      <span className="text-sm">{schedule.shifts.name}</span>
                      <span className="text-xs text-gray-500">
                        {schedule.shifts.start_time} - {schedule.shifts.end_time}
                      </span>
                    </>
                  ) : (
                    <span className="text-sm text-gray-400">休息</span>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
