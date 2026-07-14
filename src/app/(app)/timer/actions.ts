'use server'

import { revalidatePath } from 'next/cache'
import { createStudySession, updateTaskActualMinutes } from '@/lib/data-access'
import { createClient } from '@/lib/supabase/server'
import { Database } from '@/lib/database.types'

type StudySessionInsert = Database['public']['Tables']['study_sessions']['Insert']

export async function logStudySession(sessionData: Omit<StudySessionInsert, 'user_id'>) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  await createStudySession({ ...sessionData, user_id: user.id })
  
  if (sessionData.task_id) {
    await updateTaskActualMinutes(sessionData.task_id)
  }
  
  revalidatePath('/tasks') // Revalidate tasks since they might show session data later
  revalidatePath('/timer')
  revalidatePath('/')
}
