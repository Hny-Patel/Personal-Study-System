import { getBoards } from '@/lib/data-access'
import { BoardNav } from '@/components/notes/board-nav'

export default async function NotesLayout({ children }: { children: React.ReactNode }) {
  const boards = await getBoards() as any[]

  return (
    <div className="flex h-[calc(100vh-4rem)] -m-4 sm:-m-8 p-0 overflow-hidden bg-zinc-50 dark:bg-zinc-950">
      <BoardNav boards={boards} />
      <div className="flex-1 h-full relative">
        {children}
      </div>
    </div>
  )
}
