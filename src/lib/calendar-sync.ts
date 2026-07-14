import { createClient } from '@/lib/supabase/server'

export class CalendarAuthError extends Error {
  constructor(message = 'Google Calendar authentication failed') {
    super(message)
    this.name = 'CalendarAuthError'
  }
}

async function fetchWithRefresh(url: string, init: RequestInit, user: any): Promise<Response> {
  const providerToken = user?.user_metadata?.google_provider_token
  const refreshToken = user?.user_metadata?.google_provider_refresh_token
  
  console.log('[Calendar Sync] providerToken exists:', !!providerToken, 'refreshToken exists:', !!refreshToken)
  
  if (!providerToken) {
    console.log('[Calendar Sync] ERROR: No provider token')
    throw new CalendarAuthError('No provider token found')
  }

  // Attempt request with current token
  console.log('[Calendar Sync] Attempting Google API request...')
  let res = await fetch(url, {
    ...init,
    headers: {
      ...init.headers,
      Authorization: `Bearer ${providerToken}`
    }
  })

  console.log('[Calendar Sync] Google API initial response status:', res.status)

  // If unauthorized, try to refresh
  if (res.status === 401 || res.status === 403) {
    console.log('[Calendar Sync] Token expired or invalid, attempting refresh...')
    if (!refreshToken) {
      console.log('[Calendar Sync] ERROR: No refresh token')
      throw new CalendarAuthError('Access token expired and no refresh token available')
    }
    
    // Attempt refresh
    const refreshRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: process.env.GOOGLE_CLIENT_ID || '',
        client_secret: process.env.GOOGLE_CLIENT_SECRET || '',
        refresh_token: refreshToken,
        grant_type: 'refresh_token'
      })
    })

    console.log('[Calendar Sync] Refresh token response status:', refreshRes.status)

    if (!refreshRes.ok) {
      const errText = await refreshRes.text()
      console.log('[Calendar Sync] Refresh failed with body:', errText)
      throw new CalendarAuthError('Failed to refresh Google token')
    }

    const { access_token, refresh_token: new_refresh_token } = await refreshRes.json()
    console.log('[Calendar Sync] Refresh succeeded. Updating DB.')

    // Update tokens in user metadata
    const supabase = await createClient()
    await supabase.auth.updateUser({
      data: {
        google_provider_token: access_token,
        ...(new_refresh_token ? { google_provider_refresh_token: new_refresh_token } : {})
      }
    })

    // Retry original request with new token
    console.log('[Calendar Sync] Retrying original API request...')
    res = await fetch(url, {
      ...init,
      headers: {
        ...init.headers,
        Authorization: `Bearer ${access_token}`
      }
    })

    console.log('[Calendar Sync] Retry response status:', res.status)

    if (!res.ok) {
      console.log('[Calendar Sync] Retry failed with body:', await res.text())
      throw new CalendarAuthError('Google API request failed even after refresh')
    }
  }

  if (!res.ok) {
    console.log('[Calendar Sync] Final error status:', res.status, 'body:', await res.text())
    throw new Error(`Google API returned ${res.status}: ${await res.text()}`)
  }

  return res
}

export async function syncCalendarEvents(timeMin: Date, timeMax: Date) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return // Not logged in
  }

  // Cache check logic: Use a dummy row to track last sync time
  const CACHE_KEY = `SYNC_STATUS_${timeMin.toISOString().split('T')[0]}_${timeMax.toISOString().split('T')[0]}`
  
  const { data: syncStatus } = await (supabase.from('calendar_events_cache') as any)
    .select('synced_at')
    .eq('user_id', user.id)
    .eq('google_event_id', CACHE_KEY)
    .maybeSingle()

  if (syncStatus) {
    const lastSynced = new Date((syncStatus as any).synced_at).getTime()
    const oneMinute = 1 * 60 * 1000
    if (Date.now() - lastSynced < oneMinute) {
      // Cache is fresh, skip live sync
      return
    }
  }

  // Live Sync
  const query = new URLSearchParams({
    timeMin: timeMin.toISOString(),
    timeMax: timeMax.toISOString(),
    singleEvents: 'true',
    orderBy: 'startTime'
  })

  const res = await fetchWithRefresh(
    `https://www.googleapis.com/calendar/v3/calendars/primary/events?${query.toString()}`,
    {},
    user
  )

  const data = await res.json()
  const events = data.items || []

  // Transform and insert
  const toUpsert = events
    .filter((e: any) => e.start?.dateTime && e.end?.dateTime) // Only consider timed events for now
    .map((e: any) => ({
      user_id: user.id,
      google_event_id: e.id,
      title: e.summary || 'Untitled Event',
      start_time: e.start.dateTime,
      end_time: e.end.dateTime,
      synced_at: new Date().toISOString()
    }))

  if (toUpsert.length > 0) {
    await (supabase.from('calendar_events_cache') as any).upsert(toUpsert, { onConflict: 'user_id,google_event_id' })
  }

  // Update sync status
  await (supabase.from('calendar_events_cache') as any).upsert({
    user_id: user.id,
    google_event_id: CACHE_KEY,
    title: 'Sync Status',
    start_time: timeMin.toISOString(),
    end_time: timeMax.toISOString(),
    synced_at: new Date().toISOString()
  }, { onConflict: 'user_id,google_event_id' })
}

export async function getMergedTimeline(date: Date) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  // Ensure time boundary
  const startOfDay = new Date(date)
  startOfDay.setHours(0, 0, 0, 0)
  const endOfDay = new Date(date)
  endOfDay.setHours(23, 59, 59, 999)

  // Trigger sync (it's cache-aware)
  await syncCalendarEvents(startOfDay, endOfDay)

  // Fetch cached events
  const { data: events } = await (supabase
    .from('calendar_events_cache') as any)
    .select('*')
    .eq('user_id', user.id)
    .gte('start_time', startOfDay.toISOString())
    .lte('start_time', endOfDay.toISOString())
    .order('start_time', { ascending: true })

  // Fetch tasks due today
  const { data: tasks } = await (supabase
    .from('tasks') as any)
    .select('*')
    .eq('user_id', user.id)
    .gte('due_date', startOfDay.toISOString())
    .lte('due_date', endOfDay.toISOString())
    .neq('status', 'done')
    .order('due_date', { ascending: true })

  // Merge and sort
  const timeline: Array<{ type: 'event' | 'task'; id: string; title: string; time: string; data: any }> = []

  if (events) {
    events.forEach((e: any) => {
      // ignore sync status keys
      if (e.google_event_id.startsWith('SYNC_STATUS')) return 
      
      timeline.push({
        type: 'event',
        id: e.google_event_id,
        title: e.title,
        time: e.start_time,
        data: e
      })
    })
  }

  if (tasks) {
    tasks.forEach((t: any) => {
      timeline.push({
        type: 'task',
        id: t.id,
        title: t.title,
        time: t.due_date!,
        data: t
      })
    })
  }

  timeline.sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime())

  return timeline
}
