import Link from 'next/link'

const actions = [
  {
    id: 'checkin',
    label: '打卡',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    color: 'bg-blue-50 text-blue-500',
    href: '/checkin'
  },
  {
    id: 'approval',
    label: '请假',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
    color: 'bg-green-50 text-green-500',
    href: '/approval'
  },
  {
    id: 'schedule',
    label: '排班',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
    color: 'bg-orange-50 text-orange-500',
    href: '/schedule/my'
  },
  {
    id: 'employees',
    label: '员工',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
    ),
    color: 'bg-purple-50 text-purple-500',
    href: '/employees'
  }
]

export default function QuickActions() {
  return (
    <div className="card">
      <div className="grid grid-cols-4 gap-4">
        {actions.map((action) => (
          <Link
            key={action.id}
            href={action.href}
            className="flex flex-col items-center gap-2"
          >
            <div className={`icon-btn ${action.color}`}>
              {action.icon}
            </div>
            <span className="text-xs text-gray-600">{action.label}</span>
          </Link>
        ))}
      </div>
    </div>
  )
}
