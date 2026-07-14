import { Database } from './database.types'

type StudySession = Database['public']['Tables']['study_sessions']['Row']

/**
 * Returns a local date string like "2023-10-25" for grouping streaks
 * correctly in the user's timezone.
 */
function getLocalDateString(date: Date | string | number) {
  const d = new Date(date)
  // using sv-SE gives ISO-like YYYY-MM-DD locally
  return d.toLocaleDateString('sv-SE')
}

export function calculateDashboardStats(sessions: StudySession[]) {
  const focusSessions = sessions.filter(s => s.type === 'focus')
  
  const todayDate = new Date()
  const todayStr = getLocalDateString(todayDate)
  
  // Calculate today's focus minutes
  const todayFocusMinutes = focusSessions
    .filter(s => getLocalDateString(s.started_at) === todayStr)
    .reduce((total, session) => total + (session.duration_minutes || 0), 0)

  // Group by unique dates
  const datesWithSessions = new Set(focusSessions.map(s => getLocalDateString(s.started_at)))
  
  let streak = 0
  let currentDate = new Date(todayDate)
  let currentStr = getLocalDateString(currentDate)

  // If today has no sessions, check yesterday. If neither has sessions, streak is 0.
  if (!datesWithSessions.has(currentStr)) {
    currentDate.setDate(currentDate.getDate() - 1)
    currentStr = getLocalDateString(currentDate)
    if (!datesWithSessions.has(currentStr)) {
      return { todayFocusMinutes, streak: 0 }
    }
  }

  // Walk backwards
  while (datesWithSessions.has(currentStr)) {
    streak++
    currentDate.setDate(currentDate.getDate() - 1)
    currentStr = getLocalDateString(currentDate)
  }

  return { todayFocusMinutes, streak }
}
