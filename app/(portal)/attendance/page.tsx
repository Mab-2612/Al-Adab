import { createClient } from '@/utils/supabase/server'
import { CalendarCheck, Search } from 'lucide-react'
import AttendanceSheet from './AttendanceSheet'

export default async function AttendancePage({ searchParams }: { searchParams: Promise<{ classId?: string, date?: string }> }) {
  const supabase = await createClient()
  const params = await searchParams
  
  const date = params.date || new Date().toISOString().split('T')[0]

  // 1. Fetch Classes for Dropdown
  const { data: classes } = await supabase.from('classes').select('id, name').order('name')

  // 2. Fetch Students & Existing Attendance
  // 👇 FIX: Explicitly tell TypeScript this is an array of objects (any[])
  let students: any[] = [] 
  let existingRecords: any[] = []

  if (params.classId) {
    const { data: sData } = await supabase
      .from('students')
      .select('id, admission_number, profiles:student_profile_link(first_name, last_name)')
      .eq('current_class_id', params.classId)
      .order('admission_number')
    
    students = sData || []

    const { data: aData } = await supabase
      .from('attendance')
      .select('student_id, status')
      .eq('class_id', params.classId)
      .eq('date', date)
    
    existingRecords = aData || []
  }

  return (
    <div className="max-w-4xl mx-auto pb-20">
      
      <div className="flex items-center gap-4 mb-8">
        <div className="p-3 bg-green-100 text-green-600 rounded-xl">
          <CalendarCheck className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Attendance Register</h1>
          <p className="text-slate-500">Mark daily attendance for students.</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm mb-6">
        <form className="flex flex-col md:flex-row gap-4 items-end">
          <div className="w-full md:flex-1">
            <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Class</label>
            <select 
              name="classId" 
              defaultValue={params.classId}
              className="w-full p-2.5 border rounded-lg bg-slate-50 outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="">Select Class...</option>
              {classes?.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>

          <div className="w-full md:w-48">
            <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Date</label>
            <input 
              type="date" 
              name="date" 
              defaultValue={date}
              className="w-full p-2.5 border rounded-lg bg-slate-50 outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          <button className="px-6 py-2.5 bg-slate-900 text-white rounded-lg font-medium hover:bg-slate-800 transition-colors flex items-center justify-center gap-2 w-full md:w-auto">
            <Search className="w-4 h-4" /> Load
          </button>
        </form>
      </div>

      {params.classId ? (
        <AttendanceSheet 
          students={students} 
          existingRecords={existingRecords}
          classId={params.classId}
          date={date}
        />
      ) : (
        <div className="text-center py-20 bg-slate-50 border border-dashed border-slate-300 rounded-xl text-slate-400">
          <CalendarCheck className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>Select a class and date to take attendance.</p>
        </div>
      )}

    </div>
  )
}