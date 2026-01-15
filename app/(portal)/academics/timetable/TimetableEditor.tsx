'use client'

import { useState, useEffect } from 'react'
import { bulkUpdateTimetable } from './actions'
import { Save, Loader2, Wand2, Plus, Trash2, Mic2, Coffee, BookOpen, Clock, Settings2, ChevronDown, ChevronUp, RefreshCw } from 'lucide-react'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

const STD_DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday']
const FRI_DAY = ['Friday']

type RowType = 'lesson' | 'break' | 'assembly'

type TimeCol = {
  start: string
  end: string
  type: RowType
  label: string
}

export default function TimetableEditor({ 
  classId, 
  subjects, 
  classes, 
  initialSchedule 
}: { 
  classId: string, 
  subjects: any[], 
  classes: any[], 
  initialSchedule?: Record<string, any[]>
}) {
  const router = useRouter()
  const [isSaving, setIsSaving] = useState(false)
  const [showConfig, setShowConfig] = useState(false)

  // Configuration
  const [stdDuration, setStdDuration] = useState(40)
  const [stdCount, setStdCount] = useState(8)
  const [stdStart, setStdStart] = useState('08:00')

  const [friDuration, setFriDuration] = useState(30)
  const [friCount, setFriCount] = useState(6)
  const [friStart, setFriStart] = useState('08:00')

  // Data State
  const [stdTimes, setStdTimes] = useState<TimeCol[]>([])
  const [friTimes, setFriTimes] = useState<TimeCol[]>([])
  const [gridData, setGridData] = useState<Record<string, string>>({})

  // CSS for cleaner time inputs
  const timeInputClass = "bg-transparent font-mono text-slate-800 text-[10px] w-10 text-right outline-none focus:text-blue-600 font-bold appearance-none [&::-webkit-calendar-picker-indicator]:hidden"

  // Initialize Data
  useEffect(() => {
    if (initialSchedule && Object.keys(initialSchedule).length > 0) {
      // 1. Load Mon-Thu Structure
      const monData = initialSchedule['Monday'] || []
      if (monData.length > 0) {
        setStdTimes(monData.map((p: any) => ({
          start: p.startTime,
          end: p.endTime,
          type: p.type || 'lesson',
          label: p.label || ''
        })))
      } else {
        setStdTimes(generateDefaultTimes(8, 40, '08:00'))
      }

      // 2. Load Friday Structure
      const friData = initialSchedule['Friday'] || []
      if (friData.length > 0) {
        setFriTimes(friData.map((p: any) => ({
          start: p.startTime,
          end: p.endTime,
          type: p.type || 'lesson',
          label: p.label || ''
        })))
      } else {
        setFriTimes(generateDefaultTimes(6, 35, '08:00'))
      }

      // 3. Populate Grid Subjects
      const newGrid: Record<string, string> = {}
      Object.entries(initialSchedule).forEach(([day, periods]) => {
        periods.forEach((p: any, idx: number) => {
          if (p.subjectId) newGrid[`${day}-${idx}`] = p.subjectId
        })
      })
      setGridData(newGrid)
    } else {
      // Default Fresh Start
      setStdTimes(generateDefaultTimes(8, 40, '08:00'))
      setFriTimes(generateDefaultTimes(6, 35, '08:00'))
    }
  }, [initialSchedule])

  const handleClassChange = (newId: string) => {
    router.push(`/academics/timetable?classId=${newId}`)
  }

  function generateDefaultTimes(count: number, duration: number, startStr: string) {
    const times: TimeCol[] = []
    
    // Default Assembly Slot
    times.push({ start: '07:45', end: '08:00', type: 'assembly', label: 'ASSEMBLY' })
    
    let currentTime = new Date(`2000-01-01T${startStr}:00`)
    for (let i = 0; i < count; i++) {
      const start = currentTime.toTimeString().slice(0, 5)
      currentTime.setMinutes(currentTime.getMinutes() + duration)
      const end = currentTime.toTimeString().slice(0, 5)
      times.push({ start, end, type: 'lesson', label: '' })
      
      // Default Break after 4th period (Optional logic)
      if (i === 3) {
         const bStart = end
         currentTime.setMinutes(currentTime.getMinutes() + 20)
         const bEnd = currentTime.toTimeString().slice(0, 5)
         times.push({ start: bStart, end: bEnd, type: 'break', label: 'BREAK' })
      }
    }
    return times
  }

  const handleRegenerate = () => {
    if(!confirm("This will reset all columns and clear subjects. Continue?")) return
    setStdTimes(generateDefaultTimes(stdCount, stdDuration, stdStart))
    setFriTimes(generateDefaultTimes(friCount, friDuration, friStart))
    setGridData({})
    toast.success("Grid reset!")
    setShowConfig(false)
  }

  const addColumn = (isFriday: boolean) => {
    const times = isFriday ? friTimes : stdTimes
    const setTimes = isFriday ? setFriTimes : setStdTimes
    const dur = isFriday ? friDuration : stdDuration
    
    let nextStart = '08:00'
    let nextEnd = '08:40'
    
    if (times.length > 0) {
      const last = times[times.length - 1]
      if (last.end) {
         nextStart = last.end
         const d = new Date(`2000-01-01T${nextStart}:00`)
         d.setMinutes(d.getMinutes() + dur)
         nextEnd = d.toTimeString().slice(0, 5)
      }
    }

    setTimes([...times, { start: nextStart, end: nextEnd, type: 'lesson', label: '' }])
  }

  const removeColumn = (isFriday: boolean, index: number) => {
    if (!confirm('Delete this time slot?')) return
    if (isFriday) {
      setFriTimes(friTimes.filter((_, i) => i !== index))
    } else {
      setStdTimes(stdTimes.filter((_, i) => i !== index))
    }
  }

  const updateTimeHeader = (isFriday: boolean, index: number, field: keyof TimeCol, value: string) => {
    const setTimes = isFriday ? setFriTimes : setStdTimes
    const times = isFriday ? [...friTimes] : [...stdTimes]
    // @ts-ignore
    times[index][field] = value
    setTimes(times)
  }

  const toggleColumnType = (isFriday: boolean, index: number, type: RowType) => {
    const setTimes = isFriday ? setFriTimes : setStdTimes
    const times = isFriday ? [...friTimes] : [...stdTimes]
    
    const newCol = { ...times[index], type: type }
    
    if (type === 'assembly') newCol.label = 'ASSEMBLY'
    else if (type === 'break') newCol.label = 'BREAK'
    else if (type === 'lesson') newCol.label = ''
    
    times[index] = newCol
    setTimes(times)
  }

  const updateSubject = (day: string, index: number, subjectId: string) => {
    setGridData(prev => ({
      ...prev,
      [`${day}-${index}`]: subjectId
    }))
  }

  const handleSave = async () => {
    if (!classId) return toast.error('Please select a class')
    setIsSaving(true)

    const payload: any[] = []

    const process = (days: string[], times: TimeCol[]) => {
      days.forEach(day => {
        times.forEach((time, idx) => {
          if (time.type !== 'lesson') {
            payload.push({ day, startTime: time.start, endTime: time.end, type: time.type, label: time.label, subjectId: null })
          } else {
            const subjectId = gridData[`${day}-${idx}`]
            if (subjectId) {
              payload.push({ day, startTime: time.start, endTime: time.end, type: 'lesson', subjectId })
            }
          }
        })
      })
    }

    process(STD_DAYS, stdTimes)
    process(FRI_DAY, friTimes)

    const res = await bulkUpdateTimetable(classId, payload)
    setIsSaving(false)

    if (res?.success) toast.success(res.message)
    else toast.error(res?.error)
  }

  // --- RENDER TABLE HELPER ---
  const renderTable = (days: string[], times: TimeCol[], isFriday: boolean) => (
    <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm bg-white overflow-x-auto relative">
       <table className="w-full text-left border-collapse min-w-max">
         <thead>
           <tr className="bg-slate-50 border-b border-slate-200">
             <th className="p-4 w-32 font-bold text-xs uppercase text-slate-500 sticky left-0 bg-slate-50 z-20 border-r border-slate-200">
                <div className="flex flex-col gap-1">
                  <span>Day</span>
                  <span className="text-[10px] font-normal text-slate-400">Time &rarr;</span>
                </div>
             </th>
             {times.map((time, i) => {
               // 👇 Logic: Calculate Lesson Number (Skip breaks/assemblies)
               const lessonCount = times.slice(0, i + 1).filter(t => t.type === 'lesson').length;

               return (
                <th key={i} className={`p-2 border-r border-slate-200 min-w-[120px] text-center group ${time.type !== 'lesson' ? 'bg-orange-50/50' : ''}`}>
                  
                  {/* Column Controls (Hover) */}
                  <div className="flex justify-center gap-1 mb-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => toggleColumnType(isFriday, i, 'lesson')} title="Lesson" className={`p-1 rounded ${time.type === 'lesson' ? 'bg-blue-100 text-blue-600' : 'hover:bg-slate-200 text-slate-400'}`}><BookOpen className="w-3 h-3"/></button>
                      <button onClick={() => toggleColumnType(isFriday, i, 'break')} title="Break" className={`p-1 rounded ${time.type === 'break' ? 'bg-orange-100 text-orange-600' : 'hover:bg-slate-200 text-slate-400'}`}><Coffee className="w-3 h-3"/></button>
                      <button onClick={() => toggleColumnType(isFriday, i, 'assembly')} title="Assembly" className={`p-1 rounded ${time.type === 'assembly' ? 'bg-purple-100 text-purple-600' : 'hover:bg-slate-200 text-slate-400'}`}><Mic2 className="w-3 h-3"/></button>
                      <div className="w-px h-3 bg-slate-300 mx-1"></div>
                      <button onClick={() => removeColumn(isFriday, i)} title="Remove Column" className="p-1 rounded hover:bg-red-100 text-red-500"><Trash2 className="w-3 h-3"/></button>
                  </div>

                  {/* Period Label */}
                  <div className="mb-1 text-center">
                      {time.type === 'lesson' ? (
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Period {lessonCount}</span>
                      ) : (
                        <input 
                          value={time.label} 
                          onChange={e => updateTimeHeader(isFriday, i, 'label', e.target.value)}
                          className="w-full text-center text-[10px] font-bold uppercase bg-transparent outline-none text-orange-600 placeholder:text-orange-300"
                          placeholder="LABEL..."
                        />
                      )}
                  </div>

                  {/* Time Inputs */}
                  <div className="flex items-center justify-center gap-1 bg-white border border-slate-200 rounded px-1 py-0.5 mx-auto w-fit">
                    <input 
                      type="time" 
                      value={time.start} 
                      onChange={e => updateTimeHeader(isFriday, i, 'start', e.target.value)} 
                      className={timeInputClass} 
                    />
                    <span className="text-slate-300 text-[10px]">-</span>
                    <input 
                      type="time" 
                      value={time.end} 
                      onChange={e => updateTimeHeader(isFriday, i, 'end', e.target.value)} 
                      className={`${timeInputClass} text-left`}
                    />
                  </div>
                </th>
               )
             })}
             
             {/* Add Column Button */}
             <th className="p-2 w-12 border-l border-slate-200 bg-slate-50 align-middle text-center">
                <button 
                  onClick={() => addColumn(isFriday)} 
                  className="w-8 h-8 flex items-center justify-center bg-white border border-slate-300 text-slate-500 rounded-full hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 transition-colors shadow-sm"
                  title="Add Period"
                >
                  <Plus className="w-4 h-4" />
                </button>
             </th>
           </tr>
         </thead>
         <tbody className="divide-y divide-slate-100">
           {days.map(day => (
             <tr key={day} className="hover:bg-slate-50 transition-colors">
               <td className="p-4 font-bold text-slate-700 text-sm border-r border-slate-200 sticky left-0 bg-white z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">
                 <div className="flex items-center gap-2">
                    <div className={`w-1 h-6 rounded-full ${isFriday ? 'bg-purple-500' : 'bg-blue-500'}`}></div>
                    {day}
                 </div>
               </td>
               
               {times.map((time, i) => (
                 <td key={i} className={`p-0 border-r border-slate-100 h-12 relative ${time.type !== 'lesson' ? 'bg-orange-50/20' : ''}`}>
                    {time.type === 'lesson' ? (
                       <select 
                         value={gridData[`${day}-${i}`] || ''}
                         onChange={(e) => updateSubject(day, i, e.target.value)}
                         className={`w-full h-full p-2 bg-transparent outline-none text-xs text-center font-bold appearance-none cursor-pointer focus:bg-blue-50/50 ${
                           gridData[`${day}-${i}`] ? 'text-slate-800' : 'text-slate-300'
                         }`}
                       >
                         <option value="">-</option>
                         {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                       </select>
                    ) : (
                       <div className="w-full h-full flex items-center justify-center">
                         <span className="text-[10px] font-bold text-slate-300/50 uppercase tracking-widest select-none pointer-events-none">
                           {time.label}
                         </span>
                       </div>
                    )}
                 </td>
               ))}
               <td className="bg-slate-50 border-l border-slate-200"></td>
             </tr>
           ))}
         </tbody>
       </table>
    </div>
  )

  return (
    <div className="space-y-12">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start gap-6 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <div className="w-full md:w-1/3">
           <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Select Class</label>
           <select 
             value={classId} 
             onChange={(e) => handleClassChange(e.target.value)}
             className="w-full p-3 border border-slate-200 rounded-lg bg-slate-50 outline-none focus:ring-2 focus:ring-blue-500 font-bold text-slate-700"
           >
             <option value="">-- Choose Class --</option>
             {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
           </select>
        </div>

        <div className="flex gap-3">
           {/* Toggle Config */}
           <button 
             onClick={() => setShowConfig(!showConfig)}
             className={`px-4 py-3 rounded-xl font-bold flex items-center gap-2 transition-colors ${
               showConfig ? 'bg-slate-100 text-slate-700' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
             }`}
           >
              <Settings2 className="w-5 h-5" />
              Reset Grid
              {showConfig ? <ChevronUp className="w-4 h-4 ml-1" /> : <ChevronDown className="w-4 h-4 ml-1" />}
           </button>

           <button 
             onClick={handleSave} 
             disabled={isSaving || !classId} 
             className="px-6 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2 shadow-lg shadow-blue-600/20 active:scale-95 transition-transform"
           >
              {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Save className="w-5 h-5" /> Save Timetable</>}
           </button>
        </div>
      </div>

      {/* GENERATOR CONFIG */}
      {showConfig && classId && (
        <div className="bg-slate-900 text-white p-6 rounded-xl shadow-lg border border-slate-800 animate-in fade-in slide-in-from-top-4">
           <div className="grid md:grid-cols-2 gap-8 mb-6">
              <div className="space-y-4">
                 <h4 className="font-bold text-blue-400 flex items-center gap-2">Mon - Thu Defaults</h4>
                 <div className="grid grid-cols-3 gap-4">
                    <div><label className="text-[10px] font-bold text-slate-400 block mb-1">Start</label><input type="time" value={stdStart} onChange={e => setStdStart(e.target.value)} className="w-full bg-slate-800 border-slate-700 rounded p-2 text-sm" /></div>
                    <div><label className="text-[10px] font-bold text-slate-400 block mb-1">Mins</label><input type="number" value={stdDuration} onChange={e => setStdDuration(Number(e.target.value))} className="w-full bg-slate-800 border-slate-700 rounded p-2 text-sm" /></div>
                    <div><label className="text-[10px] font-bold text-slate-400 block mb-1">Slots</label><input type="number" value={stdCount} onChange={e => setStdCount(Number(e.target.value))} className="w-full bg-slate-800 border-slate-700 rounded p-2 text-sm" /></div>
                 </div>
              </div>
              <div className="space-y-4">
                 <h4 className="font-bold text-purple-400 flex items-center gap-2">Friday Defaults</h4>
                 <div className="grid grid-cols-3 gap-4">
                    <div><label className="text-[10px] font-bold text-slate-400 block mb-1">Start</label><input type="time" value={friStart} onChange={e => setFriStart(e.target.value)} className="w-full bg-slate-800 border-slate-700 rounded p-2 text-sm" /></div>
                    <div><label className="text-[10px] font-bold text-slate-400 block mb-1">Mins</label><input type="number" value={friDuration} onChange={e => setFriDuration(Number(e.target.value))} className="w-full bg-slate-800 border-slate-700 rounded p-2 text-sm" /></div>
                    <div><label className="text-[10px] font-bold text-slate-400 block mb-1">Slots</label><input type="number" value={friCount} onChange={e => setFriCount(Number(e.target.value))} className="w-full bg-slate-800 border-slate-700 rounded p-2 text-sm" /></div>
                 </div>
              </div>
           </div>
           <button onClick={handleRegenerate} className="w-full py-3 bg-white text-slate-900 font-bold rounded-lg hover:bg-blue-50 transition-colors flex items-center justify-center gap-2">
             <RefreshCw className="w-4 h-4" /> Reset Grid Structure
           </button>
        </div>
      )}

      {classId ? (
        <>
          {/* TABLES */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <div className="w-2 h-6 bg-blue-600 rounded-full"></div> Standard Week (Mon - Thu)
            </h3>
            {renderTable(STD_DAYS, stdTimes, false)}
          </div>

          <div className="space-y-4">
             <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <div className="w-2 h-6 bg-purple-600 rounded-full"></div> Friday (Jumu'ah)
            </h3>
            {renderTable(FRI_DAY, friTimes, true)}
          </div>
        </>
      ) : (
        <div className="py-32 text-center bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 text-slate-400">
           <Clock className="w-12 h-12 mx-auto mb-3 opacity-20" />
           <p className="font-medium">Please select a class to load the timetable.</p>
        </div>
      )}

    </div>
  )
}