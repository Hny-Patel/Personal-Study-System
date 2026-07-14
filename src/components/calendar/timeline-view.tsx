import { format, parseISO } from 'date-fns'
import { Calendar as CalendarIcon, Clock } from 'lucide-react'

export interface TimelineItem {
  type: 'event' | 'task'
  id: string
  title: string
  time: string
  data: any
}

export function TimelineView({ items }: { items: TimelineItem[] }) {
  if (items.length === 0) {
    return <div className="text-center text-zinc-500 py-10">No events or tasks scheduled.</div>
  }
  
  return (
    <div className="space-y-4 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-zinc-200 dark:before:via-zinc-700 before:to-transparent">
      {items.map((item, idx) => {
        // Handle potential invalid dates gracefully
        let timeLabel = ''
        try {
          const d = item.time.includes('T') ? new Date(item.time) : parseISO(item.time)
          timeLabel = format(d, 'h:mm a')
        } catch {
          timeLabel = 'All day'
        }

        return (
          <div key={`${item.type}-${item.id}-${idx}`} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active py-2">
            <div className="flex items-center justify-center w-10 h-10 rounded-full border-[3px] border-white dark:border-zinc-950 bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-sm z-10">
              {item.type === 'event' ? <CalendarIcon className="w-4 h-4" /> : <Clock className="w-4 h-4 text-orange-500" />}
            </div>
            <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-white dark:bg-zinc-800/50 p-4 rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-700/50 hover:shadow-md transition-shadow">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-1 gap-1">
                <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 line-clamp-2">{item.title}</h3>
                <time className="text-xs font-medium text-zinc-500 shrink-0 bg-zinc-100 dark:bg-zinc-800 px-2 py-1 rounded-md">{timeLabel}</time>
              </div>
              <div className="mt-2">
                {item.type === 'event' ? (
                  <span className="inline-flex items-center rounded-full bg-blue-50 dark:bg-blue-900/30 px-2 py-1 text-[10px] font-medium text-blue-700 dark:text-blue-400 ring-1 ring-inset ring-blue-700/10">
                    Google Calendar
                  </span>
                ) : (
                  <span className="inline-flex items-center rounded-full bg-orange-50 dark:bg-orange-900/30 px-2 py-1 text-[10px] font-medium text-orange-700 dark:text-orange-400 ring-1 ring-inset ring-orange-700/10">
                    Task Due
                  </span>
                )}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
