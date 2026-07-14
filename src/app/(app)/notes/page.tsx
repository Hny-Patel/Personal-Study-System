import { redirect } from 'next/navigation'
import { getBoards, createBoard } from '@/lib/data-access'
import { createClient } from '@/lib/supabase/server'

export default async function NotesPage() {
  const boards = await getBoards() as any[]
  
  if (boards.length > 0) {
    redirect(`/notes/${boards[0].id}`)
  } else {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Unauthorized')
      
    const newBoard = await createBoard({ user_id: user.id, title: 'My Board' }) as any
    redirect(`/notes/${newBoard.id}`)
  }
}
