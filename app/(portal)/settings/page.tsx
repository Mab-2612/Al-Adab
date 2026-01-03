import { createClient } from '@/utils/supabase/server'
import { Settings as CogIcon } from 'lucide-react'
import SettingsForms from './SettingsForms'

export default async function SettingsPage() {
  const supabase = await createClient()

  // 1. Get Current User
  const { data: { user } } = await supabase.auth.getUser()
  const userId = user?.id || ''

  // 2. Fetch Profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()

  // 3. Fetch Sessions (For Admins)
  let sessions: any[] = []
  if (profile?.role === 'admin') {
    const { data } = await supabase
      .from('academic_sessions')
      .select('*')
      .order('name', { ascending: false })
    sessions = data || []
  }

  return (
    <div className="max-w-5xl mx-auto pb-20">
      
      <div className="flex items-center gap-4 mb-8">
        <div className="p-3 bg-slate-100 text-slate-600 rounded-xl">
          <CogIcon className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Account Settings</h1>
          <p className="text-slate-500">Manage your profile, security, and preferences.</p>
        </div>
      </div>

      <SettingsForms 
        profile={profile} 
        sessions={sessions} 
        isAdmin={profile?.role === 'admin'} 
      />

    </div>
  )
}