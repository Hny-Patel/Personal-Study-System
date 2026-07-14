'use client'

import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { AlertCircle } from 'lucide-react'

export function ReconnectPrompt() {
  const supabase = createClient()

  const handleReconnect = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${location.origin}/auth/callback`,
        scopes: 'https://www.googleapis.com/auth/calendar.readonly',
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        }
      }
    })
  }

  return (
    <div className="flex flex-col items-center justify-center p-6 text-center border rounded-lg bg-red-50/50 dark:bg-red-950/20 border-red-200 dark:border-red-900">
      <AlertCircle className="h-10 w-10 text-red-500 mb-4" />
      <h3 className="text-lg font-semibold mb-2">Google Calendar Disconnected</h3>
      <p className="text-sm text-zinc-500 mb-4 max-w-sm">
        We lost access to your Google Calendar. Please reconnect to sync your events and schedule.
      </p>
      <Button onClick={handleReconnect} variant="destructive">
        Reconnect Google Calendar
      </Button>
    </div>
  )
}
