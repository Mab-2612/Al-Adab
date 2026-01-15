'use client'

import { createClient } from '@/utils/supabase/client'
import { useEffect, useState } from 'react'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import TimetableBuilder from './TimetableBuilder'
import { toast } from 'sonner'

export default function BulkTimetablePage() {
  const [classes, setClasses] = useState<any[]>([])
  const [subjects, setSubjects] = useState<any[]>([])
  const [classId, setClassId] = useState('')

  useEffect(() => {
    const supabase = createClient()
    
    // Fetch Data
    const getData = async () => {
      const { data: c } = await supabase.from('classes').select('id, name').order('name')
      const { data: s } = await supabase.from('subjects').select('id, name').order('name')
      setClasses(c || [])
      setSubjects(s || [])
    }
    getData()
  }, [])

  return (
    <div className="max-w-7xl mx-auto pb-20">
      
      <div className="flex items-center gap-4 mb-8">
        <Link href="/academics/timetable" className="p-2 hover:bg-slate-100 rounded-full text-slate-500">
          <ArrowLeft className="w-6 h-6" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Bulk Timetable Editor</h1>
          <p className="text-slate-500">Quickly build the weekly schedule for a class.</p>
        </div>
      </div>

      <div className="space-y-6">
        
        {/* Class Selector */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm max-w-md">
           <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Target Class</label>
           <select 
             value={classId} 
             onChange={(e) => setClassId(e.target.value)}
             className="w-full p-2.5 border rounded-lg bg-slate-50 outline-none focus:ring-2 focus:ring-blue-500"
           >
             <option value="">Select Class...</option>
             {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
           </select>
        </div>

        {/* The Builder */}
        {classId ? (
           <TimetableBuilder classId={classId} subjects={subjects} />
        ) : (
           <div className="py-20 text-center bg-slate-50 rounded-xl border border-dashed border-slate-300 text-slate-400">
             Please select a class to begin.
           </div>
        )}

      </div>
    </div>
  )
}