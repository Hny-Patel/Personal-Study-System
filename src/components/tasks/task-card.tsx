'use client'

import { useState } from 'react'
import { Database } from '@/lib/database.types'
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Clock, Calendar as CalendarIcon, MoreVertical, Edit, Trash2 } from 'lucide-react'
import { format } from 'date-fns'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { TaskFormDialog } from './task-form-dialog'
import { removeTask, updateExistingTask } from '@/app/(app)/tasks/actions'
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

type Task = Database['public']['Tables']['tasks']['Row']
type TaskCategory = Database['public']['Tables']['task_categories']['Row']

interface TaskCardProps {
  task: Task
  categories: TaskCategory[]
}

const priorityColors = {
  low: 'bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-300',
  medium: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  high: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
}

export function TaskCard({ task, categories }: TaskCardProps) {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  
  const category = categories.find(c => c.id === task.category_id)

  const handleDelete = async () => {
    await removeTask(task.id)
    setIsDeleteDialogOpen(false)
  }

  const handleStatusChange = async (newStatus: Task['status']) => {
    await updateExistingTask(task.id, { status: newStatus })
  }

  return (
    <>
      <Card className="hover:shadow-sm transition-shadow">
        <CardHeader className="p-4 pb-2 space-y-0 flex flex-row items-start justify-between">
          <div className="flex flex-wrap gap-2 mb-2">
            <Badge variant="outline" className={priorityColors[task.priority]}>
              {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
            </Badge>
            {category && (
              <Badge variant="secondary">
                {category.name}
              </Badge>
            )}
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger className="inline-flex h-8 w-8 items-center justify-center rounded-md text-sm font-medium transition-colors hover:bg-zinc-100 hover:text-zinc-900 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-950 disabled:pointer-events-none disabled:opacity-50 dark:hover:bg-zinc-800 dark:hover:text-zinc-50 dark:focus-visible:ring-zinc-300">
              <MoreVertical className="h-4 w-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {task.status !== 'todo' && (
                <DropdownMenuItem onClick={() => handleStatusChange('todo')}>
                  Move to To Do
                </DropdownMenuItem>
              )}
              {task.status !== 'in_progress' && (
                <DropdownMenuItem onClick={() => handleStatusChange('in_progress')}>
                  Move to In Progress
                </DropdownMenuItem>
              )}
              {task.status !== 'done' && (
                <DropdownMenuItem onClick={() => handleStatusChange('done')}>
                  Move to Done
                </DropdownMenuItem>
              )}
              <DropdownMenuItem onClick={() => setIsEditDialogOpen(true)}>
                <Edit className="mr-2 h-4 w-4" /> Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setIsDeleteDialogOpen(true)} className="text-red-600">
                <Trash2 className="mr-2 h-4 w-4" /> Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <CardTitle className="text-base font-medium leading-tight mb-1">{task.title}</CardTitle>
          {task.description && (
            <p className="text-sm text-zinc-500 line-clamp-2 mb-3">{task.description}</p>
          )}
          <div className="flex flex-wrap items-center gap-3 text-xs text-zinc-500 mt-3">
            {task.due_date && (
              <div className="flex items-center gap-1">
                <CalendarIcon className="h-3 w-3" />
                {format(new Date(task.due_date), 'MMM d, yyyy')}
              </div>
            )}
            {(task.estimated_minutes != null || task.actual_minutes != null) && (
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {task.estimated_minutes ?? '--'}m est {task.actual_minutes != null && task.actual_minutes > 0 ? `/ ${task.actual_minutes}m act` : ''}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <TaskFormDialog
        task={task}
        categories={categories}
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
      />

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Task</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{task.title}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
