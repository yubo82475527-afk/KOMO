'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

interface ApprovalStep {
  request_id: string
}

export default function ApprovalPage() {
  const [myRequests, setMyRequests] = useState<any[]>([])
  const [pendingRequests, setPendingRequests] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const supabase = createClient()
        const { data: { user }, error: userError } = await supabase.auth.getUser()
        
        if (userError) {
          console.error('getUser error:', userError)
        }
        
        if (!user) {
          setLoading(false)
          return
        }

        const { data: myData, error: myError } = await supabase
          .from('approval_requests')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(5)
        
        if (myError) {
          console.error('myData error:', myError)
        }
        setMyRequests(myData || [])

        const { data: steps, error: stepsError } = await supabase
          .from('approval_steps')
          .select('request_id')
          .eq('approver_id', user.id)
          .eq('status', 'pending')

        if (stepsError) {
          console.error('steps error:', stepsError)
        }

        if (steps && steps.length > 0) {
          const requestIds = (steps as ApprovalStep[]).map((s) => s.request_id)
          const { data: pendingData, error: pendingError } = await supabase
            .from('approval_requests')
            .select('*')
            .in('id', requestIds)
          
          if (pendingError) {
            console.error('pendingData error:', pendingError)
          }
          setPendingRequests(pendingData || [])
        }

        setLoading(false)
      } catch (err) {
        console.error('Approval page error:', err)
        setError('加载失败，请刷新页面重试')
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const statusColors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-600',
    approved: 'bg-green-100 text-green-600',
    rejected: 'bg-red-100 text-red-600',
    cancelled: 'bg-gray-100 text-gray-600'
  }

  const statusLabels: Record<string, string> = {
    pending: '待审批',
    approved: '已通过',
    rejected: '已拒绝',
    cancelled: '已取消'
  }

  const typeLabels: Record<string, string> = {
    leave: '请假',
    overtime: '加班',
    business_trip: '出差',
    other: '其他'
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

  if (error) {
    return (
      <div className="p-4 pb-24">
        <div className="card text-center py-12">
          <p className="text-red-500">{error}</p>
          <button onClick={() => window.location.reload()} className="btn btn-primary mt-4">
            刷新页面
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 pb-24">
      <header className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold">审批</h1>
        <Link href="/approval/initiate" className="btn btn-primary text-sm">
          发起申请
        </Link>
      </header>

      <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
        <Link href="/approval/pending" className={`flex-shrink-0 btn ${pendingRequests.length > 0 ? 'btn-primary' : 'btn-secondary'}`}>
          待我审批 ({pendingRequests.length})
        </Link>
        <Link href="/approval/initiated" className="flex-shrink-0 btn btn-secondary">
          我发起的 ({myRequests.length})
        </Link>
      </div>

      <div className="space-y-4">
        {pendingRequests.length > 0 && (
          <>
            <h2 className="font-semibold text-gray-700">待我审批</h2>
            {pendingRequests.slice(0, 3).map((request) => (
              <Link key={request.id} href={`/approval/${request.id}`}>
                <div className="card cursor-pointer hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-medium">{request.title}</h3>
                    <span className={`status-badge ${statusColors[request.status]}`}>
                      {statusLabels[request.status]}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span>{typeLabels[request.type]}</span>
                    <span>{request.start_date} ~ {request.end_date}</span>
                  </div>
                </div>
              </Link>
            ))}
          </>
        )}

        {myRequests.length > 0 && (
          <>
            <h2 className="font-semibold text-gray-700 mt-4">我发起的</h2>
            {myRequests.slice(0, 3).map((request) => (
              <Link key={request.id} href={`/approval/${request.id}`}>
                <div className="card cursor-pointer hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-medium">{request.title}</h3>
                    <span className={`status-badge ${statusColors[request.status]}`}>
                      {statusLabels[request.status]}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span>{typeLabels[request.type]}</span>
                    <span>{request.start_date} ~ {request.end_date}</span>
                  </div>
                </div>
              </Link>
            ))}
          </>
        )}

        {pendingRequests.length === 0 && myRequests.length === 0 && (
          <div className="card text-center py-12">
            <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <p className="text-gray-400">暂无审批记录</p>
          </div>
        )}
      </div>
    </div>
  )
}
