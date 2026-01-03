import { createClient } from '@/utils/supabase/server'
import { GraduationCap, CalendarCheck, Users, BookOpen } from 'lucide-react'
import Link from 'next/link'
import NoticeBoard from './NoticeBoard'

export default async function TeacherDashboard({ userId, profile }: { userId: string, profile: any }) {
  const supabase = await createClient()

  // 1. Check if Class Teacher
  const { data: myClass } = await supabase
    .from('classes')
    .select('*')
    .eq('class_teacher_id', userId)
    .single()

  // 2. Count Students
  let studentCount = 0
  if (myClass) {
    const { count } = await supabase
      .from('students')
      .select('*', { count: 'exact', head: true })
      .eq('current_class_id', myClass.id)
    studentCount = count || 0
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Staff Dashboard</h1>
          <p className="text-gray-500">
            Welcome back, <span className="font-semibold text-blue-600">{profile.first_name}</span>.
            {profile.specialization && <span className="text-xs ml-2 bg-blue-50 text-blue-600 px-2 py-1 rounded-full">{profile.specialization} Teacher</span>}
          </p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          
          {/* Class Card */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900">My Class</h3>
                <p className="text-slate-500 text-sm">
                  {myClass ? `Class Teacher for ${myClass.name}` : "No class assigned."}
                </p>
              </div>
              <div className="p-3 bg-blue-100 text-blue-600 rounded-xl"><Users className="w-6 h-6" /></div>
            </div>
            
            {myClass && (
              <div className="mt-4 pt-4 border-t border-slate-50 flex gap-4 items-center">
                <div><span className="text-2xl font-bold text-slate-900">{studentCount}</span> <span className="text-xs text-slate-500">Students</span></div>
                <Link href={`/students?classId=${myClass.id}`} className="ml-auto px-4 py-2 bg-slate-900 text-white text-sm rounded-lg hover:bg-slate-800">View List</Link>
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="grid sm:grid-cols-2 gap-4">
            <Link href="/attendance" className="p-5 bg-white border border-slate-200 rounded-xl hover:border-green-500 hover:shadow-md transition-all group">
              <div className="w-10 h-10 bg-green-50 text-green-600 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform"><CalendarCheck className="w-5 h-5" /></div>
              <h4 className="font-bold text-slate-800">Mark Attendance</h4>
            </Link>

            <Link href="/results/upload" className="p-5 bg-white border border-slate-200 rounded-xl hover:border-purple-500 hover:shadow-md transition-all group">
              <div className="w-10 h-10 bg-purple-50 text-purple-600 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform"><GraduationCap className="w-5 h-5" /></div>
              <h4 className="font-bold text-slate-800">Upload Results</h4>
            </Link>
            
            <Link href="/academics/subjects" className="p-5 bg-white border border-slate-200 rounded-xl hover:border-blue-500 hover:shadow-md transition-all group">
              <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform"><BookOpen className="w-5 h-5" /></div>
              <h4 className="font-bold text-slate-800">Curriculum</h4>
            </Link>
          </div>
        </div>

        {/* Notices */}
        <div className="lg:col-span-1"><NoticeBoard role="teacher" /></div>
      </div>
    </div>
  )
}