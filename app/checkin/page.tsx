'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

interface CheckinRecord {
  id: string
  type: 'checkin' | 'checkout'
  timestamp: string
  status: string
}

export default function CheckinPage() {
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [checkinStatus, setCheckinStatus] = useState<'not_checkin' | 'checked_in' | 'checked_out'>('not_checkin')
  const [todayCheckins, setTodayCheckins] = useState<CheckinRecord[]>([])
  const [position, setPosition] = useState<{ latitude: number; longitude: number } | null>(null)
  const [photo, setPhoto] = useState<string | null>(null)
  const [isChecking, setIsChecking] = useState(false)
  const [loading, setLoading] = useState(true)
  const [currentTime, setCurrentTime] = useState(new Date())

  const fetchData = useCallback(async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      setLoading(false)
      return
    }

    const { data } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single()
    setCurrentUser(data)

    const today = new Date().toISOString().split('T')[0]
    const { data: checkins } = await supabase
      .from('checkins')
      .select('*')
      .eq('user_id', user.id)
      .gte('timestamp', `${today}T00:00:00`)
      .lte('timestamp', `${today}T23:59:59`)
      .order('timestamp')

    setTodayCheckins(checkins || [])

    if (checkins && checkins.length > 0) {
      const lastCheckin = checkins[checkins.length - 1]
      setCheckinStatus(lastCheckin.type === 'checkin' ? 'checked_in' : 'checked_out')
    }

    setLoading(false)
  }, [])

  useEffect(() => {
    fetchData()

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setPosition({
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude
          })
        },
        (error) => {
          console.error('获取位置失败:', error)
        }
      )
    }

    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    return () => clearInterval(timer)
  }, [fetchData])

  const handleCheckin = async (type: 'checkin' | 'checkout') => {
    setIsChecking(true)

    try {
      const response = await fetch('/api/checkin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type,
          latitude: position?.latitude,
          longitude: position?.longitude,
          photo_url: photo
        })
      })

      const result = await response.json()
      if (result.success) {
        alert(type === 'checkin' ? '打卡成功' : '签退成功')
        setPhoto(null)
        await fetchData()
      } else {
        alert('操作失败: ' + (result.error || '未知错误'))
      }
    } catch (err) {
      alert('操作失败，请重试')
    } finally {
      setIsChecking(false)
    }
  }

  const handlePhoto = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'
    input.capture = 'environment'
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (!file) return

      const reader = new FileReader()
      reader.onload = (event) => {
        setPhoto(event.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
    input.click()
  }

  const dateStr = `${currentTime.getMonth() + 1}月${currentTime.getDate()}日`
  const timeStr = currentTime.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })

  const statusLabels: Record<string, string> = {
    valid: '正常',
    invalid: '无效',
    late: '迟到',
    early: '早退'
  }

  const statusColors: Record<string, string> = {
    valid: 'text-green-500',
    invalid: 'text-red-500',
    late: 'text-orange-500',
    early: 'text-yellow-500'
  }

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
      <header className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold">打卡</h1>
        <span className="text-sm text-gray-500">{dateStr}</span>
      </header>

      <div className="card text-center py-8">
        <div className={`w-24 h-24 mx-auto mb-4 rounded-full flex items-center justify-center ${
          checkinStatus === 'checked_in' ? 'bg-green-100' : 'bg-blue-100'
        }`}>
          <svg className={`w-12 h-12 ${
            checkinStatus === 'checked_in' ? 'text-green-500' : 'text-blue-500'
          }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {checkinStatus === 'checked_in' ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M5 12a2 2 0 012-2h10a2 2 0 012 2M5 12v-6a2 2 0 012-2h10a2 2 0 012 2v6" />
            )}
          </svg>
        </div>

        <h2 className="text-2xl font-bold mb-1">
          {checkinStatus === 'checked_in' ? '已打卡' : checkinStatus === 'checked_out' ? '已签退' : '未打卡'}
        </h2>
        <p className="text-gray-500 text-sm">
          {checkinStatus === 'checked_in' ? '当前状态: 上班中' : checkinStatus === 'checked_out' ? '今日打卡已完成' : '请点击下方按钮打卡'}
        </p>
        <p className="text-3xl font-bold text-gray-800 mt-4">{timeStr}</p>
      </div>

      {checkinStatus !== 'checked_out' && (
        <div className="card">
          <div className="flex gap-4">
            <button
              onClick={() => handleCheckin('checkin')}
              disabled={checkinStatus === 'checked_in' || isChecking}
              className={`flex-1 btn py-4 ${
                checkinStatus === 'checked_in'
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'btn-primary'
              }`}
            >
              <svg className="w-6 h-6 mx-auto mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{isChecking ? '打卡中...' : '上班打卡'}</span>
            </button>
            <button
              onClick={() => handleCheckin('checkout')}
              disabled={checkinStatus !== 'checked_in' || isChecking}
              className={`flex-1 btn py-4 ${
                checkinStatus !== 'checked_in'
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'btn-secondary'
              }`}
            >
              <svg className="w-6 h-6 mx-auto mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M5 12a2 2 0 012-2h10a2 2 0 012 2M5 12v-6a2 2 0 012-2h10a2 2 0 012 2v6" />
              </svg>
              <span>{isChecking ? '签退中...' : '下班签退'}</span>
            </button>
          </div>

          {checkinStatus === 'not_checkin' && (
            <button
              onClick={handlePhoto}
              className="w-full btn btn-secondary mt-3 py-3 flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              {photo ? '重新拍照' : '拍照打卡'}
            </button>
          )}
        </div>
      )}

      {photo && (
        <div className="card mt-4">
          <h3 className="font-semibold mb-3">拍照预览</h3>
          <img
            src={photo}
            alt="打卡照片"
            className="w-full rounded-xl"
            style={{ maxHeight: '200px', objectFit: 'cover' }}
          />
        </div>
      )}

      <div className="card mt-4">
        <h3 className="font-semibold mb-3">今日记录</h3>
        {todayCheckins.length > 0 ? (
          <div className="space-y-3">
            {todayCheckins.map((record) => (
              <div key={record.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className={`icon-btn ${
                    record.type === 'checkin' ? 'bg-green-50 text-green-500' : 'bg-blue-50 text-blue-500'
                  }`}>
                    {record.type === 'checkin' ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M5 12a2 2 0 012-2h10a2 2 0 012 2M5 12v-6a2 2 0 012-2h10a2 2 0 012 2v6" />
                      </svg>
                    )}
                  </div>
                  <div>
                    <p className="font-medium">
                      {record.type === 'checkin' ? '上班打卡' : '下班签退'}
                    </p>
                    <p className="text-sm text-gray-500">
                      {new Date(record.timestamp).toLocaleTimeString('zh-CN')}
                    </p>
                  </div>
                </div>
                <span className={`text-sm font-medium ${statusColors[record.status] || 'text-gray-500'}`}>
                  {statusLabels[record.status] || record.status}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-400">
            <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p>暂无打卡记录</p>
          </div>
        )}
      </div>
    </div>
  )
}
