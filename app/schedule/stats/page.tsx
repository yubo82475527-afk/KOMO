import { supabase } from '@/lib/supabase'

export default async function ScheduleStatsPage() {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return (
      <div className="p-4">
        <p className="text-gray-500 text-center">请先登录</p>
      </div>
    )
  }
  
  const today = new Date()
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
  const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0)
  
  const { data: schedules } = await supabase
    .from('schedules')
    .select('*, shifts(*)')
    .eq('user_id', user.id)
    .gte('date', startOfMonth.toISOString().split('T')[0])
    .lte('date', endOfMonth.toISOString().split('T')[0])
  
  const shiftStats = {
    morning: 0,
    afternoon: 0,
    evening: 0,
    off: 0
  }
  
  schedules?.forEach(s => {
    if (s.shifts.type in shiftStats) {
      shiftStats[s.shifts.type as keyof typeof shiftStats]++
    }
  })
  
  const totalWorkDays = schedules?.length || 0
  const workDays = totalWorkDays - shiftStats.off
  const attendanceRate = totalWorkDays > 0 ? Math.round((workDays / totalWorkDays) * 100) : 0
  
  const shiftColors = {
    morning: '#10B981',
    afternoon: '#F59E0B',
    evening: '#EF4444',
    off: '#9CA3AF'
  }
  
  const shiftLabels = {
    morning: '早班',
    afternoon: '中班',
    evening: '晚班',
    off: '休息'
  }

  return (
    <div className="p-4 pb-24">
      <header className="flex items-center gap-4 mb-6">
        <button 
          onClick={() => window.history.back()}
          className="icon-btn bg-gray-100"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="text-xl font-bold">排班统计</h1>
        <div className="w-10" />
      </header>
      
      <div className="card">
        <h3 className="font-semibold mb-4">{today.getFullYear()}年{today.getMonth() + 1}月统计</h3>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-blue-50 rounded-xl p-4 text-center">
            <p className="text-3xl font-bold text-blue-500">{workDays}</p>
            <p className="text-sm text-gray-500 mt-1">工作日</p>
          </div>
          <div className="bg-green-50 rounded-xl p-4 text-center">
            <p className="text-3xl font-bold text-green-500">{attendanceRate}%</p>
            <p className="text-sm text-gray-500 mt-1">出勤率</p>
          </div>
        </div>
      </div>
      
      <div className="card mt-4">
        <h3 className="font-semibold mb-4">班次分布</h3>
        
        <div className="space-y-2">
          {Object.entries(shiftStats).map(([type, count]) => (
            <div key={type} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: shiftColors[type as keyof typeof shiftColors] }}
                />
                <span className="text-sm text-gray-600">{shiftLabels[type as keyof typeof shiftLabels]}</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-24 h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full rounded-full"
                    style={{ 
                      width: totalWorkDays > 0 ? `${(count / totalWorkDays) * 100}%` : '0%',
                      backgroundColor: shiftColors[type as keyof typeof shiftColors]
                    }}
                  />
                </div>
                <span className="text-sm font-medium w-12 text-right">{count}天</span>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <div className="card mt-4">
        <h3 className="font-semibold mb-4">本月排班趋势</h3>
        
        <div className="flex items-end justify-between h-32 gap-1">
          {Array.from({ length: endOfMonth.getDate() }, (_, i) => {
            const date = new Date(today.getFullYear(), today.getMonth(), i + 1)
            const dateStr = date.toISOString().split('T')[0]
            const schedule = schedules?.find(s => s.date === dateStr)
            
            return (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <div 
                  className="w-full rounded-t-lg transition-all"
                  style={{ 
                    height: schedule ? '60px' : '8px',
                    backgroundColor: schedule ? schedule.shifts.color : '#E5E7EB'
                  }}
                />
                <span className="text-xs text-gray-400">{i + 1}</span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
