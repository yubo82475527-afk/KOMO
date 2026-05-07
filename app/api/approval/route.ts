import { NextResponse } from 'next/server'

async function getSupabase() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  
  if (!supabaseUrl || !supabaseAnonKey) {
    return null
  }
  
  const { createServerClient } = await import('@supabase/ssr')
  const { cookies } = await import('next/headers')
  const cookieStore = await cookies()
  
  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() { return cookieStore.getAll() },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        } catch {}
      },
    },
  })
}

export async function POST(request: Request) {
  try {
    const supabase = await getSupabase()
    
    if (!supabase) {
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 })
    }
    
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { type, title, description, start_date, end_date, user_id } = body

    if (!user_id || !type || !title || !start_date || !end_date) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    let approvers: { step_number: number; step_name: string; approver_id: string }[] = []

    try {
      const { data: flowData } = await supabase
        .from('approval_flows')
        .select(`
          *,
          approval_flow_steps(*)
        `)
        .eq('is_active', true)
        .or(`request_type.eq.${type},request_type.eq.all`)
        .order('created_at', { ascending: true })
        .limit(1)
        .maybeSingle()

      if (flowData && flowData.approval_flow_steps && flowData.approval_flow_steps.length > 0) {
        for (const step of flowData.approval_flow_steps) {
          if (step.approver_type === 'specific_user' && step.approver_id) {
            approvers.push({
              step_number: step.step_number,
              step_name: step.step_name,
              approver_id: step.approver_id
            })
          } else if (step.approver_type === 'admin') {
            const { data: admins } = await supabase
              .from('users')
              .select('id')
              .eq('is_admin', true)
            
            if (admins && admins.length > 0) {
              approvers.push({
                step_number: step.step_number,
                step_name: step.step_name,
                approver_id: admins[0].id
              })
            }
          }
        }
      }
    } catch (e) {
      console.log('Approval flows table not found, using default approvers')
    }

    if (approvers.length === 0) {
      const { data: admins } = await supabase
        .from('users')
        .select('id')
        .eq('is_admin', true)
      
      if (!admins || admins.length === 0) {
        return NextResponse.json({ error: '没有找到审批人，请先设置管理员' }, { status: 400 })
      }
      
      approvers = admins.map((admin: { id: string }, index: number) => ({
        step_number: index + 1,
        step_name: `审批步骤 ${index + 1}`,
        approver_id: admin.id
      }))
    }

    const { data: requestData, error: requestError } = await supabase
      .from('approval_requests')
      .insert({
        user_id,
        type,
        title,
        description,
        start_date,
        end_date,
        status: 'pending'
      })
      .select()
      .single()

    if (requestError) {
      return NextResponse.json({ error: requestError.message }, { status: 500 })
    }

    const stepsToInsert = approvers.map(a => ({
      request_id: requestData.id,
      step_number: a.step_number,
      approver_id: a.approver_id,
      status: 'pending'
    }))

    const { error: stepsError } = await supabase
      .from('approval_steps')
      .insert(stepsToInsert)

    if (stepsError) {
      return NextResponse.json({ error: stepsError.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, data: requestData })
  } catch (error: any) {
    console.error('Approval API error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
