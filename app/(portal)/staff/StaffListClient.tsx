'use client'

import { useState } from 'react'
import { Plus, Trash2, Mail, Phone, Pencil, AlertTriangle, Loader2, ShieldCheck, Crown } from 'lucide-react'
import { deleteStaff } from './actions'
import AddStaffModal from './AddStaffModal'
import EditStaffModal from './EditStaffModal'
import { toast } from 'sonner'

export default function StaffListClient({ 
  staff, 
  currentUserId,
  currentUserRole,
  subjects 
}: { 
  staff: any[], 
  currentUserId: string,
  currentUserRole: string,
  subjects: any[] 
}) {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [editingStaff, setEditingStaff] = useState<any>(null)
  
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const confirmDelete = async () => {
    if (!deletingId) return
    setIsDeleting(true)
    const res = await deleteStaff(deletingId)
    setIsDeleting(false)
    if (res?.success) {
      toast.success(res.message)
      setDeletingId(null)
    } else {
      toast.error(res?.error || 'Failed to delete.')
    }
  }

  // Determine permissions
  const isSuperAdmin = currentUserRole === 'admin'

  return (
    <>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* Add Button - DYNAMIC TEXT */}
        <button 
          onClick={() => setIsAddModalOpen(true)}
          className="border-2 border-dashed border-slate-300 rounded-xl flex flex-col items-center justify-center p-8 hover:border-blue-500 hover:bg-blue-50/50 transition-all group min-h-[200px] cursor-pointer select-none"
        >
          <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
            <Plus className="w-6 h-6" />
          </div>
          <p className="font-bold text-slate-700">Add New Staff</p>
          {/* 👇 UPDATED: Text changes based on role */}
          <p className="text-xs text-slate-400 mt-1">
            {isSuperAdmin ? 'Teacher, Admin or Principal' : 'Teacher Account'}
          </p>
        </button>

        {/* Staff Cards */}
        {staff.map((member) => {
          const isMe = member.id === currentUserId;
          const isPrincipal = member.role === 'principal';
          const isAdmin = member.role === 'admin';

          return (
            <div key={member.id} className={`p-6 rounded-xl border shadow-sm relative group transition-colors flex flex-col justify-between cursor-default select-none ${
              isMe ? 'bg-blue-50/50 border-blue-200 ring-1 ring-blue-200' : 'bg-white border-slate-200 hover:border-blue-300'
            }`}>
              <div>
                <div className="flex justify-between items-start mb-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white shadow-sm ${
                    isAdmin ? 'bg-purple-600' : isPrincipal ? 'bg-orange-600' : 'bg-blue-600'
                  }`}>
                    {isAdmin ? <ShieldCheck className="w-5 h-5"/> : isPrincipal ? <Crown className="w-5 h-5"/> : member.first_name?.[0]}
                  </div>
                  
                  {isMe ? (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide border bg-blue-100 text-blue-700 border-blue-200 shadow-sm">
                      You
                    </span>
                  ) : (
                    <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wide border ${
                      isAdmin
                        ? 'bg-purple-50 text-purple-700 border-purple-100'
                        : isPrincipal
                        ? 'bg-orange-50 text-orange-700 border-orange-100'
                        : 'bg-slate-100 text-slate-600 border-slate-200'
                    }`}>
                      {member.role === 'admin' ? 'Super Admin' : member.role}
                    </span>
                  )}
                </div>

                <h3 className="font-bold text-slate-900 text-lg mb-1 cursor-text select-text">
                  {member.first_name} {member.last_name}
                </h3>
                <p className="text-xs text-slate-400 font-mono mb-1 truncate cursor-text select-text">
                  {member.email}
                </p>
                {member.role === 'teacher' && member.specialization && (
                  <span className="inline-block px-2 py-0.5 rounded bg-blue-50 text-blue-600 text-[10px] font-bold border border-blue-100 mb-3">
                    {member.specialization} Teacher
                  </span>
                )}
                
                <div className="space-y-2 pt-2 border-t border-slate-100/50">
                  <div className="flex items-center gap-2 text-sm text-slate-500">
                    <Phone className="w-3.5 h-3.5" />
                    <span>{member.phone_number || 'No phone'}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className={`mt-6 pt-4 border-t border-slate-100 flex gap-3 transition-opacity ${isMe ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                 <button 
                   onClick={() => setEditingStaff(member)}
                   className="flex-1 py-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors flex items-center justify-center gap-2 text-xs font-bold bg-white border border-slate-200 cursor-pointer"
                 >
                   <Pencil className="w-3 h-3" /> Edit
                 </button>
                 
                 {/* Only show Delete if it's NOT me */}
                 {!isMe && (
                   <button 
                     onClick={() => setDeletingId(member.id)}
                     className="flex-1 py-2 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors flex items-center justify-center gap-2 text-xs font-bold bg-white border border-slate-200 cursor-pointer"
                   >
                     <Trash2 className="w-3 h-3" /> Remove
                   </button>
                 )}
              </div>
            </div>
          )
        })}
      </div>

      {isAddModalOpen && (
        <AddStaffModal 
          onClose={() => setIsAddModalOpen(false)} 
          subjects={subjects} 
          currentUserRole={currentUserRole} 
        />
      )}
      
      {editingStaff && (
        <EditStaffModal 
          staff={editingStaff} 
          onClose={() => setEditingStaff(null)} 
          subjects={subjects}
          currentUserRole={currentUserRole}
        />
      )}

      {/* Delete Modal */}
      {deletingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-xl shadow-xl max-w-sm w-full overflow-hidden">
            <div className="p-6 text-center">
              <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Remove Staff Member?</h3>
              <p className="text-slate-500 text-sm leading-relaxed">
                This will permanently delete this account. This action cannot be undone.
              </p>
            </div>
            <div className="bg-slate-50 p-4 flex gap-3">
              <button onClick={() => setDeletingId(null)} disabled={isDeleting} className="flex-1 py-2.5 bg-white border border-slate-300 text-slate-700 font-medium rounded-lg hover:bg-slate-50 transition-colors cursor-pointer">Cancel</button>
              <button onClick={confirmDelete} disabled={isDeleting} className="flex-1 py-2.5 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 flex items-center justify-center gap-2 transition-colors shadow-sm cursor-pointer">
                {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Yes, Remove'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}