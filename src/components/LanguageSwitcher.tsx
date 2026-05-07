'use client'

import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { locales, localeNames, type Locale } from '@/i18n'
import { useState, useEffect } from 'react'

export default function LanguageSwitcher() {
  const t = useTranslations()
  const router = useRouter()
  const [currentLocale, setCurrentLocale] = useState<Locale>('zh')

  useEffect(() => {
    const cookieLocale = document.cookie
      .split('; ')
      .find(row => row.startsWith('locale='))
      ?.split('=')[1] as Locale | undefined
    
    if (cookieLocale && locales.includes(cookieLocale)) {
      setCurrentLocale(cookieLocale)
    }
  }, [])

  const handleLocaleChange = async (newLocale: Locale) => {
    document.cookie = `locale=${newLocale};path=/;max-age=31536000`
    setCurrentLocale(newLocale)
    router.refresh()
  }

  return (
    <div className="card">
      <h3 className="font-semibold mb-3">{t('profile.language')}</h3>
      <div className="flex gap-2">
        {locales.map((loc) => (
          <button
            key={loc}
            onClick={() => handleLocaleChange(loc)}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
              currentLocale === loc
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {localeNames[loc]}
          </button>
        ))}
      </div>
    </div>
  )
}
