import { createClient } from '@/utils/supabase/server'
import { Calendar, Trash2 } from 'lucide-react'
import AddPeriodForm from './AddPeriodForm'
import TimetableFilter from './TimetableFilter' // 👈 Import the new component
import { deletePeriod } from './actions'

// Helper to sort days
const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']

export default async function TimetablePage({ searchParams }: { searchParams: Promise<{ classId?: string }> }) {
  const supabase = await createClient()
  const params = await searchParams

  // Fetch Classes
  const { data: classes } = await supabase.from('classes').select('id, name').order('name')
  
  // Fetch Subjects
  const { data: subjects } = await supabase.from('subjects').select('id, name').order('name')

  // Fetch Timetable if class selected
  let timetable = []
  if (params.classId) {
    const { data } = await supabase
      .from('timetables')
      .select('*, subjects(name)')
      .eq('class_id', params.classId)
      .order('start_time')
    
    timetable = data || []
  }

  return (
    <div className="max-w-6xl mx-auto pb-20">
      
      <div className="flex items-center gap-4 mb-8">
        <div className="p-3 bg-indigo-100 text-indigo-600 rounded-xl">
          <Calendar className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Class Timetable</h1>
          <p className="text-slate-500">Manage weekly schedules for each class.</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-4 gap-8">
        
        {/* Sidebar: Class Filter & Add Form */}
        <div className="lg:col-span-1 space-y-6">
          {/* 👇 REPLACED: Use Client Component here */}
          <TimetableFilter classes={classes || []} />

          {params.classId && (
            <AddPeriodForm classId={params.classId} subjects={subjects || []} />
          )}
        </div>

        {/* Main: Weekly Calendar View */}
        <div className="lg:col-span-3">
          {params.classId ? (
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
              <div className="grid grid-cols-5 divide-x divide-slate-200 border-b border-slate-200 bg-slate-50">
                {days.map(day => (
                  <div key={day} className="p-4 text-center font-bold text-slate-700 text-sm uppercase">
                    {day.slice(0, 3)}
                  </div>
                ))}
              </div>
              
              <div className="grid grid-cols-5 divide-x divide-slate-200 min-h-[400px]">
                {days.map(day => {
                  const dayPeriods = timetable.filter((t: any) => t.day === day)
                  
                  return (
                    <div key={day} className="p-2 space-y-2">
                      {dayPeriods.map((period: any) => (
                        <div key={period.id} className="bg-blue-50 border border-blue-100 p-3 rounded-lg relative group hover:bg-blue-100 transition-colors">
                          <p className="font-bold text-blue-900 text-sm">{period.subjects?.name}</p>
                          <p className="text-xs text-blue-600 mt-1">
                            {period.start_time.slice(0, 5)} - {period.end_time.slice(0, 5)}
                          </p>
                          
                          {/* Delete Button */}
                          <form action={async () => {
                            'use server'
                            await deletePeriod(period.id)
                          }} className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button className="p-1 bg-white text-red-500 rounded shadow-sm hover:bg-red-50">
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </form>
                        </div>
                      ))}
                      {dayPeriods.length === 0 && (
                        <div className="h-full flex items-center justify-center">
                          <span className="text-slate-300 text-xs">-</span>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          ) : (
            <div className="h-96 flex flex-col items-center justify-center bg-slate-50 border border-dashed border-slate-300 rounded-xl text-slate-400">
              <Calendar className="w-12 h-12 mb-2 opacity-50" />
              <p>Select a class to view or edit the timetable.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  )
}