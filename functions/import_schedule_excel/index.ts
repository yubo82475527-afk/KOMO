import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { read, utils } from 'https://deno.land/x/xlsx@0.18.5/mod.ts'

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_ANON_KEY')!
)

async function handleImportSchedule(request: Request): Promise<Response> {
  const formData = await request.formData()
  const file = formData.get('file') as File
  
  if (!file) {
    return new Response(JSON.stringify({ error: 'No file uploaded' }), { status: 400 })
  }
  
  const arrayBuffer = await file.arrayBuffer()
  const data = new Uint8Array(arrayBuffer)
  const workbook = read(data)
  
  const sheet = workbook.Sheets[workbook.SheetNames[0]]
  const rows = utils.sheet_to_json(sheet) as Array<Record<string, any>>
  
  const schedules = []
  const errors = []
  
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i]
    const rowNum = i + 2
    
    try {
      const { data: user } = await supabase
        .from('users')
        .select('id')
        .eq('email', row.email)
        .single()
      
      if (!user) {
        errors.push({ row: rowNum, error: `User not found: ${row.email}` })
        continue
      }
      
      const { data: shift } = await supabase
        .from('shifts')
        .select('id')
        .eq('name', row.shift)
        .single()
      
      if (!shift) {
        errors.push({ row: rowNum, error: `Shift not found: ${row.shift}` })
        continue
      }
      
      schedules.push({
        user_id: user.id,
        shift_id: shift.id,
        date: row.date
      })
    } catch (e) {
      errors.push({ row: rowNum, error: (e as Error).message })
    }
  }
  
  if (schedules.length > 0) {
    const { error } = await supabase
      .from('schedules')
      .insert(schedules)
    
    if (error) {
      errors.push({ row: 0, error: error.message })
    }
  }
  
  return new Response(JSON.stringify({
    success: errors.length === 0,
    imported: schedules.length,
    errors
  }), { status: 200 })
}

serve(async (req: Request) => {
  if (req.method === 'POST') {
    return await handleImportSchedule(req)
  }
  return new Response('Method not allowed', { status: 405 })
})
