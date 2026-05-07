import { NextResponse } from 'next/server'

export async function GET() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  
  return NextResponse.json({
    hasUrl: !!supabaseUrl,
    hasKey: !!supabaseAnonKey,
    urlLength: supabaseUrl?.length || 0,
    keyLength: supabaseAnonKey?.length || 0,
    urlPrefix: supabaseUrl?.substring(0, 30) || 'undefined',
    keyPrefix: supabaseAnonKey?.substring(0, 20) || 'undefined',
    nodeEnv: process.env.NODE_ENV
  })
}
