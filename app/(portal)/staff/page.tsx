import { createClient } from '@/utils/supabase/server'
import { Shield } from 'lucide-react'
import StaffListClient from './StaffListClient'

export default async function StaffPage() {
  const supabase = await createClient()

  // 1. Get Current User
  const { data: { user } } = await supabase.auth.getUser()
  const userId = user?.id || ''

  // 2. Fetch My Profile
  const { data: myProfile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()

  // 3. Fetch Other Staff
  const { data: otherStaff } = await supabase
    .from('profiles')
    .select('*')
    .in('role', ['admin', 'teacher'])
    .neq('id', userId)
    .order('created_at', { ascending: false })

  const allStaff = myProfile ? [myProfile, ...(otherStaff || [])] : (otherStaff || [])

  // 4. 👇 NEW: Fetch Subjects for the dropdowns
  const { data: subjects } = await supabase
    .from('subjects')
    .select('name')
    .order('name')

  return (
    <div className="max-w-5xl mx-auto pb-20">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-indigo-100 text-indigo-600 rounded-xl">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Staff Management</h1>
            <p className="text-slate-500">Manage access for teachers and administrators.</p>
          </div>
        </div>
      </div>

      {/* Pass subjects down to the client component */}
      <StaffListClient 
        staff={allStaff} 
        currentUserId={userId} 
        subjects={subjects || []} 
      />
    </div>
  )
}