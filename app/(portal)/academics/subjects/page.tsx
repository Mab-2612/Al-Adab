import { createClient } from '@/utils/supabase/server'
import { Plus } from 'lucide-react'
import AddSubjectForm from './AddSubjectForm'
import SubjectList from './SubjectList'

export default async function SubjectsPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user?.id).single()
  
  const isAdmin = profile?.role === 'admin'

  // 1. Fetch Subjects with Teacher Names
  const { data: subjects } = await supabase
    .from('subjects')
    .select('*, profiles(first_name, last_name)') // Join profiles to get teacher name
    .order('name')

  // 2. Fetch Teachers (For the dropdown)
  const { data: teachers } = await supabase
    .from('profiles')
    .select('id, first_name, last_name')
    .eq('role', 'teacher')
    .order('first_name')

  return (
    <div className="max-w-5xl mx-auto pb-20">
      
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Subject Management</h1>
          <p className="text-slate-500 mt-1">
            {isAdmin 
              ? "Define curriculum and assign subject heads." 
              : "View the list of subjects offered."}
          </p>
        </div>
      </div>

      <div className={`grid gap-8 ${isAdmin ? 'lg:grid-cols-3' : 'lg:grid-cols-1'}`}>
        
        {isAdmin && (
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 sticky top-24">
              <h2 className="font-bold text-slate-900 mb-6 flex items-center gap-2">
                <Plus className="w-5 h-5 text-blue-600" />
                Add New Subject
              </h2>
              {/* Pass teachers to the form */}
              <AddSubjectForm teachers={teachers || []} />
            </div>
          </div>
        )}

        <div className={isAdmin ? 'lg:col-span-2' : 'lg:col-span-1'}>
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
              <h3 className="font-bold text-slate-700">All Subjects ({subjects?.length})</h3>
            </div>
            
            {/* Pass teachers to the list (for the Edit modal) */}
            <SubjectList 
              subjects={subjects || []} 
              teachers={teachers || []} 
              isAdmin={isAdmin} 
            />
            
          </div>
        </div>

      </div>
    </div>
  )
}