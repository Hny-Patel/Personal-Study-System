'use client'

import { Database } from '@/lib/database.types'
import { TaskCard } from './task-card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

type Task = Database['public']['Tables']['tasks']['Row']
type TaskCategory = Database['public']['Tables']['task_categories']['Row']

interface TaskBoardProps {
  tasks: Task[]
  categories: TaskCategory[]
}

export function TaskBoard({ tasks, categories }: TaskBoardProps) {
  const todos = tasks.filter(t => t.status === 'todo')
  const inProgress = tasks.filter(t => t.status === 'in_progress')
  const done = tasks.filter(t => t.status === 'done')

  // Render columns for desktop
  const renderColumns = () => (
    <div className="hidden sm:grid sm:grid-cols-3 gap-6 h-full items-start">
      <Column title="To Do" tasks={todos} categories={categories} />
      <Column title="In Progress" tasks={inProgress} categories={categories} />
      <Column title="Done" tasks={done} categories={categories} />
    </div>
  )

  // Render tabs for mobile
  const renderTabs = () => (
    <div className="sm:hidden block h-full">
      <Tabs defaultValue="todo" className="w-full h-full flex flex-col">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="todo">To Do</TabsTrigger>
          <TabsTrigger value="in_progress">In Progress</TabsTrigger>
          <TabsTrigger value="done">Done</TabsTrigger>
        </TabsList>
        <TabsContent value="todo" className="flex-1 mt-4">
          <ColumnContent tasks={todos} categories={categories} />
        </TabsContent>
        <TabsContent value="in_progress" className="flex-1 mt-4">
          <ColumnContent tasks={inProgress} categories={categories} />
        </TabsContent>
        <TabsContent value="done" className="flex-1 mt-4">
          <ColumnContent tasks={done} categories={categories} />
        </TabsContent>
      </Tabs>
    </div>
  )

  return (
    <>
      {renderColumns()}
      {renderTabs()}
    </>
  )
}

function Column({ title, tasks, categories }: { title: string, tasks: Task[], categories: TaskCategory[] }) {
  return (
    <div className="flex flex-col bg-zinc-100 dark:bg-zinc-900 rounded-lg p-4 h-full min-h-[500px]">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold">{title}</h3>
        <span className="text-xs bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 py-1 px-2 rounded-full">
          {tasks.length}
        </span>
      </div>
      <ColumnContent tasks={tasks} categories={categories} />
    </div>
  )
}

function ColumnContent({ tasks, categories }: { tasks: Task[], categories: TaskCategory[] }) {
  if (tasks.length === 0) {
    return (
      <div className="flex items-center justify-center h-24 border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-lg text-sm text-zinc-500">
        No tasks
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      {tasks.map(task => (
        <TaskCard key={task.id} task={task} categories={categories} />
      ))}
    </div>
  )
}
