'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function InitiateApprovalPage() {
  const [formData, setFormData] = useState({
    type: 'leave' as const,
    title: '',
    description: '',
    start_date: '',
    end_date: ''
  })
  const [submiting, setSubmiting] = useState(false)
  
  const types = [
    { value: 'leave', label: '请假' },
    { value: 'overtime', label: '加班' },
    { value: 'business_trip', label: '出差' },
    { value: 'other', label: '其他' }
  ]
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmiting(true)
    
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    
    const { data: approvers } = await supabase
      .from('users')
      .select('id')
      .eq('is_admin', true)
    
    const approverIds = approvers?.map(a => a.id) || []
    
    const response = await fetch('/api/approval', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...formData,
        user_id: user.id,
        approvers: approverIds
      })
    })
    
    const result = await response.json()
    if (result.success) {
      alert('申请提交成功')
      window.location.href = '/approval'
    } else {
      alert('提交失败: ' + result.error)
    }
    
    setSubmiting(false)
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
        <h1 className="text-xl font-bold">发起审批</h1>
      </header>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="card">
          <label className="block text-sm font-medium text-gray-700 mb-2">申请类型</label>
          <div className="grid grid-cols-4 gap-2">
            {types.map((type) => (
              <button
                key={type.value}
                type="button"
                onClick={() => setFormData({ ...formData, type: type.value as typeof formData.type })}
                className={`py-2 rounded-xl text-sm font-medium transition-colors ${
                  formData.type === type.value 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {type.label}
              </button>
            ))}
          </div>
        </div>
        
        <div className="card">
          <label className="block text-sm font-medium text-gray-700 mb-2">标题</label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="请输入申请标题"
            className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
        </div>
        
        <div className="card">
          <label className="block text-sm font-medium text-gray-700 mb-2">开始日期</label>
          <input
            type="date"
            value={formData.start_date}
            onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
            className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
        </div>
        
        <div className="card">
          <label className="block text-sm font-medium text-gray-700 mb-2">结束日期</label>
          <input
            type="date"
            value={formData.end_date}
            onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
            className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
        </div>
        
        <div className="card">
          <label className="block text-sm font-medium text-gray-700 mb-2">备注</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="请输入备注信息（可选）"
            rows={4}
            className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          />
        </div>
        
        <button
          type="submit"
          disabled={submiting}
          className="w-full btn btn-primary py-3 text-lg"
        >
          {submiting ? '提交中...' : '提交申请'}
        </button>
      </form>
    </div>
  )
}
