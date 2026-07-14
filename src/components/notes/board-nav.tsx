'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { Database } from '@/lib/database.types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Plus, MoreVertical, Edit2, Trash2, LayoutDashboard } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { createBoardAction, updateBoardAction, deleteBoardAction } from '@/app/(app)/notes/actions'
import { cn } from '@/lib/utils'

type Board = Database['public']['Tables']['boards']['Row']

export function BoardNav({ boards }: { boards: Board[] }) {
  const params = useParams()
  const router = useRouter()
  const currentBoardId = params.boardId as string

  const [isCreating, setIsCreating] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editTitle, setEditTitle] = useState('')
  
  const [deletingBoard, setDeletingBoard] = useState<Board | null>(null)

  const handleCreate = async () => {
    if (!newTitle.trim()) {
      setIsCreating(false)
      return
    }
    const newBoard = await createBoardAction(newTitle) as any
    setIsCreating(false)
    setNewTitle('')
    router.push(`/notes/${newBoard.id}`)
  }

  const handleRename = async () => {
    if (!editingId || !editTitle.trim()) {
      setEditingId(null)
      return
    }
    await updateBoardAction(editingId, { title: editTitle })
    setEditingId(null)
  }

  const handleDelete = async () => {
    if (!deletingBoard) return
    await deleteBoardAction(deletingBoard.id)
    
    // Redirect logic if we deleted the current board
    if (deletingBoard.id === currentBoardId) {
      const remainingBoards = boards.filter(b => b.id !== deletingBoard.id)
      if (remainingBoards.length > 0) {
        router.push(`/notes/${remainingBoards[0].id}`)
      } else {
        router.push(`/notes`) // Let the layout/page handle creating a default
      }
    }
    setDeletingBoard(null)
  }

  return (
    <div className="w-64 border-r bg-zinc-50/50 dark:bg-zinc-900/50 h-[calc(100vh-4rem)] flex flex-col p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold tracking-tight text-zinc-500 uppercase flex items-center gap-2">
          <LayoutDashboard className="h-4 w-4" /> Boards
        </h2>
        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setIsCreating(true)}>
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto space-y-1">
        {isCreating && (
          <div className="flex items-center gap-2 mb-2">
            <Input 
              value={newTitle}
              onChange={e => setNewTitle(e.target.value)}
              placeholder="Board name..."
              className="h-8 text-sm"
              autoFocus
              onKeyDown={e => {
                if (e.key === 'Enter') handleCreate()
                if (e.key === 'Escape') setIsCreating(false)
              }}
              onBlur={handleCreate}
            />
          </div>
        )}

        {boards.map(board => (
          <div key={board.id} className={cn(
            "group flex items-center justify-between px-3 py-2 rounded-md text-sm font-medium transition-colors",
            currentBoardId === board.id 
              ? "bg-zinc-200/50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50" 
              : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800/50 hover:text-zinc-900 dark:hover:text-zinc-50"
          )}>
            {editingId === board.id ? (
              <Input 
                value={editTitle}
                onChange={e => setEditTitle(e.target.value)}
                className="h-6 text-sm py-0 px-1"
                autoFocus
                onKeyDown={e => {
                  if (e.key === 'Enter') handleRename()
                  if (e.key === 'Escape') setEditingId(null)
                }}
                onBlur={handleRename}
              />
            ) : (
              <>
                <Link href={`/notes/${board.id}`} className="flex-1 truncate block">
                  {board.title}
                </Link>
                
                <DropdownMenu>
                  <DropdownMenuTrigger className="h-6 w-6 inline-flex items-center justify-center rounded-md hover:bg-zinc-200 dark:hover:bg-zinc-800 opacity-0 group-hover:opacity-100 data-[state=open]:opacity-100 focus:opacity-100">
                    <MoreVertical className="h-4 w-4" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => {
                      setEditingId(board.id)
                      setEditTitle(board.title)
                    }}>
                      <Edit2 className="mr-2 h-4 w-4" /> Rename
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-red-600" onClick={() => setDeletingBoard(board)}>
                      <Trash2 className="mr-2 h-4 w-4" /> Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            )}
          </div>
        ))}
      </div>

      <AlertDialog open={!!deletingBoard} onOpenChange={(open) => !open && setDeletingBoard(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Board</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deletingBoard?.title}"? All notes on this board will be permanently deleted. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
