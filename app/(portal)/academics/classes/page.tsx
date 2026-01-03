import { createClient } from '@/utils/supabase/server'
import { Users, GraduationCap } from 'lucide-react'
import EditClassModal from './EditClassModal'
import Link from 'next/link'

export default async function ClassesPage() {
  const supabase = await createClient()

  // 1. Get Current User Role
  const { data: { user } } = await supabase.auth.getUser()
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user?.id).single()
  const isAdmin = profile?.role === 'admin'

  // 2. Fetch Classes
  const { data: classes } = await supabase
    .from('classes')
    .select(`
      *,
      profiles:class_teacher_id (first_name, last_name)
    `)
    .order('name')

  // 3. Fetch Teachers (Only needed if admin, but fetching for simplicity)
  const { data: teachers } = await supabase
    .from('profiles')
    .select('id, first_name, last_name')
    .eq('role', 'teacher')
    .order('first_name')

  // 4. Count Students
  const { data: students } = await supabase.from('students').select('current_class_id')
  
  const classCounts: Record<string, number> = {}
  students?.forEach(s => {
    classCounts[s.current_class_id] = (classCounts[s.current_class_id] || 0) + 1
  })

  return (
    <div className="max-w-5xl mx-auto pb-20">
      
      <div className="flex items-center gap-4 mb-8">
        <div className="p-3 bg-purple-100 text-purple-600 rounded-xl">
          <GraduationCap className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Class Management</h1>
          <p className="text-slate-500">View class populations and assigned teachers.</p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {classes?.map((cls: any) => (
          // 👇 WRAPPER LINK: Makes the whole box clickable
          <Link 
            key={cls.id} 
            href={`/students?classId=${cls.id}`}
            className="block group"
          >
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm relative hover:border-blue-400 hover:shadow-md transition-all">
              
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                  {cls.name}
                </h3>
                <span className="px-2 py-1 rounded bg-slate-100 text-slate-600 text-xs font-bold uppercase">
                  {cls.section}
                </span>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <Users className="w-4 h-4 text-slate-400" />
                  <span>{classCounts[cls.id] || 0} Students</span>
                </div>
                
                <div className="flex items-center gap-2 text-sm">
                  <GraduationCap className="w-4 h-4 text-slate-400" />
                  {cls.profiles ? (
                    <span className="font-medium text-blue-600">
                      {cls.profiles.first_name} {cls.profiles.last_name}
                    </span>
                  ) : (
                    <span className="text-slate-400 italic">No Teacher Assigned</span>
                  )}
                </div>
              </div>

              {/* Only Admin can see/use the Assign Teacher button */}
              {isAdmin && (
                <div className="mt-6 pt-4 border-t border-slate-50">
                   <EditClassModal cls={cls} teachers={teachers || []} />
                </div>
              )}

            </div>
          </Link>
        ))}
      </div>

    </div>
  )
}