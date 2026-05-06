import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'

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

async function handleValidateLocation(request: Request): Promise<Response> {
  const { latitude, longitude } = await request.json()
  
  const distance = calculateDistance(latitude, longitude, WORKPLACE_LAT, WORKPLACE_LNG)
  const isWithinGeofence = distance <= GEOFENCE_RADIUS
  
  return new Response(JSON.stringify({
    success: true,
    isWithinGeofence,
    distance: Math.round(distance),
    radius: GEOFENCE_RADIUS,
    workplace: { lat: WORKPLACE_LAT, lng: WORKPLACE_LNG }
  }), { status: 200 })
}

serve(async (req: Request) => {
  if (req.method === 'POST') {
    return await handleValidateLocation(req)
  }
  return new Response('Method not allowed', { status: 405 })
})
