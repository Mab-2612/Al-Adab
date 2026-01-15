import { createClient } from '@/utils/supabase/server'
import { Plus } from 'lucide-react'
import AddSubjectForm from './AddSubjectForm'
import SubjectList from './SubjectList'
import SubjectToolbar from './SubjectToolbar' // 👈 Import new component

export default async function SubjectsPage({ searchParams }: { searchParams: Promise<{ level?: string, dept?: string }> }) {
  const supabase = await createClient()
  const params = await searchParams

  // 1. Check Permissions
  const { data: { user } } = await supabase.auth.getUser()
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user?.id).single()
  
  const canManage = profile?.role === 'admin' || profile?.role === 'principal'

  // 2. Fetch Subjects with Teacher Names
  let { data: subjects } = await supabase
    .from('subjects')
    .select('*, profiles(first_name, last_name)')
    .order('name')

  // 3. Fetch Teachers (For the dropdown)
  const { data: teachers } = await supabase
    .from('profiles')
    .select('id, first_name, last_name')
    .eq('role', 'teacher')
    .order('first_name')

  // 4. 👇 FILTER LOGIC
  if (subjects) {
    // Filter by Level (Category)
    if (params.level) {
      subjects = subjects.filter(s => 
        s.category === params.level || s.category === 'All'
      )
    }

    // Filter by Department Scope
    if (params.dept) {
      subjects = subjects.filter(s => s.department_target === params.dept)
    }
  }

  return (
    <div className="max-w-5xl mx-auto pb-20">
      
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Subject Management</h1>
          <p className="text-slate-500 mt-1">
            {canManage 
              ? "Define curriculum and assign subject heads." 
              : "View the list of subjects offered."}
          </p>
        </div>
      </div>

      <div className={`grid gap-8 ${canManage ? 'lg:grid-cols-3' : 'lg:grid-cols-1'}`}>
        
        {/* LEFT: Add Subject Form (ADMIN & PRINCIPAL) */}
        {canManage && (
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 sticky top-24">
              <h2 className="font-bold text-slate-900 mb-6 flex items-center gap-2">
                <Plus className="w-5 h-5 text-blue-600" />
                Add New Subject
              </h2>
              <AddSubjectForm teachers={teachers || []} />
            </div>
          </div>
        )}

        {/* RIGHT: Subject List */}
        <div className={canManage ? 'lg:col-span-2' : 'lg:col-span-1'}>
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 bg-white border-b border-slate-100 flex justify-between items-center">
              <h3 className="font-bold text-slate-700">All Subjects ({subjects?.length})</h3>
            </div>

            {/* 👇 INSERT TOOLBAR HERE */}
            <SubjectToolbar />
            
            {/* List */}
            <SubjectList 
              subjects={subjects || []} 
              teachers={teachers || []} 
              isAdmin={canManage} 
            />
            
          </div>
        </div>

      </div>
    </div>
  )
}