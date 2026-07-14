import { Board } from '@/components/notes/board'
import { getNotes } from '@/lib/data-access'
import { Node } from '@xyflow/react'
import '@xyflow/react/dist/style.css'

export default async function BoardPage({ params }: { params: Promise<{ boardId: string }> }) {
  const { boardId } = await params
  const dbNotes = await getNotes(boardId)

  const initialNodes: Node[] = dbNotes.map((n: any) => ({
    id: n.id,
    type: 'stickyNote',
    position: { x: Number(n.pos_x), y: Number(n.pos_y) },
    data: { content: n.content || '', color: n.color || 'bg-yellow-200 dark:bg-yellow-800' },
    style: { zIndex: n.z_index, width: Number(n.width) || 250, height: Number(n.height) || 250 }
  }))
  
  return (
    <div className="h-full w-full">
      <Board boardId={boardId} initialNodes={initialNodes} />
    </div>
  )
}
