import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  
  if (!supabaseUrl || !supabaseAnonKey) {
    return NextResponse.json({ error: 'Missing Supabase configuration' }, { status: 500 })
  }
  
  const formData = await request.formData()
  
  const response = await fetch(`${supabaseUrl}/functions/v1/import_schedule_excel`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${supabaseAnonKey}`
    },
    body: formData
  })
  
  const data = await response.json()
  return NextResponse.json(data, { status: response.status })
}
