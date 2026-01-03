'use client'

import { deleteSubject } from '../actions'
import { Trash2, Loader2, AlertTriangle, Pencil, User } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import EditSubjectModal from './EditSubjectModal'

// 👇 Props updated
export default function SubjectList({ subjects, teachers, isAdmin }: { subjects: any[], teachers: any[], isAdmin: boolean }) {
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [editingSubject, setEditingSubject] = useState<any>(null)
  const [isProcessing, setIsProcessing] = useState(false)

  const confirmDelete = async () => {
    if (!deletingId) return
    setIsProcessing(true)
    const result = await deleteSubject(deletingId)
    if (result && result.success) {
      toast.success(result.message)
      setDeletingId(null)
    } else {
      toast.error(result?.message || "Failed")
    }
    setIsProcessing(false)
  }

  return (
    <>
      <div className="divide-y divide-slate-100">
        {subjects?.map((subject) => (
          <div key={subject.id} className="p-4 flex items-center justify-between hover:bg-slate-50 group transition-colors">
            <div className="flex items-center gap-4">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-sm ${
                subject.is_compulsory ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-600'
              }`}>
                {subject.code}
              </div>
              <div>
                <p className="font-bold text-slate-900">{subject.name}</p>
                <div className="flex gap-3 text-xs items-center mt-1">
                   <span className="text-slate-500 bg-slate-100 px-1.5 rounded">{subject.category || 'All'}</span>
                   {subject.profiles && (
                     <span className="flex items-center gap-1 text-blue-600 font-medium">
                       <User className="w-3 h-3" />
                       {subject.profiles.first_name} {subject.profiles.last_name}
                     </span>
                   )}
                </div>
              </div>
            </div>

            {isAdmin && (
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button 
                  onClick={() => setEditingSubject(subject)}
                  className="p-2 text-slate-300 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  title="Edit Subject"
                >
                  <Pencil className="w-5 h-5" />
                </button>
                <button 
                  onClick={() => setDeletingId(subject.id)}
                  className="p-2 text-slate-300 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="Delete Subject"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {deletingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
           <div className="bg-white rounded-xl shadow-xl max-w-sm w-full p-6 text-center">
              <h3 className="font-bold text-lg mb-2">Delete Subject?</h3>
              <div className="flex gap-3 mt-6">
                 <button onClick={() => setDeletingId(null)} className="flex-1 py-2 border rounded-lg">Cancel</button>
                 <button onClick={confirmDelete} className="flex-1 py-2 bg-red-600 text-white rounded-lg">
                   {isProcessing ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : 'Delete'}
                 </button>
              </div>
           </div>
        </div>
      )}

      {editingSubject && (
        <EditSubjectModal 
          subject={editingSubject} 
          teachers={teachers} // 👈 Pass teachers
          onClose={() => setEditingSubject(null)} 
        />
      )}
    </>
  )
}