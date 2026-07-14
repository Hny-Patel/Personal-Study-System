'use client'

import { useState, useEffect } from 'react'
import { Database } from '@/lib/database.types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Calendar } from '@/components/ui/calendar'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { format } from 'date-fns'
import { Calendar as CalendarIcon, Plus } from 'lucide-react'
import { cn } from '@/lib/utils'
import { createNewTask, updateExistingTask, createCategory } from '@/app/(app)/tasks/actions'

type Task = Database['public']['Tables']['tasks']['Row']
type TaskCategory = Database['public']['Tables']['task_categories']['Row']

interface TaskFormDialogProps {
  task?: Task
  categories: TaskCategory[]
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export function TaskFormDialog({ task, categories, open: controlledOpen, onOpenChange }: TaskFormDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false)
  const open = controlledOpen !== undefined ? controlledOpen : internalOpen
  const setOpen = onOpenChange || setInternalOpen

  const [title, setTitle] = useState(task?.title || '')
  const [description, setDescription] = useState(task?.description || '')
  const [categoryId, setCategoryId] = useState<string>(task?.category_id || '')
  const [priority, setPriority] = useState<Task['priority']>(task?.priority || 'medium')
  const [status, setStatus] = useState<Task['status']>(task?.status || 'todo')
  const [dueDate, setDueDate] = useState<Date | undefined>(task?.due_date ? new Date(task?.due_date) : undefined)
  const [estimatedMinutes, setEstimatedMinutes] = useState<string>(task?.estimated_minutes?.toString() || '')

  // Inline new category state
  const [isCreatingCategory, setIsCreatingCategory] = useState(false)
  const [newCategoryName, setNewCategoryName] = useState('')

  // When a category is selected, default the estimated minutes if it's a new task
  useEffect(() => {
    if (!task && categoryId && !isCreatingCategory) {
      const selectedCategory = categories.find(c => c.id === categoryId)
      if (selectedCategory?.default_estimate_minutes) {
        setEstimatedMinutes(selectedCategory.default_estimate_minutes.toString())
      }
    }
  }, [categoryId, task, categories, isCreatingCategory])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    let finalCategoryId = categoryId

    // Handle inline category creation
    if (isCreatingCategory && newCategoryName.trim()) {
      const newCat = await createCategory(newCategoryName.trim(), 25)
      finalCategoryId = newCat.id
    }

    const payload = {
      title,
      description: description || null,
      category_id: finalCategoryId || null,
      priority,
      status,
      due_date: dueDate ? dueDate.toISOString() : null,
      estimated_minutes: estimatedMinutes ? parseInt(estimatedMinutes, 10) : null,
    }

    if (task) {
      await updateExistingTask(task.id, payload)
    } else {
      await createNewTask(payload)
    }

    setOpen(false)
    if (!task) {
      // Reset form if it was a create action
      setTitle('')
      setDescription('')
      setCategoryId('')
      setPriority('medium')
      setStatus('todo')
      setDueDate(undefined)
      setEstimatedMinutes('')
      setIsCreatingCategory(false)
      setNewCategoryName('')
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {!task && (
        <DialogTrigger className="inline-flex h-9 items-center justify-center rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-zinc-50 shadow transition-colors hover:bg-zinc-900/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-950 disabled:pointer-events-none disabled:opacity-50 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-50/90 dark:focus-visible:ring-zinc-300">
          <Plus className="h-4 w-4 mr-2" /> New Task
        </DialogTrigger>
      )}
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{task ? 'Edit Task' : 'Create Task'}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            
            <div className="space-y-2">
              <Label htmlFor="title">Title <span className="text-red-500">*</span></Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="What needs to be done?"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={status} onValueChange={(v) => setStatus(v as Task['status'])}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todo">To Do</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="done">Done</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Priority</Label>
                <Select value={priority} onValueChange={(v) => setPriority(v as Task['priority'])}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Category</Label>
                <Button 
                  type="button" 
                  variant="link" 
                  className="h-auto p-0 text-xs"
                  onClick={() => setIsCreatingCategory(!isCreatingCategory)}
                >
                  {isCreatingCategory ? 'Select existing' : '+ New Category'}
                </Button>
              </div>
              
              {isCreatingCategory ? (
                <Input
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  placeholder="New category name..."
                  required
                />
              ) : (
                <Select value={categoryId} onValueChange={(v) => setCategoryId(v || '')}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((c) => (
                      <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Due Date</Label>
                <Popover>
                  <PopoverTrigger
                    className={cn(
                      "inline-flex h-9 w-full items-center justify-start rounded-md border border-zinc-200 bg-transparent px-3 py-2 text-sm font-normal text-zinc-900 shadow-sm transition-colors hover:bg-zinc-100 hover:text-zinc-900 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-950 disabled:pointer-events-none disabled:opacity-50 dark:border-zinc-800 dark:text-zinc-50 dark:hover:bg-zinc-800 dark:hover:text-zinc-50 dark:focus-visible:ring-zinc-300",
                      !dueDate && "text-zinc-500 dark:text-zinc-400"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dueDate ? format(dueDate, "PPP") : <span>Pick a date</span>}
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={dueDate}
                      onSelect={setDueDate as any}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label htmlFor="estimated_minutes">Estimated Minutes</Label>
                <Input
                  id="estimated_minutes"
                  type="number"
                  min="0"
                  value={estimatedMinutes}
                  onChange={(e) => setEstimatedMinutes(e.target.value)}
                  placeholder="e.g. 25"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Add any extra details here..."
                rows={3}
              />
            </div>

          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">
              {task ? 'Save Changes' : 'Create Task'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
