import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const { request_id, action, comment } = body

  if (!request_id || !action || !['approved', 'rejected'].includes(action)) {
    return NextResponse.json({ error: 'Invalid parameters' }, { status: 400 })
  }

  const { data: currentStep } = await supabase
    .from('approval_steps')
    .select('*')
    .eq('request_id', request_id)
    .eq('approver_id', user.id)
    .eq('status', 'pending')
    .order('step_number', { ascending: true })
    .limit(1)
    .single()

  if (!currentStep) {
    return NextResponse.json({ error: 'No pending approval step found for this user' }, { status: 400 })
  }

  const { error: updateStepError } = await supabase
    .from('approval_steps')
    .update({
      status: action,
      comment: comment || null,
      approved_at: new Date().toISOString()
    })
    .eq('id', currentStep.id)

  if (updateStepError) {
    return NextResponse.json({ error: updateStepError.message }, { status: 500 })
  }

  if (action === 'rejected') {
    await supabase
      .from('approval_requests')
      .update({ status: 'rejected', updated_at: new Date().toISOString() })
      .eq('id', request_id)

    return NextResponse.json({ success: true, status: 'rejected' })
  }

  const { data: nextStep } = await supabase
    .from('approval_steps')
    .select('*')
    .eq('request_id', request_id)
    .eq('status', 'pending')
    .order('step_number', { ascending: true })
    .limit(1)
    .single()

  if (!nextStep) {
    await supabase
      .from('approval_requests')
      .update({ status: 'approved', updated_at: new Date().toISOString() })
      .eq('id', request_id)

    return NextResponse.json({ success: true, status: 'approved' })
  }

  return NextResponse.json({ success: true, status: 'pending', message: '已进入下一审批步骤' })
}
