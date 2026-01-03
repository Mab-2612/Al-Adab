'use client'

import { createSubject } from '../actions'
import { Save, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { useRef, useState } from 'react'

export default function AddSubjectForm({ teachers }: { teachers: any[] }) {
  const formRef = useRef<HTMLFormElement>(null)
  const [isPending, setIsPending] = useState(false)
  const [category, setCategory] = useState('All') // Track category state

  const handleSubmit = async (formData: FormData) => {
    setIsPending(true)
    const result = await createSubject(formData)
    setIsPending(false)

    if (result && result.success) {
      toast.success(result.message)
      formRef.current?.reset()
      setCategory('All') // Reset state
    } else {
      toast.error(result?.message || "Failed")
    }
  }

  return (
    <form ref={formRef} action={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Subject Name</label>
        <input name="name" type="text" required placeholder="e.g. Physics" className="w-full p-2.5 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Subject Code</label>
        <input name="code" type="text" required placeholder="e.g. PHY" className="w-full p-2.5 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 uppercase font-mono" />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Subject Teacher</label>
        <select name="teacherId" className="w-full p-2.5 border border-slate-200 rounded-lg outline-none bg-white focus:ring-2 focus:ring-blue-500">
          <option value="">No Teacher Assigned</option>
          {teachers.map((t) => (
            <option key={t.id} value={t.id}>{t.first_name} {t.last_name}</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Class Category</label>
          <select 
            name="category" 
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full p-2.5 border border-slate-200 rounded-lg outline-none bg-white"
          >
            <option value="All">All Classes (General)</option>
            <option value="Junior">Junior Secondary (JSS)</option>
            <option value="Senior">Senior Secondary (SSS)</option>
          </select>
        </div>

        {/* 👇 Show Dept Scope ONLY if Senior is selected */}
        {category === 'Senior' && (
          <div className="animate-in fade-in slide-in-from-top-2">
            <label className="block text-sm font-medium text-slate-700 mb-1">Department Scope</label>
            <select name="departmentTarget" className="w-full p-2.5 border border-slate-200 rounded-lg outline-none bg-white focus:ring-2 focus:ring-purple-500">
              <option value="General">General (All Seniors)</option>
              <option value="Science">Science Only</option>
              <option value="Arts">Arts Only</option>
              <option value="Commercial">Commercial Only</option>
            </select>
          </div>
        )}
      </div>

      <div className="flex items-center gap-3 py-2">
        {/* 👇 Default Checked = True */}
        <input type="checkbox" name="isCompulsory" defaultChecked={true} id="compulsory" className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500 border-gray-300" />
        <label htmlFor="compulsory" className="text-sm text-slate-700 select-none">Mark as Compulsory (Core)</label>
      </div>

      <button disabled={isPending} type="submit" className="w-full py-2.5 bg-slate-900 text-white rounded-lg font-medium hover:bg-slate-800 transition-colors flex items-center justify-center gap-2 mt-2 disabled:opacity-70">
        {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
        Save Subject
      </button>
    </form>
  )
}