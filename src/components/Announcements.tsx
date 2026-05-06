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

const priorityColors = {
  low: 'bg-gray-100 text-gray-600',
  normal: 'bg-blue-100 text-blue-600',
  high: 'bg-orange-100 text-orange-600',
  urgent: 'bg-red-100 text-red-600'
}

const priorityLabels = {
  low: '低',
  normal: '普通',
  high: '高',
  urgent: '紧急'
}

export default function Announcements({ announcements }: AnnouncementsProps) {
  if (!announcements || announcements.length === 0) {
    return null
  }

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold">公告</h3>
        <span className="text-sm text-blue-500">查看全部</span>
      </div>
      <div className="space-y-3">
        {announcements.slice(0, 3).map((item) => (
          <div key={item.id} className="pb-3 border-b border-gray-100 last:border-0">
            <div className="flex items-start justify-between gap-2">
              <h4 className="font-medium text-sm flex-1">{item.title}</h4>
              <span className={`status-badge ${priorityColors[item.priority as keyof typeof priorityColors]}`}>
                {priorityLabels[item.priority as keyof typeof priorityLabels]}
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-1 line-clamp-2">{item.content}</p>
            <p className="text-xs text-gray-400 mt-1">
              {new Date(item.created_at).toLocaleDateString('zh-CN')}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}
