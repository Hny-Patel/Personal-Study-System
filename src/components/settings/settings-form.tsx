'use client'

import { useState } from 'react'
import { Database } from '@/lib/database.types'
import { saveSettingsAction } from '@/app/(app)/settings/actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

type Settings = Database['public']['Tables']['settings']['Row']

interface SettingsFormProps {
  initialSettings: Settings | null
}

export function SettingsForm({ initialSettings }: SettingsFormProps) {
  const [isSaving, setIsSaving] = useState(false)
  const [formData, setFormData] = useState({
    pomodoro_work_min: initialSettings?.pomodoro_work_min ?? 25,
    pomodoro_break_min: initialSettings?.pomodoro_break_min ?? 5,
    long_break_min: initialSettings?.long_break_min ?? 15,
    sessions_before_long_break: initialSettings?.sessions_before_long_break ?? 4,
    theme: initialSettings?.theme ?? 'system',
    ai_estimation_enabled: initialSettings?.ai_estimation_enabled ?? false,
    playlist_url: initialSettings?.playlist_url ?? '',
  })

  const handleChange = (field: string, value: string | number | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      await saveSettingsAction(formData)
    } catch (e) {
      console.error(e)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pomodoro Preferences</CardTitle>
        <CardDescription>Customize your focus and break durations.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="work_min">Focus Duration (min)</Label>
            <Input 
              id="work_min" 
              type="number" 
              min={1} 
              max={120}
              value={formData.pomodoro_work_min} 
              onChange={e => handleChange('pomodoro_work_min', parseInt(e.target.value) || 25)} 
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="break_min">Short Break (min)</Label>
            <Input 
              id="break_min" 
              type="number" 
              min={1} 
              max={60}
              value={formData.pomodoro_break_min} 
              onChange={e => handleChange('pomodoro_break_min', parseInt(e.target.value) || 5)} 
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="long_break_min">Long Break (min)</Label>
            <Input 
              id="long_break_min" 
              type="number" 
              min={1} 
              max={60}
              value={formData.long_break_min} 
              onChange={e => handleChange('long_break_min', parseInt(e.target.value) || 15)} 
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="sessions">Sessions before Long Break</Label>
            <Input 
              id="sessions" 
              type="number" 
              min={1} 
              max={10}
              value={formData.sessions_before_long_break} 
              onChange={e => handleChange('sessions_before_long_break', parseInt(e.target.value) || 4)} 
            />
          </div>
        </div>

        <div className="pt-4 space-y-2 border-t">
          <Label>App Theme</Label>
          <Select value={formData.theme} onValueChange={(val) => handleChange('theme', val || 'system')}>
            <SelectTrigger>
              <SelectValue placeholder="Select theme" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="system">System</SelectItem>
              <SelectItem value="light">Light</SelectItem>
              <SelectItem value="dark">Dark</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving ? 'Saving...' : 'Save Settings'}
        </Button>
      </CardFooter>
    </Card>
  )
}
