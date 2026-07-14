import { getTasks, getTaskCategories } from '@/lib/data-access'
import { TaskBoard } from '@/components/tasks/task-board'
import { TaskFormDialog } from '@/components/tasks/task-form-dialog'

export default async function TasksPage() {
  const [tasks, categories] = await Promise.all([
    getTasks(),
    getTaskCategories()
  ])

  return (
    <div className="flex h-full flex-col space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Tasks</h1>
          <p className="text-zinc-500 mt-1">Manage your to-dos and track your progress.</p>
        </div>
        <TaskFormDialog categories={categories} />
      </div>
      
      <TaskBoard tasks={tasks} categories={categories} />
    </div>
  )
}
