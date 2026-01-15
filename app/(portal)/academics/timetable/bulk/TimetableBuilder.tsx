'use client'

import { useState } from 'react'
// 👇 FIX: Changed from '../../actions' to '../actions'
import { bulkUpdateTimetable } from '../actions' 
import { Save, Loader2, Wand2, Plus, Trash2, Clock } from 'lucide-react'
import { toast } from 'sonner'

export default function TimetableBuilder({ classId, subjects }: { classId: string, subjects: any[] }) {
  const [isSaving, setIsSaving] = useState(false)
  const [duration, setDuration] = useState(40) // Default period length
  const [startTime, setStartTime] = useState('08:00')
  
  // The Grid State
  const [rows, setRows] = useState<any[]>([
    { id: 1, startTime: '08:00', endTime: '08:40', monday: '', tuesday: '', wednesday: '', thursday: '', friday: '' }
  ])

  // 🪄 Auto-Generate Rows
  const generateRows = () => {
    if(!confirm("This will replace current rows. Continue?")) return
    
    const newRows = []
    let currentTime = new Date(`2000-01-01T${startTime}:00`)
    
    for (let i = 0; i < 8; i++) {
       const start = currentTime.toTimeString().slice(0, 5)
       // Add duration
       currentTime.setMinutes(currentTime.getMinutes() + duration)
       const end = currentTime.toTimeString().slice(0, 5)
       
       newRows.push({
         id: i,
         startTime: start,
         endTime: end,
         monday: '', tuesday: '', wednesday: '', thursday: '', friday: ''
       })
    }
    setRows(newRows)
  }

  const addRow = () => {
    // Try to guess next time based on last row
    let nextStart = '08:00'
    let nextEnd = '08:40'
    
    if (rows.length > 0) {
      const last = rows[rows.length - 1]
      if (last.endTime) {
         nextStart = last.endTime
         const d = new Date(`2000-01-01T${nextStart}:00`)
         d.setMinutes(d.getMinutes() + duration)
         nextEnd = d.toTimeString().slice(0, 5)
      }
    }

    setRows([...rows, { 
       id: Date.now(), 
       startTime: nextStart, 
       endTime: nextEnd, 
       monday: '', tuesday: '', wednesday: '', thursday: '', friday: '' 
    }])
  }

  const updateRow = (index: number, field: string, value: string) => {
    const newRows = [...rows]
    newRows[index][field] = value
    setRows(newRows)
  }

  const removeRow = (index: number) => {
    setRows(rows.filter((_, i) => i !== index))
  }

  const handleSave = async () => {
    setIsSaving(true)
    const res = await bulkUpdateTimetable(classId, rows)
    setIsSaving(false)

    if (res?.success) toast.success(res.message)
    else toast.error(res?.error)
  }

  return (
    <div className="space-y-6">
      
      {/* Controls */}
      <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl flex flex-wrap gap-4 items-end">
        <div>
          <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Start Time</label>
          <input type="time" value={startTime} onChange={e => setStartTime(e.target.value)} className="p-2 border rounded-lg text-sm bg-white" />
        </div>
        <div>
          <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Duration (Min)</label>
          <input type="number" value={duration} onChange={e => setDuration(Number(e.target.value))} className="p-2 border rounded-lg text-sm w-20 bg-white" />
        </div>
        <button onClick={generateRows} className="px-4 py-2 bg-purple-100 text-purple-700 font-bold rounded-lg hover:bg-purple-200 transition-colors flex items-center gap-2 text-sm h-[38px]">
          <Wand2 className="w-4 h-4" /> Auto-Generate Rows
        </button>
      </div>

      {/* The Grid */}
      <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm bg-white overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[1000px]">
          <thead className="bg-slate-50 text-xs uppercase text-slate-500 font-bold">
            <tr>
              <th className="p-3 border-r border-slate-200 w-32 text-center">Time</th>
              <th className="p-3 border-r border-slate-200">Monday</th>
              <th className="p-3 border-r border-slate-200">Tuesday</th>
              <th className="p-3 border-r border-slate-200">Wednesday</th>
              <th className="p-3 border-r border-slate-200">Thursday</th>
              <th className="p-3 border-r border-slate-200">Friday</th>
              <th className="p-3 w-10"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.map((row, i) => (
              <tr key={row.id} className="hover:bg-slate-50">
                {/* Time Inputs */}
                <td className="p-2 border-r border-slate-100 bg-slate-50/50">
                  <div className="flex flex-col gap-1">
                    <input 
                      type="time" 
                      value={row.startTime} 
                      onChange={e => updateRow(i, 'startTime', e.target.value)} 
                      className="w-full text-xs bg-transparent text-center font-mono outline-none focus:text-blue-600"
                    />
                    <input 
                      type="time" 
                      value={row.endTime} 
                      onChange={e => updateRow(i, 'endTime', e.target.value)} 
                      className="w-full text-xs bg-transparent text-center font-mono text-slate-400 outline-none focus:text-blue-600"
                    />
                  </div>
                </td>

                {/* Day Columns */}
                {['monday', 'tuesday', 'wednesday', 'thursday', 'friday'].map(day => (
                  <td key={day} className="p-0 border-r border-slate-100 relative">
                     <select 
                       value={row[day]} 
                       onChange={e => updateRow(i, day, e.target.value)}
                       className="w-full h-full p-2 bg-transparent outline-none text-xs focus:bg-blue-50/50 absolute inset-0 cursor-pointer appearance-none text-center font-medium text-slate-700"
                     >
                       <option value="">- Free -</option>
                       {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                       <option value="free" className="text-slate-400">-- Break --</option>
                     </select>
                  </td>
                ))}

                {/* Delete Row */}
                <td className="p-1 text-center">
                  <button onClick={() => removeRow(i)} className="text-slate-300 hover:text-red-500 p-2 rounded">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex justify-between pt-4">
        <button onClick={addRow} className="px-4 py-2 border border-slate-300 text-slate-600 font-bold rounded-lg hover:bg-slate-50 flex items-center gap-2 text-sm">
           <Plus className="w-4 h-4" /> Add Row
        </button>
        
        <button onClick={handleSave} disabled={isSaving} className="px-8 py-3 bg-slate-900 text-white font-bold rounded-lg hover:bg-slate-800 disabled:opacity-50 flex items-center gap-2 shadow-lg">
           {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Save className="w-4 h-4" /> Save Full Timetable</>}
        </button>
      </div>

    </div>
  )
}