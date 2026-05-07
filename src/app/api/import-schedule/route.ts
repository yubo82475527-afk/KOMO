import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const formData = await request.formData()
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL

  const response = await fetch(`${supabaseUrl}/functions/v1/import_schedule_excel`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${session.access_token}`
    },
    body: formData
  })

  const data = await response.json()
  return NextResponse.json(data, { status: response.status })
}
