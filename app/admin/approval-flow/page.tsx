'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

interface ApprovalFlow {
  id: string
  name: string
  description: string | null
  request_type: string
  department_id: string | null
  is_active: boolean
  steps?: ApprovalFlowStep[]
}

interface ApprovalFlowStep {
  id: string
  flow_id: string
  step_number: number
  step_name: string
  approver_type: string
  approver_id: string | null
  approver?: { name: string }
}

interface User {
  id: string
  name: string
  email: string
  is_admin: boolean
}

const typeLabels: Record<string, string> = {
  all: '所有类型',
  leave: '请假',
  overtime: '加班',
  business_trip: '出差',
  other: '其他'
}

const approverTypeLabels: Record<string, string> = {
  specific_user: '指定用户',
  department_manager: '部门主管',
  admin: '管理员',
  role: '角色'
}

export default function ApprovalFlowPage() {
  const [flows, setFlows] = useState<ApprovalFlow[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [editingFlow, setEditingFlow] = useState<ApprovalFlow | null>(null)
  const [showForm, setShowForm] = useState(false)

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    request_type: 'all',
    is_active: true,
    steps: [{ step_number: 1, step_name: '', approver_type: 'specific_user', approver_id: '' }]
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    const supabase = createClient()
    
    const { data: flowsData } = await supabase
      .from('approval_flows')
      .select('*, approval_flow_steps(*, approver:users(name))')
      .order('created_at', { ascending: false })
    
    if (flowsData) {
      setFlows(flowsData.map(f => ({
        ...f,
        steps: f.approval_flow_steps?.sort((a: any, b: any) => a.step_number - b.step_number)
      })))
    }

    const { data: usersData } = await supabase
      .from('users')
      .select('id, name, email, is_admin')
      .order('name')
    
    setUsers(usersData || [])
    setLoading(false)
  }

  const handleAddStep = () => {
    setFormData({
      ...formData,
      steps: [...formData.steps, {
        step_number: formData.steps.length + 1,
        step_name: '',
        approver_type: 'specific_user',
        approver_id: ''
      }]
    })
  }

  const handleRemoveStep = (index: number) => {
    if (formData.steps.length <= 1) return
    const newSteps = formData.steps.filter((_, i) => i !== index)
      .map((s, i) => ({ ...s, step_number: i + 1 }))
    setFormData({ ...formData, steps: newSteps })
  }

  const handleStepChange = (index: number, field: string, value: string) => {
    const newSteps = [...formData.steps]
    newSteps[index] = { ...newSteps[index], [field]: value }
    setFormData({ ...formData, steps: newSteps })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const supabase = createClient()
    
    if (editingFlow) {
      const { error } = await supabase
        .from('approval_flows')
        .update({
          name: formData.name,
          description: formData.description,
          request_type: formData.request_type,
          is_active: formData.is_active
        })
        .eq('id', editingFlow.id)

      if (error) {
        alert('更新失败: ' + error.message)
        return
      }

      await supabase.from('approval_flow_steps').delete().eq('flow_id', editingFlow.id)
      
      for (const step of formData.steps) {
        await supabase.from('approval_flow_steps').insert({
          flow_id: editingFlow.id,
          step_number: step.step_number,
          step_name: step.step_name,
          approver_type: step.approver_type,
          approver_id: step.approver_id || null
        })
      }
    } else {
      const { data: flowData, error } = await supabase
        .from('approval_flows')
        .insert({
          name: formData.name,
          description: formData.description,
          request_type: formData.request_type,
          is_active: formData.is_active
        })
        .select()
        .single()

      if (error) {
        alert('创建失败: ' + error.message)
        return
      }

      for (const step of formData.steps) {
        await supabase.from('approval_flow_steps').insert({
          flow_id: flowData.id,
          step_number: step.step_number,
          step_name: step.step_name,
          approver_type: step.approver_type,
          approver_id: step.approver_id || null
        })
      }
    }

    setShowForm(false)
    setEditingFlow(null)
    setFormData({
      name: '',
      description: '',
      request_type: 'all',
      is_active: true,
      steps: [{ step_number: 1, step_name: '', approver_type: 'specific_user', approver_id: '' }]
    })
    fetchData()
  }

  const handleEdit = (flow: ApprovalFlow) => {
    setEditingFlow(flow)
    setFormData({
      name: flow.name,
      description: flow.description || '',
      request_type: flow.request_type,
      is_active: flow.is_active,
      steps: flow.steps?.map(s => ({
        step_number: s.step_number,
        step_name: s.step_name,
        approver_type: s.approver_type,
        approver_id: s.approver_id || ''
      })) || [{ step_number: 1, step_name: '', approver_type: 'specific_user', approver_id: '' }]
    })
    setShowForm(true)
  }

  const handleDelete = async (flowId: string) => {
    if (!confirm('确定要删除此审批流吗？')) return
    
    const supabase = createClient()
    await supabase.from('approval_flow_steps').delete().eq('flow_id', flowId)
    await supabase.from('approval_flows').delete().eq('id', flowId)
    fetchData()
  }

  const handleToggleActive = async (flow: ApprovalFlow) => {
    const supabase = createClient()
    await supabase
      .from('approval_flows')
      .update({ is_active: !flow.is_active })
      .eq('id', flow.id)
    fetchData()
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
        <div className="flex items-center gap-4">
          <Link href="/admin" className="icon-btn bg-gray-100">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <h1 className="text-xl font-bold">审批流配置</h1>
        </div>
        <button
          onClick={() => {
            setEditingFlow(null)
            setFormData({
              name: '',
              description: '',
              request_type: 'all',
              is_active: true,
              steps: [{ step_number: 1, step_name: '', approver_type: 'specific_user', approver_id: '' }]
            })
            setShowForm(true)
          }}
          className="btn btn-primary text-sm"
        >
          新建审批流
        </button>
      </header>

      {showForm && (
        <div className="card mb-4">
          <h2 className="font-semibold mb-4">{editingFlow ? '编辑审批流' : '新建审批流'}</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">审批流名称</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">描述</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={2}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">适用类型</label>
              <select
                value={formData.request_type}
                onChange={(e) => setFormData({ ...formData, request_type: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">所有类型</option>
                <option value="leave">请假</option>
                <option value="overtime">加班</option>
                <option value="business_trip">出差</option>
                <option value="other">其他</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="is_active"
                checked={formData.is_active}
                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                className="w-4 h-4 text-blue-500"
              />
              <label htmlFor="is_active" className="text-sm text-gray-700">启用</label>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-gray-700">审批步骤</label>
                <button
                  type="button"
                  onClick={handleAddStep}
                  className="text-sm text-blue-500 hover:text-blue-600"
                >
                  + 添加步骤
                </button>
              </div>
              
              <div className="space-y-3">
                {formData.steps.map((step, index) => (
                  <div key={index} className="p-3 bg-gray-50 rounded-xl">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-600">第 {step.step_number} 步</span>
                      {formData.steps.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveStep(index)}
                          className="text-red-500 text-sm"
                        >
                          删除
                        </button>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        placeholder="步骤名称（如：部门主管审批）"
                        value={step.step_name}
                        onChange={(e) => handleStepChange(index, 'step_name', e.target.value)}
                        className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                      <select
                        value={step.approver_type}
                        onChange={(e) => handleStepChange(index, 'approver_type', e.target.value)}
                        className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="specific_user">指定用户</option>
                        <option value="admin">管理员</option>
                      </select>
                    </div>
                    {step.approver_type === 'specific_user' && (
                      <select
                        value={step.approver_id || ''}
                        onChange={(e) => handleStepChange(index, 'approver_id', e.target.value)}
                        className="w-full mt-2 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      >
                        <option value="">选择审批人</option>
                        {users.map(user => (
                          <option key={user.id} value={user.id}>
                            {user.name} ({user.email})
                          </option>
                        ))}
                      </select>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-2">
              <button type="submit" className="flex-1 btn btn-primary py-2">
                {editingFlow ? '更新' : '创建'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false)
                  setEditingFlow(null)
                }}
                className="flex-1 btn btn-secondary py-2"
              >
                取消
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="space-y-4">
        {flows.length === 0 ? (
          <div className="card text-center py-12">
            <p className="text-gray-400">暂无审批流配置</p>
            <p className="text-sm text-gray-400 mt-2">点击右上角按钮创建</p>
          </div>
        ) : (
          flows.map(flow => (
            <div key={flow.id} className="card">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-medium">{flow.name}</h3>
                  <p className="text-sm text-gray-500">{flow.description}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`status-badge ${flow.is_active ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-500'}`}>
                    {flow.is_active ? '已启用' : '已禁用'}
                  </span>
                  <span className="status-badge bg-blue-100 text-blue-600">
                    {typeLabels[flow.request_type]}
                  </span>
                </div>
              </div>
              
              {flow.steps && flow.steps.length > 0 && (
                <div className="mb-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    {flow.steps.map((step, index) => (
                      <div key={step.id} className="flex items-center">
                        <div className="px-3 py-1 bg-gray-100 rounded-lg text-sm">
                          <span className="text-gray-500">{step.step_number}.</span>
                          <span className="font-medium">{step.step_name}</span>
                          <span className="text-gray-400 text-xs ml-1">
                            ({step.approver?.name || approverTypeLabels[step.approver_type]})
                          </span>
                        </div>
                        {index < flow.steps!.length - 1 && (
                          <svg className="w-4 h-4 text-gray-300 mx-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-2">
                <button
                  onClick={() => handleToggleActive(flow)}
                  className={`flex-1 btn py-2 text-sm ${flow.is_active ? 'btn-secondary' : 'bg-green-500 text-white'}`}
                >
                  {flow.is_active ? '禁用' : '启用'}
                </button>
                <button
                  onClick={() => handleEdit(flow)}
                  className="flex-1 btn btn-secondary py-2 text-sm"
                >
                  编辑
                </button>
                <button
                  onClick={() => handleDelete(flow.id)}
                  className="flex-1 btn bg-red-50 text-red-500 py-2 text-sm"
                >
                  删除
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
