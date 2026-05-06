import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_ANON_KEY')!
)

async function handleCreateApproval(request: Request): Promise<Response> {
  const { user_id, type, title, description, start_date, end_date, approvers } = await request.json()
  
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
  
  if (requestError) {
    return new Response(JSON.stringify({ error: requestError.message }), { status: 500 })
  }
  
  const requestId = requestData[0].id
  
  const steps = approvers.map((approver_id: string, index: number) => ({
    request_id: requestId,
    approver_id,
    step_number: index + 1,
    status: index === 0 ? 'pending' : 'pending'
  }))
  
  const { error: stepsError } = await supabase
    .from('approval_steps')
    .insert(steps)
  
  if (stepsError) {
    return new Response(JSON.stringify({ error: stepsError.message }), { status: 500 })
  }
  
  return new Response(JSON.stringify({ success: true, data: requestData[0] }), { status: 200 })
}

serve(async (req: Request) => {
  if (req.method === 'POST') {
    return await handleCreateApproval(req)
  }
  return new Response('Method not allowed', { status: 405 })
})
