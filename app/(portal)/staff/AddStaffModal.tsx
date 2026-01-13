'use client'

import { createStaff } from './actions'
import { UserPlus, Loader2, X, Shield, GraduationCap, Crown } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import SubjectSelector from './SubjectSelector'

export default function AddStaffModal({ onClose, subjects, currentUserRole }: { onClose: () => void, subjects: any[], currentUserRole: string }) {
  const [isSaving, setIsSaving] = useState(false)
  const [role, setRole] = useState('teacher')

  const handleSubmit = async (formData: FormData) => {
    setIsSaving(true)
    const res = await createStaff(formData)
    setIsSaving(false)
    if (res?.success) {
      toast.success(res.message)
      onClose()
    } else {
      toast.error(res?.error)
    }
  }

  // Only 'admin' role (Super Admin) can create Principals or Admins
  const isSuperAdmin = currentUserRole === 'admin'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full overflow-hidden flex flex-col max-h-[90vh]">
        
        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
           <h3 className="font-bold text-slate-800 flex items-center gap-2">
             <UserPlus className="w-5 h-5 text-blue-600" /> New Staff Member
           </h3>
           <button onClick={onClose} className="p-1 hover:bg-slate-200 rounded-full text-slate-500">
             <X className="w-5 h-5" />
           </button>
        </div>
        
        <div className="overflow-y-auto p-6">
          <form action={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">First Name</label>
                <input name="firstName" required className="w-full p-2.5 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" placeholder="e.g. Sodiq" />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Last Name</label>
                <input name="lastName" required className="w-full p-2.5 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" placeholder="e.g. Waliu" />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Email (Login ID)</label>
              <input name="email" type="email" required className="w-full p-2.5 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" placeholder="teacher@aladab.com" />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Phone Number</label>
              <input name="phone" type="tel" className="w-full p-2.5 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" placeholder="080..." />
            </div>
            
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Role</label>
              <div className={`grid gap-4 ${isSuperAdmin ? 'grid-cols-3' : 'grid-cols-1'}`}>
                
                {/* Teacher Option (Always Visible) */}
                <label className="cursor-pointer">
                  <input type="radio" name="role" value="teacher" checked={role === 'teacher'} onChange={() => setRole('teacher')} className="peer sr-only" />
                  <div className="p-2 border rounded-lg text-center peer-checked:border-blue-500 peer-checked:bg-blue-50 hover:bg-slate-50 transition-all flex flex-col items-center h-full justify-center">
                    <GraduationCap className="w-5 h-5 mb-1 text-slate-400 peer-checked:text-blue-600" />
                    <span className="text-xs font-medium text-slate-600 peer-checked:text-blue-700">Teacher</span>
                  </div>
                </label>
                
                {/* Admin/Principal Options (Super Admin Only) */}
                {isSuperAdmin && (
                  <>
                    <label className="cursor-pointer">
                      <input type="radio" name="role" value="principal" checked={role === 'principal'} onChange={() => setRole('principal')} className="peer sr-only" />
                      <div className="p-2 border rounded-lg text-center peer-checked:border-orange-500 peer-checked:bg-orange-50 hover:bg-slate-50 transition-all flex flex-col items-center h-full justify-center">
                        <Crown className="w-5 h-5 mb-1 text-slate-400 peer-checked:text-orange-600" />
                        <span className="text-xs font-medium text-slate-600 peer-checked:text-orange-700">Principal</span>
                      </div>
                    </label>

                    <label className="cursor-pointer">
                      <input type="radio" name="role" value="admin" checked={role === 'admin'} onChange={() => setRole('admin')} className="peer sr-only" />
                      <div className="p-2 border rounded-lg text-center peer-checked:border-purple-500 peer-checked:bg-purple-50 hover:bg-slate-50 transition-all flex flex-col items-center h-full justify-center">
                        <Shield className="w-5 h-5 mb-1 text-slate-400 peer-checked:text-purple-600" />
                        <span className="text-xs font-medium text-slate-600 peer-checked:text-purple-700">Admin</span>
                      </div>
                    </label>
                  </>
                )}
              </div>
            </div>

            {/* 👇 Multi-Select Subject Component */}
            {role === 'teacher' && (
              <div className="animate-in slide-in-from-top-2 fade-in duration-300">
                <SubjectSelector subjects={subjects} />
              </div>
            )}

            <div className="pt-4 border-t border-slate-100 mt-4">
              <p className="text-xs text-slate-400 text-center mb-4">Default password will be <strong>password123</strong></p>
              <button disabled={isSaving} className="w-full py-2.5 bg-slate-900 text-white rounded-lg font-bold hover:bg-slate-800 disabled:opacity-50 flex items-center justify-center gap-2 transition-colors shadow-lg">
                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Create Account'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}