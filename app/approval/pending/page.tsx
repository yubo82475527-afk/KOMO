'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function PendingApprovalPage() {
  const router = useRouter()
  const [requests, setRequests] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setLoading(false)
        return
      }

      const { data: steps } = await supabase
        .from('approval_steps')
        .select('request_id')
        .eq('approver_id', user.id)
        .eq('status', 'pending')

      const requestIds = steps?.map(s => s.request_id) || []
      if (requestIds.length > 0) {
        const { data } = await supabase
          .from('approval_requests')
          .select('*')
          .in('id', requestIds)
        setRequests(data || [])
      }

      setLoading(false)
    }

    fetchData()
  }, [])

  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-600',
    approved: 'bg-green-100 text-green-600',
    rejected: 'bg-red-100 text-red-600',
    cancelled: 'bg-gray-100 text-gray-600'
  }

  const statusLabels = {
    pending: '待审批',
    approved: '已通过',
    rejected: '已拒绝',
    cancelled: '已取消'
  }

  const typeLabels = {
    leave: '请假',
    overtime: '加班',
    business_trip: '出差',
    other: '其他'
  }

  if (loading) {
    return (
      <div className="p-4">
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 pb-24">
      <header className="flex items-center gap-4 mb-6">
        <button
          type="button"
          onClick={() => router.back()}
          className="icon-btn bg-gray-100"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="text-xl font-bold">待我审批</h1>
      </header>

      <div className="space-y-4">
        {requests && requests.length > 0 ? (
          requests.map((request) => (
            <Link key={request.id} href={`/approval/${request.id}`} className="card block">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium">{request.title}</span>
                    <span className={`status-badge ${statusColors[request.status as keyof typeof statusColors]}`}>
                      {statusLabels[request.status as keyof typeof statusLabels]}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500">
                    {typeLabels[request.type as keyof typeof typeLabels]} · {request.start_date} 至 {request.end_date}
                  </p>
                </div>
                <svg className="w-5 h-5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </Link>
          ))
        ) : (
          <div className="card text-center py-12">
            <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <p className="text-gray-400">暂无待审批申请</p>
          </div>
        )}
      </div>
    </div>
  )
}
