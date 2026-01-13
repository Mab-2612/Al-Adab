'use client'

import { updateClass } from '../actions'
import { Loader2, Pencil, X, Save } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import TeacherSelector from './TeacherSelector' // 👈 Import

export default function EditClassModal({ cls, teachers }: { cls: any, teachers: any[] }) {
  const [isOpen, setIsOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  // Extract initial IDs from the joined data
  // cls.class_teachers is an array of objects: [{ teacher_id: "..." }, ...]
  const initialIds = cls.class_teachers?.map((t: any) => t.teacher_id) || []

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSaving(true)

    const formData = new FormData(e.currentTarget)
    const res = await updateClass(cls.id, formData)
    
    setIsSaving(false)

    if (res?.success) {
      toast.success(res.message)
      setIsOpen(false)
    } else {
      toast.error(res?.message || 'Error updating class')
    }
  }

  const handleOpen = (e: React.MouseEvent) => {
    e.preventDefault() 
    e.stopPropagation()
    setIsOpen(true)
  }

  const handleClose = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsOpen(false)
  }

  const handleModalClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }

  if (!isOpen) {
    return (
      <button 
        onClick={handleOpen}
        className="w-full py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-white hover:text-purple-600 hover:border-purple-200 shadow-sm flex items-center justify-center gap-2 transition-all"
      >
        <Pencil className="w-3 h-3" /> Assign Teachers
      </button>
    )
  }

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 animate-in fade-in duration-200 cursor-default" 
      onClick={handleClose}
    >
      <div 
        className="bg-white rounded-xl shadow-xl max-w-sm w-full overflow-hidden relative"
        onClick={handleModalClick}
      >
        
        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
           <h3 className="font-bold text-slate-800 flex items-center gap-2">
             Edit Class: <span className="text-purple-600">{cls.name}</span>
           </h3>
           <button type="button" onClick={handleClose} className="p-1 hover:bg-slate-200 rounded-full text-slate-500">
             <X className="w-5 h-5" />
           </button>
        </div>

        <div className="p-6">
          <form onSubmit={onSubmit} className="space-y-4">
            
            {/* 👇 NEW: Multi-Select Component */}
            <TeacherSelector teachers={teachers} initialSelected={initialIds} />

            <div className="pt-2 flex gap-3">
              <button 
                type="button" 
                onClick={handleClose} 
                disabled={isSaving}
                className="flex-1 py-2.5 text-sm font-bold text-slate-500 hover:bg-slate-100 rounded-lg border border-transparent"
              >
                Cancel
              </button>
              <button 
                type="submit"
                disabled={isSaving} 
                className="flex-1 py-2.5 bg-purple-600 text-white rounded-lg text-sm font-bold hover:bg-purple-700 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isSaving ? <Loader2 className="w-3 h-3 animate-spin mx-auto" /> : <><Save className="w-4 h-4" /> Save</>}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}