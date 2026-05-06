import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_ANON_KEY')!
)

async function handleApproveRequest(request: Request): Promise<Response> {
  const { request_id, approver_id, action, comment } = await request.json()
  
  const { data: steps, error: stepsError } = await supabase
    .from('approval_steps')
    .select('*')
    .eq('request_id', request_id)
    .order('step_number')
  
  if (stepsError) {
    return new Response(JSON.stringify({ error: stepsError.message }), { status: 500 })
  }
  
  const currentStep = steps.find(s => s.approver_id === approver_id && s.status === 'pending')
  
  if (!currentStep) {
    return new Response(JSON.stringify({ error: 'No pending step for this approver' }), { status: 400 })
  }
  
  const { error: updateError } = await supabase
    .from('approval_steps')
    .update({
      status: action,
      comment,
      approved_at: new Date().toISOString()
    })
    .eq('id', currentStep.id)
  
  if (updateError) {
    return new Response(JSON.stringify({ error: updateError.message }), { status: 500 })
  }
  
  let requestStatus = 'pending'
  
  if (action === 'rejected') {
    requestStatus = 'rejected'
  } else {
    const nextStep = steps.find(s => s.step_number === currentStep.step_number + 1)
    if (!nextStep) {
      requestStatus = 'approved'
    }
  }
  
  const { error: requestError } = await supabase
    .from('approval_requests')
    .update({ status: requestStatus })
    .eq('id', request_id)
  
  if (requestError) {
    return new Response(JSON.stringify({ error: requestError.message }), { status: 500 })
  }
  
  return new Response(JSON.stringify({ success: true, status: requestStatus }), { status: 200 })
}

serve(async (req: Request) => {
  if (req.method === 'POST') {
    return await handleApproveRequest(req)
  }
  return new Response('Method not allowed', { status: 405 })
})
