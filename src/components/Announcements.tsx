'use client'

import { useTranslations, useLocale } from 'next-intl'

interface Announcement {
  id: string
  title: string
  content: string
  priority: string
  created_at: string
}

interface AnnouncementsProps {
  announcements: Announcement[]
}

const priorityColors: Record<string, string> = {
  low: 'bg-gray-100 text-gray-600',
  normal: 'bg-blue-100 text-blue-600',
  high: 'bg-orange-100 text-orange-600',
  urgent: 'bg-red-100 text-red-600'
}

export default function Announcements({ announcements }: AnnouncementsProps) {
  const t = useTranslations()
  const locale = useLocale()

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'low': return locale === 'zh' ? '低' : 'Low'
      case 'normal': return locale === 'zh' ? '普通' : 'Normal'
      case 'high': return locale === 'zh' ? '高' : 'High'
      case 'urgent': return locale === 'zh' ? '紧急' : 'Urgent'
      default: return priority
    }
  }

  if (!announcements || announcements.length === 0) {
    return null
  }

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold">{t('home.announcements')}</h3>
        <span className="text-sm text-blue-500">{t('home.viewAll')}</span>
      </div>
      <div className="space-y-3">
        {announcements.slice(0, 3).map((item) => (
          <div key={item.id} className="pb-3 border-b border-gray-100 last:border-0">
            <div className="flex items-start justify-between gap-2">
              <h4 className="font-medium text-sm flex-1">{item.title}</h4>
              <span className={`status-badge ${priorityColors[item.priority as keyof typeof priorityColors]}`}>
                {getPriorityLabel(item.priority)}
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-1 line-clamp-2">{item.content}</p>
            <p className="text-xs text-gray-400 mt-1">
              {new Date(item.created_at).toLocaleDateString(locale === 'zh' ? 'zh-CN' : 'en-US')}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}
