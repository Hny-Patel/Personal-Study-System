'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { Database } from '@/lib/database.types'
import { createBoard, updateBoard, deleteBoard, createNote, updateNote, deleteNote } from '@/lib/data-access'

type BoardInsert = Database['public']['Tables']['boards']['Insert']
type BoardUpdate = Database['public']['Tables']['boards']['Update']
type NoteInsert = Database['public']['Tables']['notes']['Insert']
type NoteUpdate = Database['public']['Tables']['notes']['Update']

// -- Boards --

export async function createBoardAction(title: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const board = await createBoard({ user_id: user.id, title })
  revalidatePath('/notes')
  return board
}

export async function updateBoardAction(id: string, updates: Omit<BoardUpdate, 'user_id'>) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  await updateBoard(id, updates)
  revalidatePath('/notes')
}

export async function deleteBoardAction(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  await deleteBoard(id)
  revalidatePath('/notes')
}

// -- Notes --

export async function createNoteAction(noteData: Omit<NoteInsert, 'user_id'>) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const note = await createNote({ ...noteData, user_id: user.id })
  revalidatePath(`/notes/${noteData.board_id}`)
  return note
}

export async function updateNoteAction(id: string, boardId: string, updates: Omit<NoteUpdate, 'user_id' | 'board_id'>) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  await updateNote(id, updates)
  revalidatePath(`/notes/${boardId}`)
}

export async function deleteNoteAction(id: string, boardId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  await deleteNote(id)
  revalidatePath(`/notes/${boardId}`)
}
