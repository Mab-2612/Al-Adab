'use client'

import { approveApplication, rejectApplication } from './actions'
import { Check, X, Loader2, AlertTriangle, UserCheck } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

export default function ReviewButton({ application }: { application: any }) {
  const [loading, setLoading] = useState<'approve' | 'reject' | null>(null)
  
  // Modal States
  const [confirmingApprove, setConfirmingApprove] = useState(false)
  const [confirmingReject, setConfirmingReject] = useState(false)

  const handleApprove = async () => {
    setLoading('approve')
    const result = await approveApplication(application.id)
    setLoading(null)
    setConfirmingApprove(false) // Close modal

    if (result && result.success) {
      toast.success(result.message)
    } else {
      toast.error(result?.error || 'Failed to approve')
    }
  }

  const handleReject = async () => {
    setLoading('reject')
    const result = await rejectApplication(application.id)
    setLoading(null)
    setConfirmingReject(false) // Close modal

    if (result && result.success) {
      toast.success('Application rejected.')
    } else {
      toast.error(result?.error || 'Failed to reject')
    }
  }

  return (
    <>
      <div className="flex gap-3">
        <button 
          onClick={() => setConfirmingReject(true)}
          disabled={!!loading}
          className="flex-1 py-2 rounded-lg border border-slate-300 text-slate-700 font-medium hover:bg-red-50 hover:text-red-700 hover:border-red-200 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
        >
          <X className="w-4 h-4" />
          Reject
        </button>
        
        <button 
          onClick={() => setConfirmingApprove(true)}
          disabled={!!loading}
          className="flex-1 py-2 rounded-lg bg-slate-900 text-white font-medium hover:bg-green-600 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
        >
          <Check className="w-4 h-4" />
          Approve
        </button>
      </div>

      {/* APPROVE MODAL */}
      {confirmingApprove && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-xl shadow-xl max-w-sm w-full overflow-hidden p-6 text-center">
            <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
               <UserCheck className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Approve Admission?</h3>
            <p className="text-slate-500 text-sm mb-6 leading-relaxed">
              This will create a student account for <strong>{application.first_name}</strong> and assign them to <strong>{application.classes?.name || 'Class'}</strong>.
            </p>
            <div className="flex gap-3">
               <button 
                 onClick={() => setConfirmingApprove(false)}
                 disabled={!!loading}
                 className="flex-1 py-2.5 border border-slate-300 text-slate-700 rounded-lg font-bold hover:bg-slate-50"
               >
                 Cancel
               </button>
               <button 
                 onClick={handleApprove}
                 disabled={!!loading}
                 className="flex-1 py-2.5 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700 flex items-center justify-center gap-2 shadow-lg shadow-green-600/20"
               >
                 {loading === 'approve' ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Confirm'}
               </button>
            </div>
          </div>
        </div>
      )}

      {/* REJECT MODAL */}
      {confirmingReject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-xl shadow-xl max-w-sm w-full overflow-hidden p-6 text-center">
            <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
               <AlertTriangle className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Reject Application?</h3>
            <p className="text-slate-500 text-sm mb-6 leading-relaxed">
              Are you sure you want to reject this application? This action cannot be undone.
            </p>
            <div className="flex gap-3">
               <button 
                 onClick={() => setConfirmingReject(false)}
                 disabled={!!loading}
                 className="flex-1 py-2.5 border border-slate-300 text-slate-700 rounded-lg font-bold hover:bg-slate-50"
               >
                 Cancel
               </button>
               <button 
                 onClick={handleReject}
                 disabled={!!loading}
                 className="flex-1 py-2.5 bg-red-600 text-white rounded-lg font-bold hover:bg-red-700 flex items-center justify-center gap-2 shadow-lg shadow-red-600/20"
               >
                 {loading === 'reject' ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Yes, Reject'}
               </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}