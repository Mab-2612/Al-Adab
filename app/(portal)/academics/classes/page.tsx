import { createClient } from '@/utils/supabase/server'
import { Users, GraduationCap, ChevronRight } from 'lucide-react'
import EditClassModal from './EditClassModal'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function ClassesPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user?.id).single()
  const isAdmin = profile?.role === 'admin' || profile?.role === 'principal'

  // 1. Fetch Classes with Multiple Teachers
  // We join 'class_teachers' -> 'profiles'
  const { data: classes } = await supabase
    .from('classes')
    .select(`
      *,
      class_teachers (
        teacher_id,
        profiles (first_name, last_name)
      )
    `)
    .order('name')

  const { data: teachers } = await supabase
    .from('profiles')
    .select('id, first_name, last_name')
    .eq('role', 'teacher')
    .order('first_name')

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
        {classes?.map((cls: any) => {
          // Extract teachers list for display
          const assignedTeachers = cls.class_teachers?.map((t: any) => 
            `${t.profiles.first_name} ${t.profiles.last_name}`
          ) || []

          return (
            <div key={cls.id} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col hover:border-purple-300 transition-colors">
              
              <Link href={`/students?classId=${cls.id}`} className="block p-6 flex-1 group">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl font-bold text-slate-900 group-hover:text-purple-600 transition-colors">
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
                  
                  <div className="flex items-start gap-2 text-sm">
                    <GraduationCap className="w-4 h-4 text-slate-400 mt-0.5" />
                    <div>
                      {assignedTeachers.length > 0 ? (
                        <div className="flex flex-col gap-0.5">
                          {assignedTeachers.map((name: string) => (
                            <span key={name} className="font-medium text-blue-600">{name}</span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">No Teachers Assigned</span>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="mt-4 flex items-center text-xs font-bold text-purple-600 opacity-0 group-hover:opacity-100 transition-opacity">
                  View List <ChevronRight className="w-3 h-3 ml-1" />
                </div>
              </Link>

              {isAdmin && (
                <div className="bg-slate-50 p-3 border-t border-slate-100">
                   <EditClassModal cls={cls} teachers={teachers || []} />
                </div>
              )}

            </div>
          )
        })}
      </div>

    </div>
  )
}