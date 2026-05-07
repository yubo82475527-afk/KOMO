import { NextResponse, type NextRequest } from 'next/server'
import { locales, defaultLocale, type Locale } from './src/i18n'

export async function middleware(request: NextRequest) {
  const localeCookie = request.cookies.get('locale')?.value as Locale | undefined
  const acceptLanguage = request.headers.get('accept-language') || ''
  
  let locale = localeCookie
  if (!locale || !locales.includes(locale)) {
    if (acceptLanguage.includes('zh')) {
      locale = 'zh'
    } else if (acceptLanguage.includes('en')) {
      locale = 'en'
    } else {
      locale = defaultLocale
    }
  }

  const response = NextResponse.next()
  response.cookies.set('locale', locale, { path: '/' })
  
  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|api|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
