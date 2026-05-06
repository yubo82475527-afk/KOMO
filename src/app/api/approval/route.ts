import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  
  if (!supabaseUrl || !supabaseAnonKey) {
    return NextResponse.json({ error: 'Missing Supabase configuration' }, { status: 500 })
  }
  
  const body = await request.json()
  
  const response = await fetch(`${supabaseUrl}/functions/v1/create_approval`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${supabaseAnonKey}`
    },
    body: JSON.stringify(body)
  })
  
  const data = await response.json()
  return NextResponse.json(data, { status: response.status })
}
