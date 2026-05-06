import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_ANON_KEY')!
)

const WORKPLACE_LAT = 31.2304
const WORKPLACE_LNG = 121.4737
const GEOFENCE_RADIUS = 500

function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371000
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLng = (lng2 - lng1) * Math.PI / 180
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng/2) * Math.sin(dLng/2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
  return R * c
}

async function handleCheckin(request: Request): Promise<Response> {
  const { user_id, type, latitude, longitude, photo_url } = await request.json()
  
  const distance = calculateDistance(latitude, longitude, WORKPLACE_LAT, WORKPLACE_LNG)
  const isWithinGeofence = distance <= GEOFENCE_RADIUS
  
  const now = new Date()
  const hour = now.getHours()
  let status = 'valid'
  
  if (type === 'checkin' && hour > 9) {
    status = 'late'
  } else if (type === 'checkout' && hour < 18) {
    status = 'early'
  }
  
  if (!isWithinGeofence) {
    status = 'invalid'
  }
  
  const { data, error } = await supabase
    .from('checkins')
    .insert({
      user_id,
      type,
      timestamp: now.toISOString(),
      latitude,
      longitude,
      photo_url,
      status
    })
  
  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 })
  }
  
  return new Response(JSON.stringify({ 
    success: true, 
    data,
    isWithinGeofence,
    distance: Math.round(distance)
  }), { status: 200 })
}

serve(async (req: Request) => {
  if (req.method === 'POST') {
    return await handleCheckin(req)
  }
  return new Response('Method not allowed', { status: 405 })
})
