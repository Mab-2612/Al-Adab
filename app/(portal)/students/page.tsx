import { createClient } from '@/utils/supabase/server'
import { Plus, Phone } from 'lucide-react'
import Link from 'next/link'
import StudentActions from '@/components/students/StudentActions'
import StudentToolbar from './StudentToolbar'

export default async function StudentsPage({ searchParams }: { searchParams: Promise<{ q?: string, classId?: string }> }) {
  const supabase = await createClient()
  const params = await searchParams

  // 1. Get Current User Role
  const { data: { user } } = await supabase.auth.getUser()
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user?.id)
    .single()
  
  const isTeacher = profile?.role === 'teacher'
  const isAdmin = profile?.role === 'admin'

  // 2. Build Query
  let query = supabase
    .from('students')
    .select(`
      id,
      profile_id, 
      admission_number,
      gender,
      profiles:student_profile_link (first_name, last_name, email, phone_number),
      classes (name)
    `)
    .order('admission_number', { ascending: true })

  if (params.classId) query = query.eq('current_class_id', params.classId)

  const { data: rawStudents, error } = await query
  let students = rawStudents || []

  // Search Filter
  if (params.q) {
    const term = params.q.toLowerCase()
    students = students.filter((s: any) => {
      const name = `${s.profiles?.first_name} ${s.profiles?.last_name}`.toLowerCase()
      const adm = s.admission_number?.toLowerCase() || ''
      return name.includes(term) || adm.includes(term)
    })
  }

  const { data: classes } = await supabase.from('classes').select('id, name').order('name')

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-20">
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Students</h1>
          <p className="text-slate-500 mt-1">
            {isTeacher 
              ? "View classes and student records." 
              : "Manage admissions, classes, and student records."}
          </p>
        </div>
        
        {/* Only Admin sees Add Button */}
        {isAdmin && (
          <Link 
            href="/students/new"
            className="inline-flex items-center justify-center gap-2 bg-slate-900 text-white px-5 py-2.5 rounded-lg hover:bg-slate-800 transition-all font-medium shadow-lg shadow-slate-900/20 active:scale-95"
          >
            <Plus className="w-5 h-5" />
            <span>Add Student</span>
          </Link>
        )}
      </div>

      <StudentToolbar classes={classes || []} />

      {/* MOBILE VIEW */}
      <div className="flex flex-col gap-2 md:hidden">
        {students?.map((student: any) => (
          <div key={student.id} className="bg-white rounded-xl p-3 shadow-sm border border-slate-100 flex items-center justify-between group active:scale-[0.99] transition-transform">
            <Link href={`/students/${student.id}`} className="flex items-center gap-3 overflow-hidden flex-1">
              <div className="w-10 h-10 min-w-[2.5rem] rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600 font-bold text-sm">
                 {student.profiles?.first_name?.[0]}{student.profiles?.last_name?.[0]}
              </div>
              <div className="flex flex-col min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-slate-900 text-sm truncate">
                    {student.profiles?.first_name} {student.profiles?.last_name}
                  </h3>
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-100 whitespace-nowrap">
                    {student.classes?.name || 'N/A'}
                  </span>
                </div>
                <p className="text-slate-500 text-xs flex items-center gap-2 truncate">
                  <span className="font-mono bg-slate-50 px-1 rounded">{student.admission_number}</span>
                </p>
              </div>
            </Link>
            <div className="flex items-center gap-1 pl-2">
              <a href={`tel:${student.profiles?.phone_number}`} className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-50 text-slate-400 hover:bg-green-50 hover:text-green-600 transition-colors">
                <Phone className="w-4 h-4" />
              </a>
              {/* Only show Actions dropdown if Admin */}
              {isAdmin && <StudentActions studentId={student.id} profileId={student.profile_id} />}
            </div>
          </div>
        ))}
      </div>

      {/* DESKTOP VIEW */}
      <div className="hidden md:block bg-white rounded-xl border border-slate-200 shadow-sm overflow-visible">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/50 border-b border-slate-200">
              <th className="py-4 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider">Student</th>
              <th className="py-4 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider">Class</th>
              <th className="py-4 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider">Admission No</th>
              <th className="py-4 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider">Gender</th>
              {/* Hide Actions Header for Teachers */}
              {!isTeacher && <th className="py-4 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Actions</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {students?.map((student: any) => (
              <tr key={student.id} className="hover:bg-slate-50/80 transition-colors group">
                <td className="py-4 px-6">
                  <Link href={`/students/${student.id}`} className="flex items-center gap-4 hover:opacity-80 transition-opacity">
                    <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600 font-bold">
                       {student.profiles?.first_name?.[0]}{student.profiles?.last_name?.[0]}
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900">
                        {student.profiles?.first_name} {student.profiles?.last_name}
                      </p>
                      <p className="text-xs text-slate-500">{student.profiles?.email}</p>
                    </div>
                  </Link>
                </td>
                <td className="py-4 px-6">
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">
                    {student.classes?.name || 'N/A'}
                  </span>
                </td>
                <td className="py-4 px-6 font-mono text-sm text-slate-600">
                  {student.admission_number}
                </td>
                <td className="py-4 px-6 text-sm text-slate-600 capitalize">
                  {student.gender}
                </td>
                {/* Hide Actions Cell for Teachers */}
                {!isTeacher && (
                  <td className="py-4 px-6 text-right relative">
                    <StudentActions studentId={student.id} profileId={student.profile_id} />
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
        
        {(!students || students.length === 0) && (
          <div className="p-12 text-center">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
              <Plus className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-medium text-slate-900">No students found</h3>
            <p className="text-slate-500 mt-1">Try adjusting your filters.</p>
          </div>
        )}
      </div>
    </div>
  )
}