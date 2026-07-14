import { createClient } from '@/lib/supabase/server'
import { Database } from '@/lib/database.types'

type Task = Database['public']['Tables']['tasks']['Row']
type TaskInsert = Database['public']['Tables']['tasks']['Insert']
type TaskUpdate = Database['public']['Tables']['tasks']['Update']

type TaskCategory = Database['public']['Tables']['task_categories']['Row']
type TaskCategoryInsert = Database['public']['Tables']['task_categories']['Insert']
type TaskCategoryUpdate = Database['public']['Tables']['task_categories']['Update']

type StudySession = Database['public']['Tables']['study_sessions']['Row']
type StudySessionInsert = Database['public']['Tables']['study_sessions']['Insert']
type StudySessionUpdate = Database['public']['Tables']['study_sessions']['Update']

type Settings = Database['public']['Tables']['settings']['Row']
type SettingsInsert = Database['public']['Tables']['settings']['Insert']

// -- Tasks --
export async function getTasks() {
  const supabase = await createClient()
  const { data, error } = await supabase.from('tasks').select('*').order('created_at', { ascending: false })
  if (error) throw error
  return data
}

export async function createTask(task: TaskInsert) {
  const supabase = await createClient()
  const { data, error } = await (supabase.from('tasks') as any).insert(task).select().single()
  if (error) throw error
  return data
}

export async function updateTask(id: string, updates: TaskUpdate) {
  const supabase = await createClient()
  const { data, error } = await (supabase.from('tasks') as any).update(updates).eq('id', id).select().single()
  if (error) throw error
  return data
}

export async function deleteTask(id: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('tasks').delete().eq('id', id)
  if (error) throw error
}

export async function updateTaskActualMinutes(taskId: string) {
  const supabase = await createClient()
  const { data: task } = await (supabase.from('tasks') as any).select('status').eq('id', taskId).single()
  
  if (task?.status === 'done') {
    const { data: sessions } = await (supabase.from('study_sessions') as any)
      .select('duration_minutes')
      .eq('task_id', taskId)
      .eq('type', 'focus')
      .eq('completed', true)
      
    if (sessions) {
      const total = sessions.reduce((acc: number, curr: any) => acc + (curr.duration_minutes || 0), 0)
      await (supabase.from('tasks') as any).update({ actual_minutes: total }).eq('id', taskId)
    }
  }
}

// -- Task Categories --
export async function getTaskCategories() {
  const supabase = await createClient()
  const { data, error } = await supabase.from('task_categories').select('*').order('created_at', { ascending: true })
  if (error) throw error
  return data
}

export async function createTaskCategory(category: TaskCategoryInsert) {
  const supabase = await createClient()
  const { data, error } = await (supabase.from('task_categories') as any).insert(category).select().single()
  if (error) throw error
  return data
}

export async function updateTaskCategory(id: string, updates: TaskCategoryUpdate) {
  const supabase = await createClient()
  const { data, error } = await (supabase.from('task_categories') as any).update(updates).eq('id', id).select().single()
  if (error) throw error
  return data
}

export async function deleteTaskCategory(id: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('task_categories').delete().eq('id', id)
  if (error) throw error
}

// -- Study Sessions --
export async function getStudySessions() {
  const supabase = await createClient()
  const { data, error } = await supabase.from('study_sessions').select('*').order('started_at', { ascending: false })
  if (error) throw error
  return data
}

export async function createStudySession(session: StudySessionInsert) {
  const supabase = await createClient()
  const { data, error } = await (supabase.from('study_sessions') as any).insert(session).select().single()
  if (error) throw error
  return data
}

export async function updateStudySession(id: string, updates: StudySessionUpdate) {
  const supabase = await createClient()
  const { data, error } = await (supabase.from('study_sessions') as any).update(updates).eq('id', id).select().single()
  if (error) throw error
  return data
}

export async function deleteStudySession(id: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('study_sessions').delete().eq('id', id)
  if (error) throw error
}

// -- Settings --
export async function getSettings() {
  const supabase = await createClient()
  const { data, error } = await supabase.from('settings').select('*').maybeSingle()
  if (error) throw error
  return data
}

export async function upsertSettings(settings: SettingsInsert) {
  const supabase = await createClient()
  const { data, error } = await (supabase.from('settings') as any).upsert(settings).select().single()
  if (error) throw error
  return data
}

// -- Boards --
export async function getBoards() {
  const supabase = await createClient()
  const { data: boards } = await supabase.from('boards').select('*').order('created_at', { ascending: true })
  return (boards || []) as any[]
}

export async function createBoard(board: Database['public']['Tables']['boards']['Insert']) {
  const supabase = await createClient()
  const { data, error } = await (supabase.from('boards') as any).insert(board).select().single()
  if (error) throw error
  return data
}

export async function updateBoard(id: string, updates: Database['public']['Tables']['boards']['Update']) {
  const supabase = await createClient()
  const { error } = await (supabase.from('boards') as any).update(updates).eq('id', id)
  if (error) throw error
}

export async function deleteBoard(id: string) {
  const supabase = await createClient()
  const { error } = await (supabase.from('boards') as any).delete().eq('id', id)
  if (error) throw error
}

// -- Notes --
export async function getNotes(boardId: string) {
  const supabase = await createClient()
  const { data: notes } = await supabase.from('notes').select('*').eq('board_id', boardId)
  return (notes || []) as any[]
}

export async function createNote(note: Database['public']['Tables']['notes']['Insert']) {
  const supabase = await createClient()
  const { data, error } = await (supabase.from('notes') as any).insert(note).select().single()
  if (error) throw error
  return data
}

export async function updateNote(id: string, updates: Database['public']['Tables']['notes']['Update']) {
  const supabase = await createClient()
  const { error } = await (supabase.from('notes') as any).update(updates).eq('id', id)
  if (error) throw error
}

export async function deleteNote(id: string) {
  const supabase = await createClient()
  const { error } = await (supabase.from('notes') as any).delete().eq('id', id)
  if (error) throw error
}
