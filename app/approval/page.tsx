import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

async function getMyRequests(userId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('approval_requests')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(5)

  return data || []
}

async function getPendingRequests(userId: string) {
  const supabase = await createClient()
  const { data: steps, error } = await supabase
    .from('approval_steps')
    .select('request_id')
    .eq('approver_id', userId)
    .eq('status', 'pending')

  if (!steps || steps.length === 0) return []

  const requestIds = steps.map(s => s.request_id)
  const { data: requests } = await supabase
    .from('approval_requests')
    .select('*')
    .in('id', requestIds)

  return requests || []
}

export default async function ApprovalPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return (
      <div className="p-4">
        <p className="text-gray-500 text-center">请先登录</p>
      </div>
    )
  }

  const myRequests = await getMyRequests(user.id)
  const pendingRequests = await getPendingRequests(user.id)

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

  return (
    <div className="p-4 pb-24">
      <header className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold">审批</h1>
        <Link href="/approval/initiate" className="btn btn-primary text-sm">
          发起申请
        </Link>
      </header>

      <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
        <Link href="/approval/pending" className={`flex-shrink-0 btn ${pendingRequests.length > 0 ? 'btn-primary' : 'btn-secondary'}`}>
          待我审批 ({pendingRequests.length})
        </Link>
        <Link href="/approval/initiated" className={`flex-shrink-0 btn ${pendingRequests.length === 0 ? 'btn-primary' : 'btn-secondary'}`}>
          我发起的 ({myRequests.length})
        </Link>
      </div>

      <div className="space-y-4">
        {pendingRequests.length > 0 && (
          <>
            <h2 className="font-semibold text-gray-700">待我审批</h2>
            {pendingRequests.map((request) => (
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
            ))}
          </>
        )}

        {myRequests.length > 0 && (
          <>
            <h2 className="font-semibold text-gray-700 mt-4">我发起的</h2>
            {myRequests.map((request) => (
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
