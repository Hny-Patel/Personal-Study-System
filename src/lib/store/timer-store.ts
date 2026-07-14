import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type TimerMode = 'focus' | 'break' | 'long_break'

export interface TimerSettings {
  pomodoro_work_min: number
  pomodoro_break_min: number
  long_break_min: number
  sessions_before_long_break: number
}

interface TimerState {
  mode: TimerMode
  remainingSeconds: number
  isRunning: boolean
  endTime: number | null
  taskId: string | null
  sessionsCompleted: number
  settings: TimerSettings
  
  // Actions
  initialize: (settings: TimerSettings, activeTaskId?: string | null) => void
  setMode: (mode: TimerMode) => void
  setTaskId: (taskId: string | null) => void
  start: () => void
  pause: () => void
  reset: () => void
  tick: () => void
  completeSession: () => void
}

const defaultSettings: TimerSettings = {
  pomodoro_work_min: 25,
  pomodoro_break_min: 5,
  long_break_min: 15,
  sessions_before_long_break: 4,
}

export const useTimerStore = create<TimerState>()(
  persist(
    (set, get) => ({
      mode: 'focus',
      remainingSeconds: 25 * 60,
      isRunning: false,
      endTime: null,
      taskId: null,
      sessionsCompleted: 0,
      settings: defaultSettings,

      initialize: (settings, activeTaskId) => {
        const state = get()
        set({ settings })
        if (activeTaskId !== undefined) {
          set({ taskId: activeTaskId })
        }
        // If not running and haven't touched remaining time, update it
        if (!state.isRunning && state.endTime === null) {
          const duration = getDurationForMode(state.mode, settings)
          set({ remainingSeconds: duration * 60 })
        }
      },

      setMode: (mode: TimerMode) => {
        const { settings } = get()
        const duration = getDurationForMode(mode, settings)
        set({
          mode,
          remainingSeconds: duration * 60,
          isRunning: false,
          endTime: null,
        })
      },

      setTaskId: (taskId: string | null) => set({ taskId }),

      start: () => {
        const { remainingSeconds, isRunning } = get()
        if (isRunning || remainingSeconds <= 0) return
        
        // Calculate the exact end time based on current time + remaining seconds
        const endTime = Date.now() + remainingSeconds * 1000
        set({ isRunning: true, endTime })
      },

      pause: () => {
        const { isRunning, endTime } = get()
        if (!isRunning || !endTime) return
        
        // Calculate true remaining seconds
        const remaining = Math.max(0, Math.round((endTime - Date.now()) / 1000))
        set({ isRunning: false, remainingSeconds: remaining, endTime: null })
      },

      reset: () => {
        const { mode, settings } = get()
        const duration = getDurationForMode(mode, settings)
        set({
          isRunning: false,
          remainingSeconds: duration * 60,
          endTime: null,
        })
      },

      tick: () => {
        const { isRunning, endTime } = get()
        if (!isRunning || !endTime) return

        const now = Date.now()
        const remaining = Math.max(0, Math.round((endTime - now) / 1000))

        if (remaining <= 0) {
          get().completeSession()
        } else {
          set({ remainingSeconds: remaining })
        }
      },

      completeSession: () => {
        const { mode, sessionsCompleted, settings } = get()
        
        let nextMode: TimerMode = 'focus'
        let newSessionsCompleted = sessionsCompleted

        if (mode === 'focus') {
          newSessionsCompleted += 1
          if (newSessionsCompleted % settings.sessions_before_long_break === 0) {
            nextMode = 'long_break'
          } else {
            nextMode = 'break'
          }
        } else {
          // If we finished a break, go back to focus
          nextMode = 'focus'
        }

        const nextDuration = getDurationForMode(nextMode, settings)

        set({
          isRunning: false,
          endTime: null,
          remainingSeconds: 0, // ensure it hits 0 before transition
          sessionsCompleted: newSessionsCompleted,
        })
        
        // We defer mode switch slightly so UI can react if needed, 
        // but for now switch immediately
        setTimeout(() => {
          set({
            mode: nextMode,
            remainingSeconds: nextDuration * 60,
          })
        }, 100)
      }
    }),
    {
      name: 'study-os-timer',
      partialize: (state) => ({
        mode: state.mode,
        remainingSeconds: state.remainingSeconds,
        isRunning: state.isRunning,
        endTime: state.endTime,
        taskId: state.taskId,
        sessionsCompleted: state.sessionsCompleted,
        // we don't persist settings, we load them from DB
      }),
    }
  )
)

function getDurationForMode(mode: TimerMode, settings: TimerSettings): number {
  switch (mode) {
    case 'focus': return settings.pomodoro_work_min
    case 'break': return settings.pomodoro_break_min
    case 'long_break': return settings.long_break_min
  }
}
