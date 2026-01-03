'use client'

import { updateStaff } from './actions'
import { UserCog, Loader2, X, Shield, GraduationCap } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

export default function EditStaffModal({ staff, onClose, subjects }: { staff: any, onClose: () => void, subjects: any[] }) {
  const [isSaving, setIsSaving] = useState(false)
  const [role, setRole] = useState(staff.role || 'teacher')

  const handleSubmit = async (formData: FormData) => {
    setIsSaving(true)
    const res = await updateStaff(staff.id, formData)
    setIsSaving(false)

    if (res?.success) {
      toast.success(res.message)
      onClose()
    } else {
      toast.error(res?.error)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in duration-200">
        
        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
           <h3 className="font-bold text-slate-800 flex items-center gap-2">
             <UserCog className="w-5 h-5 text-blue-600" /> Edit Staff
           </h3>
           <button onClick={onClose} className="p-1 hover:bg-slate-200 rounded-full text-slate-500">
             <X className="w-5 h-5" />
           </button>
        </div>
        
        <form action={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">First Name</label>
              <input name="firstName" defaultValue={staff.first_name} required className="w-full p-2.5 border rounded-lg" />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Last Name</label>
              <input name="lastName" defaultValue={staff.last_name} required className="w-full p-2.5 border rounded-lg" />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Email (Read Only)</label>
            <input name="email" defaultValue={staff.email} disabled className="w-full p-2.5 border rounded-lg bg-slate-100 text-slate-500 cursor-not-allowed" />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Phone Number</label>
            <input name="phone" defaultValue={staff.phone_number} type="tel" className="w-full p-2.5 border rounded-lg" />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Role</label>
            <div className="grid grid-cols-2 gap-4">
              <label className="cursor-pointer">
                <input type="radio" name="role" value="teacher" checked={role === 'teacher'} onChange={() => setRole('teacher')} className="peer sr-only" />
                <div className="p-3 border rounded-lg text-center peer-checked:border-blue-500 peer-checked:bg-blue-50 hover:bg-slate-50 transition-all">
                  <GraduationCap className="w-6 h-6 mx-auto mb-1 text-slate-400 peer-checked:text-blue-600" />
                  <span className="text-sm font-medium text-slate-600 peer-checked:text-blue-700">Teacher</span>
                </div>
              </label>
              <label className="cursor-pointer">
                <input type="radio" name="role" value="admin" checked={role === 'admin'} onChange={() => setRole('admin')} className="peer sr-only" />
                <div className="p-3 border rounded-lg text-center peer-checked:border-purple-500 peer-checked:bg-purple-50 hover:bg-slate-50 transition-all">
                  <Shield className="w-6 h-6 mx-auto mb-1 text-slate-400 peer-checked:text-purple-600" />
                  <span className="text-sm font-medium text-slate-600 peer-checked:text-purple-700">Admin</span>
                </div>
              </label>
            </div>
          </div>

          {/* 👇 NEW: Subject Specialization for Edit */}
          {role === 'teacher' && (
            <div className="animate-in slide-in-from-top-2 fade-in duration-300">
              <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Subject Specialization</label>
              <select 
                name="specialization" 
                defaultValue={staff.specialization} 
                className="w-full p-2.5 border rounded-lg bg-white outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Subject...</option>
                {subjects?.map((s: any) => (
                  <option key={s.name} value={s.name}>{s.name}</option>
                ))}
              </select>
            </div>
          )}

          <div className="pt-2">
            <button disabled={isSaving} className="w-full py-2.5 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2">
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}