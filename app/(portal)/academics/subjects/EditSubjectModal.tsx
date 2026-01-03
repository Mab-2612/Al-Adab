'use client'

import { updateSubject } from '../actions'
import { Save, Loader2, X } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

export default function EditSubjectModal({ subject, teachers, onClose }: { subject: any, teachers: any[], onClose: () => void }) {
  const [isPending, setIsPending] = useState(false)
  // Initialize category state with existing value
  const [category, setCategory] = useState(subject.category || 'All')

  const handleSubmit = async (formData: FormData) => {
    setIsPending(true)
    const result = await updateSubject(subject.id, formData)
    setIsPending(false)

    if (result && result.success) {
      toast.success(result.message)
      onClose()
    } else {
      toast.error(result?.message || 'Update failed')
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
           <h3 className="font-bold text-slate-800">Edit Subject</h3>
           <button onClick={onClose} className="p-1 hover:bg-slate-200 rounded-full text-slate-500">
             <X className="w-5 h-5" />
           </button>
        </div>
        
        <form action={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Subject Name</label>
            <input name="name" defaultValue={subject.name} required className="w-full p-2.5 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Code</label>
              <input name="code" defaultValue={subject.code} required className="w-full p-2.5 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 uppercase font-mono" />
            </div>
            
            {/* Teacher Select */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Teacher</label>
              <select name="teacherId" defaultValue={subject.teacher_id || ''} className="w-full p-2.5 border border-slate-200 rounded-lg outline-none bg-white">
                <option value="">No Teacher</option>
                {teachers.map((t) => (
                  <option key={t.id} value={t.id}>{t.first_name} {t.last_name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
              <select 
                name="category" 
                value={category} 
                onChange={(e) => setCategory(e.target.value)}
                className="w-full p-2.5 border border-slate-200 rounded-lg outline-none bg-white"
              >
                <option value="All">All Classes</option>
                <option value="Junior">Junior Secondary</option>
                <option value="Senior">Senior Secondary</option>
              </select>
            </div>
            
            {/* Conditional Dept Scope */}
            {category === 'Senior' && (
              <div className="animate-in fade-in slide-in-from-top-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">Dept Scope</label>
                <select name="departmentTarget" defaultValue={subject.department_target || 'General'} className="w-full p-2.5 border border-slate-200 rounded-lg outline-none bg-white">
                  <option value="General">General</option>
                  <option value="Science">Science</option>
                  <option value="Arts">Arts</option>
                  <option value="Commercial">Commercial</option>
                </select>
              </div>
            )}
          </div>

          <div className="flex items-center gap-3 py-2">
            <input type="checkbox" name="isCompulsory" defaultChecked={subject.is_compulsory} id="edit-compulsory" className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500 border-gray-300" />
            <label htmlFor="edit-compulsory" className="text-sm text-slate-700 select-none">Mark as Compulsory</label>
          </div>

          <button disabled={isPending} type="submit" className="w-full py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 mt-2 disabled:opacity-70">
            {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Update Changes
          </button>
        </form>
      </div>
    </div>
  )
}