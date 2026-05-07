'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

interface ApprovalRequest {
  id: string
  type: string
  title: string
  description: string
  start_date: string
  end_date: string
  status: string
  user_id: string
  created_at: string
}

interface ApprovalStep {
  id: string
  request_id: string
  approver_id: string
  step_number: number
  status: string
  comment: string
  approved_at: string
  users?: {
    name: string
  }
}

export default function ApprovalDetailPage({ params }: { params: { id: string } }) {
  const [request, setRequest] = useState<ApprovalRequest | null>(null)
  const [steps, setSteps] = useState<ApprovalStep[]>([])
  const [currentUserId, setCurrentUserId] = useState('')
  const [comment, setComment] = useState('')

  useEffect(() => {
    const fetchData = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      setCurrentUserId(user.id)

      const { data: requestData } = await supabase
        .from('approval_requests')
        .select('*')
        .eq('id', params.id)
        .single()
      setRequest(requestData)

      const { data: stepsData } = await supabase
        .from('approval_steps')
        .select('*, users(name)')
        .eq('request_id', params.id)
        .order('step_number')
      setSteps(stepsData || [])
    }

    fetchData()
  }, [params.id])

  const handleApprove = async (action: 'approved' | 'rejected') => {
    const response = await fetch('/api/approve', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        request_id: params.id,
        approver_id: currentUserId,
        action,
        comment
      })
    })

    const result = await response.json()
    if (result.success) {
      alert(action === 'approved' ? '审批通过' : '审批拒绝')
      window.location.href = '/approval'
    } else {
      alert('操作失败: ' + result.error)
    }
  }

  if (!request) {
    return (
      <div className="p-4">
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
        </div>
      </div>
    )
  }

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

  const stepStatusColors = {
    pending: 'bg-gray-200',
    approved: 'bg-green-500',
    rejected: 'bg-red-500'
  }

  const canApprove = steps.some(s => s.approver_id === currentUserId && s.status === 'pending')

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
        <h1 className="text-xl font-bold">审批详情</h1>
      </header>

      <div className="card">
        <div className="flex items-start justify-between mb-4">
          <h2 className="text-lg font-semibold">{request.title}</h2>
          <span className={`status-badge ${statusColors[request.status as keyof typeof statusColors]}`}>
            {statusLabels[request.status as keyof typeof statusLabels]}
          </span>
        </div>

        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-500">类型</span>
            <span>{typeLabels[request.type as keyof typeof typeLabels]}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">时间</span>
            <span>{request.start_date} 至 {request.end_date}</span>
          </div>
          {request.description && (
            <div>
              <span className="text-gray-500 block mb-1">备注</span>
              <p className="text-gray-700">{request.description}</p>
            </div>
          )}
        </div>
      </div>

      <div className="card">
        <h3 className="font-semibold mb-4">审批流程</h3>
        <div className="space-y-6">
          {steps.map((step, index) => (
            <div key={step.id} className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className={`w-3 h-3 rounded-full ${stepStatusColors[step.status as keyof typeof stepStatusColors]}`} />
                {index < steps.length - 1 && (
                  <div className="w-0.5 h-full bg-gray-200 mt-2" />
                )}
              </div>
              <div className="flex-1 pb-6">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium">{step.users?.name || '未知'}</span>
                  <span className="text-xs text-gray-400">第{step.step_number}步</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className={`text-xs ${
                    step.status === 'approved' ? 'text-green-600' :
                    step.status === 'rejected' ? 'text-red-600' : 'text-gray-400'
                  }`}>
                    {step.status === 'approved' ? '已通过' :
                     step.status === 'rejected' ? '已拒绝' : '待审批'}
                  </span>
                  {step.approved_at && (
                    <span className="text-xs text-gray-400">
                      {new Date(step.approved_at).toLocaleString('zh-CN')}
                    </span>
                  )}
                </div>
                {step.comment && (
                  <p className="text-sm text-gray-500 mt-1">备注: {step.comment}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {canApprove && request.status === 'pending' && (
        <div className="card">
          <label className="block text-sm font-medium text-gray-700 mb-2">审批意见</label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="请输入审批意见"
            rows={3}
            className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none mb-4"
          />
          <div className="flex gap-3">
            <button
              onClick={() => handleApprove('rejected')}
              className="flex-1 btn btn-secondary py-3"
            >
              拒绝
            </button>
            <button
              onClick={() => handleApprove('approved')}
              className="flex-1 btn btn-primary py-3"
            >
              通过
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
