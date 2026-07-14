'use client'

import { useState } from 'react'
import { Database } from '@/lib/database.types'
import { createCategoryAction, updateCategoryAction, deleteCategoryAction } from '@/app/(app)/settings/actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Trash2 } from 'lucide-react'

type TaskCategory = Database['public']['Tables']['task_categories']['Row']

export function CategoryManager({ categories }: { categories: TaskCategory[] }) {
  const [newCatName, setNewCatName] = useState('')
  const [newCatEstimate, setNewCatEstimate] = useState(25)
  const [newCatColor, setNewCatColor] = useState('#3b82f6')
  const [isCreating, setIsCreating] = useState(false)

  const handleCreate = async () => {
    if (!newCatName.trim()) return
    setIsCreating(true)
    try {
      await createCategoryAction({
        name: newCatName.trim(),
        color: newCatColor,
        default_estimate_minutes: newCatEstimate,
      })
      setNewCatName('')
      setNewCatEstimate(25)
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Task Categories</CardTitle>
        <CardDescription>Manage the categories you use to group tasks.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        
        <div className="space-y-4">
          {categories.length === 0 && <p className="text-sm text-zinc-500">No categories yet.</p>}
          {categories.map(c => (
            <div key={c.id} className="flex items-center gap-4 bg-zinc-50 dark:bg-zinc-900 p-3 rounded-md border border-zinc-200 dark:border-zinc-800">
              <div 
                className="w-4 h-4 rounded-full flex-shrink-0" 
                style={{ backgroundColor: c.color || '#ccc' }} 
              />
              <div className="flex-1 font-medium">{c.name}</div>
              <div className="text-sm text-zinc-500 w-32">{c.default_estimate_minutes} min</div>
              <Button variant="ghost" size="icon" onClick={() => deleteCategoryAction(c.id)} className="text-red-500 hover:text-red-700 hover:bg-red-50">
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>

        <div className="border-t pt-6 space-y-4">
          <h4 className="text-sm font-medium">Add New Category</h4>
          <div className="grid grid-cols-12 gap-4">
            <div className="col-span-6 space-y-2">
              <Label>Name</Label>
              <Input value={newCatName} onChange={e => setNewCatName(e.target.value)} placeholder="e.g. Reading" />
            </div>
            <div className="col-span-3 space-y-2">
              <Label>Default Min</Label>
              <Input type="number" value={newCatEstimate} onChange={e => setNewCatEstimate(parseInt(e.target.value) || 0)} />
            </div>
            <div className="col-span-3 space-y-2">
              <Label>Color</Label>
              <Input type="color" className="h-10 px-2" value={newCatColor} onChange={e => setNewCatColor(e.target.value)} />
            </div>
          </div>
          <Button onClick={handleCreate} disabled={isCreating || !newCatName.trim()}>
            {isCreating ? 'Adding...' : 'Add Category'}
          </Button>
        </div>

      </CardContent>
    </Card>
  )
}
