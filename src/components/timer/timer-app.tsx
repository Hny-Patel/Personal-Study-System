'use client'

import { useEffect, useRef, useState } from 'react'
import { useTimerStore } from '@/lib/store/timer-store'
import { Database } from '@/lib/database.types'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Play, Pause, RotateCcw, Bell } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { logStudySession } from '@/app/(app)/timer/actions'
import { cn } from '@/lib/utils'

type Task = Database['public']['Tables']['tasks']['Row']
type Settings = Database['public']['Tables']['settings']['Row']

interface TimerAppProps {
  tasks: Task[]
  initialSettings: Settings | null
  initialTaskId?: string | null
}

const NOTIFICATION_SOUND = 'https://actions.google.com/sounds/v1/alarms/beep_short.ogg'

export function TimerApp({ tasks, initialSettings, initialTaskId }: TimerAppProps) {
  const {
    mode,
    remainingSeconds,
    isRunning,
    endTime,
    taskId,
    setMode,
    setTaskId,
    start,
    pause,
    reset,
    tick,
    initialize,
  } = useTimerStore()

  const [mounted, setMounted] = useState(false)
  
  // To track when to log a session
  const previousMode = useRef(mode)
  const sessionStartTime = useRef<number | null>(null)

  useEffect(() => {
    // Request notification permissions
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission()
    }
  }, [])

  useEffect(() => {
    // Hydrate settings
    const settings = initialSettings ? {
      pomodoro_work_min: initialSettings.pomodoro_work_min,
      pomodoro_break_min: initialSettings.pomodoro_break_min,
      long_break_min: initialSettings.long_break_min,
      sessions_before_long_break: initialSettings.sessions_before_long_break,
    } : {
      pomodoro_work_min: 25,
      pomodoro_break_min: 5,
      long_break_min: 15,
      sessions_before_long_break: 4,
    }
    initialize(settings, initialTaskId)
    setMounted(true)
  }, [initialSettings, initialize, initialTaskId])

  useEffect(() => {
    if (!mounted) return

    const interval = setInterval(() => {
      tick()
    }, 1000)
    
    // Also run tick immediately in case we came back from sleep
    tick()

    return () => clearInterval(interval)
  }, [mounted, tick])

  // Track session start/end
  useEffect(() => {
    if (!mounted) return

    if (isRunning && !sessionStartTime.current) {
      sessionStartTime.current = Date.now()
    }

    if (!isRunning && remainingSeconds === 0 && sessionStartTime.current) {
      // Session naturally completed!
      handleSessionComplete()
    }
  }, [isRunning, remainingSeconds, mounted])
  
  const playSound = () => {
    const audio = new Audio(NOTIFICATION_SOUND)
    audio.play().catch(console.error)
  }

  const handleSessionComplete = async () => {
    if (!sessionStartTime.current) return
    
    const startedAt = new Date(sessionStartTime.current).toISOString()
    const endedAt = new Date().toISOString()
    const durationMinutes = Math.round((Date.now() - sessionStartTime.current) / 60000)
    
    // Trigger notification
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('Time is up!', {
        body: mode === 'focus' ? 'Great job! Time for a break.' : 'Break is over. Back to work!',
        icon: '/favicon.ico',
      })
    }
    playSound()

    try {
      await logStudySession({
        task_id: taskId,
        type: mode === 'focus' ? 'focus' : 'break',
        started_at: startedAt,
        ended_at: endedAt,
        duration_minutes: durationMinutes,
        completed: true,
      })
    } catch (e) {
      console.error('Failed to log study session', e)
    }

    sessionStartTime.current = null
    previousMode.current = mode
  }

  const handleStopManually = async () => {
    pause()
    if (!sessionStartTime.current) return
    
    const startedAt = new Date(sessionStartTime.current).toISOString()
    const endedAt = new Date().toISOString()
    const durationMinutes = Math.round((Date.now() - sessionStartTime.current) / 60000)
    
    // Log partial session
    if (durationMinutes >= 1) { // Only log if they did at least 1 minute
      try {
        await logStudySession({
          task_id: taskId,
          type: mode === 'focus' ? 'focus' : 'break',
          started_at: startedAt,
          ended_at: endedAt,
          duration_minutes: durationMinutes,
          completed: false, // manual stop = incomplete
        })
      } catch (e) {
        console.error('Failed to log partial study session', e)
      }
    }
    
    sessionStartTime.current = null
  }

  if (!mounted) return null

  const minutes = Math.floor(remainingSeconds / 60)
  const seconds = remainingSeconds % 60
  const timeString = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`

  // Ensure document title updates with timer
  if (typeof document !== 'undefined') {
    document.title = isRunning ? `${timeString} - Study OS` : 'Study OS'
  }

  return (
    <Card className="w-full max-w-md mx-auto shadow-sm border-zinc-200 dark:border-zinc-800">
      <CardContent className="p-8 flex flex-col items-center">
        {/* Mode Toggles */}
        <div className="flex bg-zinc-100 dark:bg-zinc-900 rounded-full p-1 mb-8">
          <Button
            variant="ghost"
            className={cn("rounded-full px-6", mode === 'focus' && "bg-white dark:bg-zinc-800 shadow-sm")}
            onClick={() => setMode('focus')}
          >
            Focus
          </Button>
          <Button
            variant="ghost"
            className={cn("rounded-full px-6", mode === 'break' && "bg-white dark:bg-zinc-800 shadow-sm")}
            onClick={() => setMode('break')}
          >
            Short Break
          </Button>
          <Button
            variant="ghost"
            className={cn("rounded-full px-6", mode === 'long_break' && "bg-white dark:bg-zinc-800 shadow-sm")}
            onClick={() => setMode('long_break')}
          >
            Long Break
          </Button>
        </div>

        {/* Big Timer */}
        <div className="text-8xl font-bold tracking-tighter tabular-nums mb-8 text-zinc-900 dark:text-zinc-50">
          {timeString}
        </div>

        {/* Controls */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            size="lg"
            variant={isRunning ? "secondary" : "default"}
            className={cn("w-32 h-14 text-lg font-medium", isRunning ? "bg-zinc-100 text-zinc-900 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-50 dark:hover:bg-zinc-700" : "bg-zinc-900 text-zinc-50 hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200")}
            onClick={isRunning ? pause : start}
          >
            {isRunning ? (
              <><Pause className="mr-2 h-5 w-5" /> Pause</>
            ) : (
              <><Play className="mr-2 h-5 w-5" /> Start</>
            )}
          </Button>
          
          <Button 
            size="icon" 
            variant="outline" 
            className="h-14 w-14 rounded-full"
            onClick={() => {
              handleStopManually()
              reset()
            }}
          >
            <RotateCcw className="h-5 w-5" />
          </Button>
        </div>

        {/* Task Picker */}
        <div className="w-full">
          <Select 
            value={taskId || "none"} 
            onValueChange={(val) => setTaskId(val === "none" ? null : val)}
          >
            <SelectTrigger className="w-full h-12">
              <SelectValue placeholder="What are you working on?" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">No specific task</SelectItem>
              {tasks.map(t => (
                <SelectItem key={t.id} value={t.id}>{t.title}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  )
}
