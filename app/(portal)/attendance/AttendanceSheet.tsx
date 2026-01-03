'use client'

import { saveAttendance } from './actions'
import { Save, Loader2, CheckSquare } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

export default function AttendanceSheet({ 
  students, 
  existingRecords,
  classId,
  date 
}: { 
  students: any[], 
  existingRecords: any[], 
  classId: string, 
  date: string 
}) {
  const [isSaving, setIsSaving] = useState(false)

  // Helper to get initial status
  const getStatus = (studentId: string) => {
    return existingRecords.find(r => r.student_id === studentId)?.status || 'present' // Default to present
  }

  const handleSubmit = async (formData: FormData) => {
    setIsSaving(true)
    const result = await saveAttendance(formData)
    setIsSaving(false)

    if (result && result.success) {
      toast.success(result.message)
    } else {
      toast.error(result?.error || 'Failed')
    }
  }

  return (
    <form action={handleSubmit} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <input type="hidden" name="classId" value={classId} />
      <input type="hidden" name="date" value={date} />

      <div className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center sticky top-0 z-10">
        <h3 className="font-bold text-slate-800">{students.length} Students</h3>
        <button 
          type="submit" 
          disabled={isSaving}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium disabled:opacity-50 transition-colors"
        >
          {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Save Attendance
        </button>
      </div>

      <div className="divide-y divide-slate-100">
        {students.map((student) => (
          <div key={student.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
            
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold text-sm">
                {student.profiles?.first_name?.[0]}{student.profiles?.last_name?.[0]}
              </div>
              <div>
                <p className="font-bold text-slate-900 text-sm">
                  {student.profiles?.first_name} {student.profiles?.last_name}
                </p>
                <p className="text-xs text-slate-500 font-mono">{student.admission_number}</p>
              </div>
            </div>

            {/* Status Selectors */}
            <div className="flex bg-slate-100 p-1 rounded-lg">
              <label className="cursor-pointer">
                <input 
                  type="radio" 
                  name={`status_${student.id}`} 
                  value="present" 
                  defaultChecked={getStatus(student.id) === 'present'}
                  className="peer sr-only" 
                />
                <span className="block px-3 py-1.5 rounded-md text-xs font-bold text-slate-500 peer-checked:bg-white peer-checked:text-green-600 peer-checked:shadow-sm transition-all">
                  Present
                </span>
              </label>

              <label className="cursor-pointer">
                <input 
                  type="radio" 
                  name={`status_${student.id}`} 
                  value="absent" 
                  defaultChecked={getStatus(student.id) === 'absent'}
                  className="peer sr-only" 
                />
                <span className="block px-3 py-1.5 rounded-md text-xs font-bold text-slate-500 peer-checked:bg-white peer-checked:text-red-600 peer-checked:shadow-sm transition-all">
                  Absent
                </span>
              </label>

              <label className="cursor-pointer">
                <input 
                  type="radio" 
                  name={`status_${student.id}`} 
                  value="late" 
                  defaultChecked={getStatus(student.id) === 'late'}
                  className="peer sr-only" 
                />
                <span className="block px-3 py-1.5 rounded-md text-xs font-bold text-slate-500 peer-checked:bg-white peer-checked:text-orange-500 peer-checked:shadow-sm transition-all">
                  Late
                </span>
              </label>
            </div>

          </div>
        ))}
      </div>
      
      {students.length === 0 && (
        <div className="p-12 text-center text-slate-500">No students found.</div>
      )}
    </form>
  )
}