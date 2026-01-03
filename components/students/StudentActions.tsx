'use client'

import { useState } from 'react'
import { MoreVertical, Pencil, Trash2, X } from 'lucide-react'
import Link from 'next/link'
import { deleteStudent } from '@/app/(portal)/students/actions'

export default function StudentActions({ studentId, profileId }: { studentId: string, profileId: string }) {
  const [isOpen, setIsOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this student? This action cannot be undone.')) {
      setIsDeleting(true)
      await deleteStudent(studentId, profileId)
      setIsOpen(false)
      setIsDeleting(false)
      // Optional: Force a page reload if the server action revalidate feels slow
      // window.location.reload()
    }
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
          {/* Backdrop to close when clicking outside */}
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)}></div>
          
          <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-slate-100 z-20 overflow-hidden">
            <Link 
              href={`/students/${studentId}/edit`}
              className="flex items-center gap-2 px-4 py-3 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
            >
              <Pencil className="w-4 h-4" /> Edit Details
            </Link>
            
            <button 
              onClick={handleDelete}
              disabled={isDeleting}
              className="w-full flex items-center gap-2 px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors text-left"
            >
              {isDeleting ? (
                <span className="w-4 h-4 animate-spin border-2 border-red-600 border-t-transparent rounded-full"></span>
              ) : (
                <Trash2 className="w-4 h-4" />
              )}
              {isDeleting ? 'Deleting...' : 'Delete Student'}
            </button>
          </div>
        </>
      )}
    </div>
  )
}