'use server'

import { revalidatePath } from 'next/cache'
import { createTask, updateTask, deleteTask, createTaskCategory, updateTaskActualMinutes } from '@/lib/data-access'
import { createClient } from '@/lib/supabase/server'
import { Database } from '@/lib/database.types'

type TaskInsert = Database['public']['Tables']['tasks']['Insert']
type TaskUpdate = Database['public']['Tables']['tasks']['Update']

export async function createNewTask(task: Omit<TaskInsert, 'user_id'>) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  await createTask({ ...task, user_id: user.id })
  revalidatePath('/tasks')
}

export async function updateExistingTask(id: string, updates: Omit<TaskUpdate, 'user_id'>) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  await updateTask(id, updates)
  
  if (updates.status === 'done') {
    await updateTaskActualMinutes(id)
  }
  
  revalidatePath('/tasks')
  revalidatePath('/')
}

export async function removeTask(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  await deleteTask(id)
  revalidatePath('/tasks')
}

export async function createCategory(name: string, defaultEstimateMinutes: number) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const newCategory = await createTaskCategory({
    user_id: user.id,
    name,
    default_estimate_minutes: defaultEstimateMinutes,
  })
  
  revalidatePath('/tasks')
  return newCategory
}
