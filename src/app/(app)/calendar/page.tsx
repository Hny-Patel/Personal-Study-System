import { getMergedTimeline, CalendarAuthError } from '@/lib/calendar-sync'
import { ReconnectPrompt } from '@/components/calendar/reconnect-prompt'
import { TimelineView, TimelineItem } from '@/components/calendar/timeline-view'
import { format } from 'date-fns'

export default async function CalendarPage() {
  const today = new Date()
  let timeline: TimelineItem[] = []
  let authError = false

  try {
    timeline = await getMergedTimeline(today) as TimelineItem[]
  } catch (err: any) {
    if (err instanceof CalendarAuthError) {
      authError = true
    } else {
      throw err // Unexpected error
    }
  }

  if (authError) {
    return (
      <div className="flex h-full flex-col p-6 items-center justify-center">
        <ReconnectPrompt />
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Today's Schedule</h1>
        <p className="text-zinc-500 mt-1">{format(today, 'EEEE, MMMM do, yyyy')}</p>
      </div>

      <div className="flex-1 overflow-auto rounded-lg border bg-zinc-50/30 dark:bg-zinc-900/20 shadow-sm p-4 lg:p-8">
        <TimelineView items={timeline} />
      </div>
    </div>
  )
}
