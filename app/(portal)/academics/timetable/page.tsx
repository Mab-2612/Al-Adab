import { createClient } from '@/utils/supabase/server'
import { Calendar } from 'lucide-react'
import TimetableEditor from './TimetableEditor'

export default async function TimetablePage({ searchParams }: { searchParams: Promise<{ classId?: string }> }) {
  const supabase = await createClient()
  const params = await searchParams

  // 1. Fetch Classes
  const { data: classes } = await supabase.from('classes').select('id, name').order('name')
  
  // 2. Fetch Subjects
  const { data: subjects } = await supabase.from('subjects').select('id, name').order('name')

  // 3. Fetch Existing Timetable
  let initialSchedule: Record<string, any[]> = {}
  
  if (params.classId) {
    const { data: rawTimetable } = await supabase
      .from('timetables')
      .select('*')
      .eq('class_id', params.classId)
      .order('start_time')

    if (rawTimetable) {
      // Group by Day
      ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].forEach(day => {
        const dayPeriods = rawTimetable
          .filter(t => t.day === day)
          .map(t => ({
            id: t.id,
            startTime: t.start_time.slice(0, 5),
            endTime: t.end_time.slice(0, 5),
            subjectId: t.subject_id,
            type: t.type || 'lesson',
            label: t.label || '' // 👈 FIX: Ensure this is never null
          }))
          
        initialSchedule[day] = dayPeriods
      })
    }
  }

  return (
    <div className="max-w-[1400px] mx-auto pb-20">
      
      <div className="flex items-center gap-4 mb-8">
        <div className="p-3 bg-indigo-100 text-indigo-600 rounded-xl">
          <Calendar className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Class Timetable</h1>
          <p className="text-slate-500">Manage weekly schedules via grid editor.</p>
        </div>
      </div>

      <TimetableEditor 
        key={params.classId || 'default'} 
        classId={params.classId || ''} 
        classes={classes || []} 
        subjects={subjects || []} 
        initialSchedule={initialSchedule}
      />

    </div>
  )
}