'use server'

import { revalidatePath } from 'next/cache'
import { upsertSettings, createTaskCategory, updateTaskCategory, deleteTaskCategory } from '@/lib/data-access'
import { createClient } from '@/lib/supabase/server'
import { Database } from '@/lib/database.types'

type SettingsInsert = Database['public']['Tables']['settings']['Insert']
type TaskCategoryInsert = Database['public']['Tables']['task_categories']['Insert']
type TaskCategoryUpdate = Database['public']['Tables']['task_categories']['Update']

export async function saveSettingsAction(settings: Omit<SettingsInsert, 'user_id'>) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')
  
  await upsertSettings({ ...settings, user_id: user.id })
  revalidatePath('/settings')
  revalidatePath('/timer')
}

export async function createCategoryAction(category: Omit<TaskCategoryInsert, 'user_id'>) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')
  
  await createTaskCategory({ ...category, user_id: user.id })
  revalidatePath('/settings')
  revalidatePath('/tasks')
}

export async function updateCategoryAction(id: string, updates: TaskCategoryUpdate) {
  await updateTaskCategory(id, updates)
  revalidatePath('/settings')
  revalidatePath('/tasks')
}

export async function deleteCategoryAction(id: string) {
  await deleteTaskCategory(id)
  revalidatePath('/settings')
  revalidatePath('/tasks')
}
