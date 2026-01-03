'use client'

import { updateClass } from '../actions'
import { Loader2, Pencil } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

export default function EditClassModal({ cls, teachers }: { cls: any, teachers: any[] }) {
  const [isOpen, setIsOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const handleSubmit = async (formData: FormData) => {
    setIsSaving(true)
    const res = await updateClass(cls.id, formData)
    setIsSaving(false)

    if (res?.success) {
      toast.success(res.message)
      setIsOpen(false)
    } else {
      toast.error(res?.message || 'Error')
    }
  }

  // Helper to open modal without triggering parent Link
  const handleOpen = (e: React.MouseEvent) => {
    e.preventDefault() // 👈 STOP Navigation
    e.stopPropagation() // 👈 STOP Bubble
    setIsOpen(true)
  }

  // Prevent clicks inside modal form from bubbling
  const handleModalClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }

  if (!isOpen) {
    return (
      <button 
        onClick={handleOpen}
        className="w-full py-2 border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 flex items-center justify-center gap-2 transition-colors relative z-10"
      >
        <Pencil className="w-3 h-3" /> Assign Teacher
      </button>
    )
  }

  return (
    <div 
      className="bg-slate-50 p-4 rounded-lg animate-in fade-in zoom-in duration-200 relative z-20 cursor-default"
      onClick={handleModalClick} // Stop clicks inside form from navigating
    >
      <form action={handleSubmit} className="space-y-3">
        <input type="hidden" name="name" value={cls.name} />
        
        <div>
          <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Class Teacher</label>
          <select name="teacherId" defaultValue={cls.class_teacher_id || ''} className="w-full p-2 border rounded-md text-sm bg-white">
            <option value="">No Assignment</option>
            {teachers.map((t) => (
              <option key={t.id} value={t.id}>{t.first_name} {t.last_name}</option>
            ))}
          </select>
        </div>

        <div className="flex gap-2">
          <button 
            type="button" 
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); setIsOpen(false); }} 
            className="flex-1 py-1.5 text-xs font-bold text-slate-500 hover:bg-slate-200 rounded"
          >
            Cancel
          </button>
          <button disabled={isSaving} className="flex-1 py-1.5 bg-blue-600 text-white rounded text-xs font-bold hover:bg-blue-700 disabled:opacity-50">
            {isSaving ? <Loader2 className="w-3 h-3 animate-spin mx-auto" /> : 'Save'}
          </button>
        </div>
      </form>
    </div>
  )
}