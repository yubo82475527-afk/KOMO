import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const { type, latitude, longitude, photo_url } = body

  if (!type || !['checkin', 'checkout'].includes(type)) {
    return NextResponse.json({ error: 'Invalid type' }, { status: 400 })
  }

  const now = new Date()
  const hour = now.getHours()
  const minute = now.getMinutes()
  const timeInMinutes = hour * 60 + minute

  let status = 'valid'
  const workStartTime = 9 * 60
  const workEndTime = 18 * 60

  if (type === 'checkin') {
    if (timeInMinutes > workStartTime + 15) {
      status = 'late'
    }
  } else {
    if (timeInMinutes < workEndTime - 15) {
      status = 'early'
    }
  }

  const { data, error } = await supabase
    .from('checkins')
    .insert({
      user_id: user.id,
      type,
      timestamp: now.toISOString(),
      latitude,
      longitude,
      photo_url,
      status
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true, data })
}
