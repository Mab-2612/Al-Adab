'use client'

import { useState } from 'react'
import { MoreVertical, Pencil, Trash2, Loader2, AlertTriangle } from 'lucide-react'
import Link from 'next/link'
import { deleteStudent } from '@/app/(portal)/students/actions'
import { toast } from 'sonner'

export default function StudentActions({ studentId, profileId }: { studentId: string, profileId: string }) {
  const [isOpen, setIsOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const handleDelete = async () => {
    setIsDeleting(true)
    const res = await deleteStudent(studentId, profileId)
    setIsDeleting(false)

    if (res?.success) {
      toast.success(res.message)
      setShowConfirm(false)
      setIsOpen(false)
    } else {
      toast.error(res?.error || 'Failed to delete student')
    }
  }

  // If showing confirmation modal
  if (showConfirm) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
        <div className="bg-white rounded-xl shadow-xl max-w-sm w-full overflow-hidden p-6 text-center">
          <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-2">Delete Student?</h3>
          <p className="text-slate-500 text-sm mb-6">
            This will remove the student record and login access. This cannot be undone.
          </p>
          <div className="flex gap-3">
            <button 
              onClick={() => { setShowConfirm(false); setIsOpen(false); }}
              disabled={isDeleting}
              className="flex-1 py-2.5 border border-slate-300 text-slate-700 font-bold rounded-lg hover:bg-slate-50"
            >
              Cancel
            </button>
            <button 
              onClick={handleDelete}
              disabled={isDeleting}
              className="flex-1 py-2.5 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 flex items-center justify-center gap-2"
            >
              {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Yes, Delete'}
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)} 
        className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
      >
        <MoreVertical className="w-5 h-5" />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)}></div>
          
          <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-slate-100 z-20 overflow-hidden">
            <Link 
              href={`/students/${studentId}/edit`}
              className="flex items-center gap-2 px-4 py-3 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
            >
              <Pencil className="w-4 h-4" /> Edit Details
            </Link>
            
            <button 
              onClick={() => setShowConfirm(true)}
              className="w-full flex items-center gap-2 px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors text-left"
            >
              <Trash2 className="w-4 h-4" /> Delete Student
            </button>
          </div>
        </>
      )}
    </div>
  )
}