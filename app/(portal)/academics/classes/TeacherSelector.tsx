'use client'

import { useState } from 'react'
import { Check } from 'lucide-react'

export default function TeacherSelector({ 
  teachers, 
  initialSelected = [] 
}: { 
  teachers: any[], 
  initialSelected?: string[] 
}) {
  const [selected, setSelected] = useState<string[]>(initialSelected)

  const toggleTeacher = (id: string) => {
    if (selected.includes(id)) {
      setSelected(selected.filter(t => t !== id))
    } else {
      setSelected([...selected, id])
    }
  }

  return (
    <div className="space-y-3">
      <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">
        Assigned Teacher(s)
      </label>
      
      {/* Hidden inputs for Form Data */}
      {selected.map(id => (
        <input key={id} type="hidden" name="teacherId" value={id} />
      ))}

      <div className="border border-slate-200 rounded-lg p-2 max-h-48 overflow-y-auto bg-slate-50 grid grid-cols-1 gap-1">
        {teachers.map((teacher) => {
          const isSelected = selected.includes(teacher.id)
          return (
            <div 
              key={teacher.id}
              onClick={() => toggleTeacher(teacher.id)}
              className={`flex items-center gap-3 p-2 rounded-md cursor-pointer border transition-all text-sm select-none ${
                isSelected 
                  ? 'bg-purple-100 border-purple-200 text-purple-900' 
                  : 'bg-white border-transparent hover:bg-white hover:border-slate-200'
              }`}
            >
              <div className={`w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 ${
                isSelected ? 'bg-purple-600 border-purple-600' : 'border-slate-300 bg-white'
              }`}>
                {isSelected && <Check className="w-3 h-3 text-white" />}
              </div>
              <span className="truncate">
                {teacher.first_name} {teacher.last_name}
              </span>
            </div>
          )
        })}
      </div>
      
      {selected.length === 0 && (
        <p className="text-[10px] text-slate-400 italic">No teachers assigned yet.</p>
      )}
    </div>
  )
}