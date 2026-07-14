import { getTasks, getStudySessions } from '@/lib/data-access'
import { calculateDashboardStats } from '@/lib/streak-utils'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button, buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import { Clock, CheckCircle2, Flame, ListTodo, CircleDashed, Play } from 'lucide-react'
import { Database } from '@/lib/database.types'

import { TimelineView, TimelineItem } from '@/components/calendar/timeline-view'
import { getMergedTimeline, CalendarAuthError } from '@/lib/calendar-sync'
import { ReconnectPrompt } from '@/components/calendar/reconnect-prompt'

type Task = Database['public']['Tables']['tasks']['Row']

export default async function DashboardPage() {
  const today = new Date()
  let timeline: TimelineItem[] = []
  let authError = false

  try {
    timeline = await getMergedTimeline(today) as TimelineItem[]
  } catch (err: any) {
    if (err instanceof CalendarAuthError) {
      authError = true
    } else {
      throw err
    }
  }

  const [tasks, sessions] = await Promise.all([
    getTasks(),
    getStudySessions()
  ])

  const typedTasks = tasks as Task[]
  const { todayFocusMinutes, streak } = calculateDashboardStats(sessions as any)
  
  // Task counts
  const todo = typedTasks.filter(t => t.status === 'todo').length
  const inProgress = typedTasks.filter(t => t.status === 'in_progress').length
  const done = typedTasks.filter(t => t.status === 'done').length

  // Soonest due incomplete task
  const activeTasks = typedTasks.filter(t => t.status !== 'done')
  const tasksWithDueDate = activeTasks.filter(t => t.due_date)
  
  tasksWithDueDate.sort((a, b) => new Date(a.due_date!).getTime() - new Date(b.due_date!).getTime())
  
  const soonestTask = tasksWithDueDate[0] || activeTasks[0] // fallback to any active if none have due dates

  return (
    <div className="flex h-full flex-col max-w-5xl mx-auto w-full pb-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-zinc-500 mt-1">Welcome back. Here's how you're doing today.</p>
        </div>
        <Link href={`/timer${soonestTask ? `?taskId=${soonestTask.id}` : ''}`} className={cn(buttonVariants({ size: "lg" }), "rounded-full shadow-lg h-12 px-6")}>
          <Play className="mr-2 h-5 w-5" /> Start Studying
        </Link>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Focus</CardTitle>
            <Clock className="h-4 w-4 text-zinc-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{todayFocusMinutes} min</div>
            <p className="text-xs text-zinc-500">Total time in focus sessions today</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Streak</CardTitle>
            <Flame className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{streak} days</div>
            <p className="text-xs text-zinc-500">Consecutive days of studying</p>
          </CardContent>
        </Card>
        
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Task Snapshot</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-around items-center pt-2">
              <div className="flex flex-col items-center">
                <ListTodo className="h-5 w-5 text-zinc-400 mb-1" />
                <span className="text-xl font-bold">{todo}</span>
                <span className="text-xs text-zinc-500">To Do</span>
              </div>
              <div className="flex flex-col items-center">
                <CircleDashed className="h-5 w-5 text-blue-500 mb-1" />
                <span className="text-xl font-bold">{inProgress}</span>
                <span className="text-xs text-zinc-500">In Progress</span>
              </div>
              <div className="flex flex-col items-center">
                <CheckCircle2 className="h-5 w-5 text-green-500 mb-1" />
                <span className="text-xl font-bold">{done}</span>
                <span className="text-xs text-zinc-500">Completed</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2 flex-1">
        <Card className="flex flex-col min-h-[300px]">
          <CardHeader>
            <CardTitle>Next Up</CardTitle>
            <CardDescription>The most urgent task on your plate.</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col justify-center items-center text-center p-6">
            {soonestTask ? (
              <div className="space-y-4">
                <h3 className="text-xl font-semibold">{soonestTask.title}</h3>
                {soonestTask.due_date && (
                  <p className="text-sm text-red-500 font-medium">
                    Due: {new Date(soonestTask.due_date).toLocaleDateString()}
                  </p>
                )}
                <Link href={`/timer?taskId=${soonestTask.id}`} className={buttonVariants({ variant: "outline" })}>Focus on this</Link>
              </div>
            ) : (
              <div className="text-zinc-500">
                <p>No active tasks right now.</p>
                <Link href="/tasks" className={cn(buttonVariants({ variant: "link" }), "mt-2")}>Go add some tasks</Link>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="flex flex-col min-h-[400px]">
          <CardHeader>
            <CardTitle>Today's Timeline</CardTitle>
            <CardDescription>Your tasks and events for today.</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 overflow-auto bg-zinc-50/30 dark:bg-zinc-900/20 p-4 border-t">
            {authError ? (
              <div className="py-8">
                <ReconnectPrompt />
              </div>
            ) : (
              <TimelineView items={timeline} />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
