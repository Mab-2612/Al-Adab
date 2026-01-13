'use client'

import { useState } from 'react'
import { Check } from 'lucide-react'

export default function SubjectSelector({ 
  subjects, 
  initialSelected = [] 
}: { 
  subjects: any[], 
  initialSelected?: string[] 
}) {
  // Parse initial string "Math, Eng" into array ["Math", "Eng"]
  const [selected, setSelected] = useState<string[]>(initialSelected)

  const toggleSubject = (name: string) => {
    if (selected.includes(name)) {
      setSelected(selected.filter(s => s !== name))
    } else {
      setSelected([...selected, name])
    }
  }

  return (
    <div className="space-y-3">
      <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">
        Subject Specialization(s)
      </label>
      
      {/* Hidden inputs for Form Data */}
      {selected.map(s => (
        <input key={s} type="hidden" name="specialization" value={s} />
      ))}

      <div className="border border-slate-200 rounded-lg p-3 max-h-48 overflow-y-auto bg-slate-50 grid grid-cols-2 gap-2">
        {subjects.map((subject) => {
          const isSelected = selected.includes(subject.name)
          return (
            <div 
              key={subject.id}
              onClick={() => toggleSubject(subject.name)}
              className={`flex items-center gap-2 p-2 rounded cursor-pointer border transition-all text-xs font-medium select-none ${
                isSelected 
                  ? 'bg-blue-100 border-blue-200 text-blue-800' 
                  : 'bg-white border-slate-200 text-slate-600 hover:border-blue-300'
              }`}
            >
              <div className={`w-4 h-4 rounded border flex items-center justify-center ${
                isSelected ? 'bg-blue-600 border-blue-600' : 'border-slate-300 bg-white'
              }`}>
                {isSelected && <Check className="w-3 h-3 text-white" />}
              </div>
              {subject.name}
            </div>
          )
        })}
      </div>
      
      {selected.length === 0 && (
        <p className="text-[10px] text-red-500">* Please select at least one subject.</p>
      )}
    </div>
  )
}