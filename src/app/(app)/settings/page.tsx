import { getSettings, getTaskCategories } from '@/lib/data-access'
import { SettingsForm } from '@/components/settings/settings-form'
import { CategoryManager } from '@/components/settings/category-manager'

export default async function SettingsPage() {
  const [settings, categories] = await Promise.all([
    getSettings(),
    getTaskCategories()
  ])

  return (
    <div className="flex h-full flex-col max-w-2xl mx-auto w-full pb-10">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-zinc-500 mt-1">Manage your app preferences and task categories.</p>
      </div>

      <div className="space-y-6">
        <SettingsForm initialSettings={settings} />
        <CategoryManager categories={categories} />
      </div>
    </div>
  )
}
