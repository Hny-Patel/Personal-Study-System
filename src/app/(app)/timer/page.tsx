import { getTasks, getSettings } from '@/lib/data-access'
import { TimerApp } from '@/components/timer/timer-app'
import { Database } from '@/lib/database.types'

type Task = Database['public']['Tables']['tasks']['Row']

export default async function TimerPage({
  searchParams,
}: {
  searchParams: Promise<{ taskId?: string }>
}) {
  const { taskId } = await searchParams

  const [tasks, settings] = await Promise.all([
    getTasks(),
    getSettings()
  ])

  // Filter out completed tasks so user doesn't select them for new focus sessions
  const activeTasks = (tasks as Task[]).filter(t => t.status !== 'done')
  
  const initialTaskId = activeTasks.some(t => t.id === taskId) ? taskId : null

  return (
    <div className="flex h-full flex-col">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Study Timer</h1>
        <p className="text-zinc-500 mt-1">Focus on your tasks using the Pomodoro technique.</p>
      </div>
      
      <div className="flex-1 flex items-center justify-center">
        <TimerApp tasks={activeTasks} initialSettings={settings} initialTaskId={initialTaskId} />
      </div>
    </div>
  )
}
