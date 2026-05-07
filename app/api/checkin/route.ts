import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    
    if (!supabaseUrl || !supabaseAnonKey) {
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 })
    }
    
    const { createServerClient } = await import('@supabase/ssr')
    const { cookies } = await import('next/headers')
    const cookieStore = await cookies()
    
    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
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
  } catch (error: any) {
    console.error('Checkin API error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
