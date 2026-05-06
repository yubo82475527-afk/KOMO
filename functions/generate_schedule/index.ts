import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_ANON_KEY')!
)

async function handleGenerateSchedule(request: Request): Promise<Response> {
  const { user_ids, start_date, end_date } = await request.json()
  
  const { data: shifts } = await supabase
    .from('shifts')
    .select('id, type')
    .neq('type', 'off')
  
  if (!shifts || shifts.length === 0) {
    return new Response(JSON.stringify({ error: 'No shifts found' }), { status: 500 })
  }
  
  const schedules = []
  const start = new Date(start_date)
  const end = new Date(end_date)
  
  for (const user_id of user_ids) {
    let currentDate = new Date(start)
    
    while (currentDate <= end) {
      const dayOfWeek = currentDate.getDay()
      let shiftIndex = dayOfWeek % shifts.length
      
      if (dayOfWeek === 0 || dayOfWeek === 6) {
        const { data: offShift } = await supabase
          .from('shifts')
          .select('id')
          .eq('type', 'off')
          .single()
        if (offShift) {
          schedules.push({
            user_id,
            shift_id: offShift.id,
            date: currentDate.toISOString().split('T')[0]
          })
        }
      } else {
        schedules.push({
          user_id,
          shift_id: shifts[shiftIndex].id,
          date: currentDate.toISOString().split('T')[0]
        })
      }
      
      currentDate.setDate(currentDate.getDate() + 1)
    }
  }
  
  const { error } = await supabase
    .from('schedules')
    .insert(schedules)
  
  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 })
  }
  
  return new Response(JSON.stringify({
    success: true,
    generated: schedules.length
  }), { status: 200 })
}

serve(async (req: Request) => {
  if (req.method === 'POST') {
    return await handleGenerateSchedule(req)
  }
  return new Response('Method not allowed', { status: 405 })
})
