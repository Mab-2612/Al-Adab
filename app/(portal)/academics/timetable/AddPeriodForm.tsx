'use client'

import { addPeriod } from './actions'
import { Plus, Loader2, Clock } from 'lucide-react'
import { useState, useRef } from 'react'
import { toast } from 'sonner'

export default function AddPeriodForm({ classId, subjects }: { classId: string, subjects: any[] }) {
  const [isSaving, setIsSaving] = useState(false)
  const formRef = useRef<HTMLFormElement>(null)
  
  // State for time calculation helper
  const [start, setStart] = useState('08:00')
  const [end, setEnd] = useState('08:40')

  const handleSubmit = async (formData: FormData) => {
    setIsSaving(true)
    const res = await addPeriod(formData)
    setIsSaving(false)

    if (res?.success) {
      toast.success(res.message)
      // Optional: formRef.current?.reset() 
    } else {
      toast.error(res?.error)
    }
  }

  // Helper to auto-calculate end time
  const addMinutes = (minutes: number) => {
    const [h, m] = start.split(':').map(Number)
    const date = new Date()
    date.setHours(h, m + minutes)
    // Format to HH:MM
    const newEnd = date.toTimeString().slice(0, 5)
    setEnd(newEnd)
  }

  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm sticky top-24">
      <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
        <Plus className="w-4 h-4 text-blue-600" /> Add Periods
      </h3>
      
      <form ref={formRef} action={handleSubmit} className="space-y-5">
        <input type="hidden" name="classId" value={classId} />
        
        {/* 1. Subject */}
        <div>
          <label className="text-xs font-bold text-slate-500 uppercase mb-1.5 block">Subject</label>
          <select name="subjectId" required className="w-full p-2.5 border border-slate-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none">
            <option value="">Select Subject...</option>
            {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>

        {/* 2. Days (Multi-Select) */}
        <div>
          <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Repeat On</label>
          <div className="flex gap-2">
            {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].map((day) => (
              <label key={day} className="cursor-pointer flex-1">
                <input type="checkbox" name="days" value={day} className="peer sr-only" defaultChecked={true} />
                <span className="flex items-center justify-center w-full py-2 rounded-lg border border-slate-200 text-xs font-bold text-slate-500 peer-checked:bg-blue-600 peer-checked:text-white peer-checked:border-blue-600 transition-all select-none hover:bg-slate-50 peer-checked:hover:bg-blue-700">
                  {day.slice(0, 3)}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* 3. Time Slots */}
        <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
          <label className="text-xs font-bold text-slate-500 uppercase mb-2 block flex items-center gap-1">
            <Clock className="w-3 h-3" /> Time Slot
          </label>
          
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div>
              <span className="text-[10px] text-slate-400 block mb-1">Start</span>
              <input 
                type="time" 
                name="startTime" 
                value={start}
                onChange={(e) => setStart(e.target.value)}
                required 
                className="w-full p-2 border border-slate-200 rounded-lg text-sm bg-white" 
              />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block mb-1">End</span>
              <input 
                type="time" 
                name="endTime" 
                value={end}
                onChange={(e) => setEnd(e.target.value)}
                required 
                className="w-full p-2 border border-slate-200 rounded-lg text-sm bg-white" 
              />
            </div>
          </div>

          {/* Quick Helpers */}
          <div className="flex gap-2">
            <button type="button" onClick={() => addMinutes(35)} className="px-2 py-1 text-[10px] bg-white border border-slate-200 rounded text-slate-600 hover:border-blue-400 hover:text-blue-600 transition-colors">+35m</button>
            <button type="button" onClick={() => addMinutes(40)} className="px-2 py-1 text-[10px] bg-white border border-slate-200 rounded text-slate-600 hover:border-blue-400 hover:text-blue-600 transition-colors">+40m</button>
            <button type="button" onClick={() => addMinutes(60)} className="px-2 py-1 text-[10px] bg-white border border-slate-200 rounded text-slate-600 hover:border-blue-400 hover:text-blue-600 transition-colors">+1h</button>
          </div>
        </div>

        <button disabled={isSaving} className="w-full py-2.5 bg-slate-900 text-white rounded-lg text-sm font-bold hover:bg-slate-800 disabled:opacity-50 transition-all active:scale-[0.98] flex items-center justify-center gap-2">
          {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Add to Schedule'}
        </button>

      </form>
    </div>
  )
}