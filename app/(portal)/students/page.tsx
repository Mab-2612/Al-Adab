import { createClient } from '@/utils/supabase/server'
import { Plus, Phone, Users } from 'lucide-react'
import Link from 'next/link'
import StudentActions from '@/components/students/StudentActions'
import StudentToolbar from './StudentToolbar'

// Ensure fresh data on every request
export const dynamic = 'force-dynamic'

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
  const isAdmin = profile?.role === 'admin' || profile?.role === 'principal'

  // 2. Fetch Classes
  const { data: classes } = await supabase
    .from('classes')
    .select('id, name, section')
    .order('name')

  // 3. Build Student Query
  let query = supabase
    .from('students')
    .select(`
      id,
      profile_id, 
      admission_number,
      gender,
      department,
      current_class_id,
      profiles:student_profile_link (first_name, last_name, email, phone_number),
      classes (name)
    `)
  
  if (params.classId) {
    query = query.eq('current_class_id', params.classId)
  }

  const { data: rawStudents, error } = await query
  if (error) console.error('Supabase Error:', error.message)

  // 4. Processing
  let processedStudents = rawStudents || []

  const getFormattedName = (s: any) => {
    const otherNames = s.profiles?.last_name || ''
    const firstName = s.profiles?.first_name || ''
    const parts = otherNames.split(' ')
    const surname = parts[0] || ''
    const middle = parts.slice(1).join(' ')
    return `${surname} ${firstName} ${middle}`.trim()
  }

  if (params.q) {
    const term = params.q.toLowerCase()
    processedStudents = processedStudents.filter((s: any) => {
      const fullName = getFormattedName(s).toLowerCase()
      const adm = s.admission_number?.toLowerCase() || ''
      return fullName.includes(term) || adm.includes(term)
    })
  }

  const studentsByClass: Record<string, any[]> = {}
  processedStudents.forEach((student: any) => {
    const cId = student.current_class_id
    if (!studentsByClass[cId]) studentsByClass[cId] = []
    studentsByClass[cId].push(student)
  })

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-20">
      
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">Students</h1>
            <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-sm font-bold border border-slate-200">
              {processedStudents.length}
            </span>
          </div>
          <p className="text-slate-500 mt-1">
            {isTeacher 
              ? "View classes and student records." 
              : "Manage admissions, classes, and student records."}
          </p>
        </div>
        
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

      {/* RENDER GROUPS */}
      <div className="space-y-12">
        {classes?.map((cls: any) => {
          let classStudents = studentsByClass[cls.id] || []
          if (classStudents.length === 0) return null 

          const isSenior = cls.name.includes('SSS') || cls.section?.includes('Senior')

          classStudents.sort((a: any, b: any) => {
            if (a.gender !== b.gender) {
               return a.gender === 'Male' ? -1 : 1 
            }
            return getFormattedName(a).localeCompare(getFormattedName(b))
          })

          return (
            <div key={cls.id} className="space-y-4">
              
              {/* Class Header */}
              <div className="flex items-center justify-between bg-slate-100 p-4 rounded-xl border border-slate-200 sticky top-0 z-10 shadow-sm backdrop-blur-md bg-opacity-90">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white text-blue-700 rounded-lg shadow-sm border border-slate-200">
                    <Users className="w-5 h-5" />
                  </div>
                  <h2 className="text-xl font-black text-slate-800 tracking-tight uppercase">{cls.name}</h2>
                </div>
                <span className="bg-slate-800 text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow-sm">
                  {classStudents.length} Students
                </span>
              </div>

              {/* MOBILE VIEW */}
              <div className="flex flex-col gap-2 md:hidden">
                {classStudents.map((student: any) => {
                  const displayName = getFormattedName(student)
                  return (
                    <div key={student.id} className="bg-white rounded-xl p-3 shadow-sm border border-slate-100 flex items-center justify-between group active:scale-[0.99] transition-transform">
                      <Link href={`/students/${student.id}`} className="flex items-center gap-3 overflow-hidden flex-1">
                        <div className="w-10 h-10 min-w-[2.5rem] rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 font-bold text-sm uppercase">
                           {student.profiles?.last_name?.[0]}{student.profiles?.first_name?.[0]}
                        </div>
                        <div className="flex flex-col min-w-0">
                          <div className="flex items-center gap-2">
                            {/* 👇 UPDATED: Dark Slate Default -> Blue on Hover */}
                            <h3 className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors text-sm truncate">
                              {displayName}
                            </h3>
                          </div>
                          <div className="flex gap-2 text-xs items-center">
                             <span className="font-mono bg-slate-50 px-1 rounded text-slate-500">{student.admission_number}</span>
                             {isSenior && student.department && (
                               <span className="bg-purple-50 text-purple-700 px-1.5 rounded font-medium border border-purple-100">
                                 {student.department.slice(0,3)}
                               </span>
                             )}
                             <span className="text-slate-400 capitalize">• {student.gender}</span>
                          </div>
                        </div>
                      </Link>
                      <div className="flex items-center gap-1 pl-2">
                        <a href={`tel:${student.profiles?.phone_number}`} className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-50 text-slate-400 hover:bg-green-50 hover:text-green-600 transition-colors">
                          <Phone className="w-4 h-4" />
                        </a>
                        {isAdmin && <StudentActions studentId={student.id} profileId={student.profile_id} />}
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* DESKTOP VIEW */}
              <div className="hidden md:block bg-white rounded-xl border border-slate-200 shadow-sm overflow-visible">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50/50 border-b border-slate-200">
                      <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider w-12">#</th>
                      <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">Student Name (M-F)</th>
                      <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">Admission No</th>
                      {isSenior && <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">Dept</th>}
                      <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">Gender</th>
                      {!isTeacher && <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {classStudents.map((student: any, index: number) => {
                      const displayName = getFormattedName(student)
                      return (
                        <tr key={student.id} className="hover:bg-blue-50/30 transition-colors group">
                          <td className="py-4 px-6 text-sm font-bold text-slate-700 font-mono">{index + 1}</td>
                          <td className="py-4 px-6">
                            <Link href={`/students/${student.id}`} className="flex items-center gap-4 transition-opacity">
                              <div className="w-10 h-10 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 font-bold uppercase group-hover:bg-blue-100 transition-colors">
                                 {student.profiles?.last_name?.[0]}{student.profiles?.first_name?.[0]}
                              </div>
                              <div>
                                {/* 👇 UPDATED: Dark Slate Default -> Blue on Hover */}
                                <p className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors text-base">
                                  {displayName}
                                </p>
                                <p className="text-xs text-slate-500">{student.profiles?.email}</p>
                              </div>
                            </Link>
                          </td>
                          <td className="py-4 px-6 font-mono text-sm text-slate-700 font-semibold">
                            {student.admission_number}
                          </td>
                          {isSenior && (
                            <td className="py-4 px-6">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                                student.department === 'Science' ? 'bg-blue-50 text-blue-700 border-blue-100' :
                                student.department === 'Arts' ? 'bg-orange-50 text-orange-700 border-orange-100' :
                                student.department === 'Commercial' ? 'bg-purple-50 text-purple-700 border-purple-100' :
                                'bg-slate-50 text-slate-600 border-slate-100'
                              }`}>
                                {student.department || '-'}
                              </span>
                            </td>
                          )}
                          <td className="py-4 px-6 text-sm text-slate-600 capitalize">
                            {student.gender}
                          </td>
                          {!isTeacher && (
                            <td className="py-4 px-6 text-right relative">
                              <StudentActions studentId={student.id} profileId={student.profile_id} />
                            </td>
                          )}
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>

            </div>
          )
        })}

        {processedStudents.length === 0 && (
          <div className="p-12 text-center bg-slate-50 rounded-xl border border-dashed border-slate-300">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
              <Users className="w-8 h-8 opacity-50" />
            </div>
            <h3 className="text-lg font-medium text-slate-900">No students found</h3>
            <p className="text-slate-500 mt-1">Try adjusting your filters or search terms.</p>
          </div>
        )}
      </div>
    </div>
  )
}