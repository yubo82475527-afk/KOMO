import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import createIntlMiddleware from 'next-intl/middleware'
import { locales, defaultLocale } from './src/i18n/request'

const intlMiddleware = createIntlMiddleware({
  locales,
  defaultLocale,
  localePrefix: 'never'
})

export async function middleware(request: NextRequest) {
  const localeCookie = request.cookies.get('locale')?.value
  const acceptLanguage = request.headers.get('accept-language') || ''
  
  let locale = localeCookie
  if (!locale || !locales.includes(locale as any)) {
    if (acceptLanguage.includes('zh')) {
      locale = 'zh'
    } else if (acceptLanguage.includes('en')) {
      locale = 'en'
    } else {
      locale = defaultLocale
    }
  }

  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Middleware: Missing Supabase environment variables')
    return intlMiddleware(request)
  }

  const supabase = createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { session } } = await supabase.auth.getSession()
  
  if (session && request.nextUrl.pathname === '/login') {
    const response = NextResponse.redirect(new URL('/', request.url))
    response.cookies.set('locale', locale)
    return response
  }

  supabaseResponse.cookies.set('locale', locale)
  
  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|api|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
