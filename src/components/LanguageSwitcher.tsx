'use client'

import { useRouter } from 'next/navigation'
import { useLocale, useTranslations } from 'next-intl'
import { locales, localeNames, type Locale } from '@/i18n'

export default function LanguageSwitcher() {
  const t = useTranslations()
  const locale = useLocale() as Locale
  const router = useRouter()

  const handleLocaleChange = async (newLocale: Locale) => {
    document.cookie = `locale=${newLocale};path=/;max-age=31536000`
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
              locale === loc
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
