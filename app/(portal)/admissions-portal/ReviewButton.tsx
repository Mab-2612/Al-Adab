'use client'

import { approveApplication, rejectApplication } from './actions'
import { Check, X, Loader2 } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

export default function ReviewButton({ application }: { application: any }) {
  const [loading, setLoading] = useState<'approve' | 'reject' | null>(null)

  const handleApprove = async () => {
    if (!confirm(`Approve ${application.first_name} into ${application.classes?.name}?`)) return
    
    setLoading('approve')
    const result = await approveApplication(application.id)
    setLoading(null)

    if (result && result.success) {
      toast.success(result.message)
    } else {
      toast.error(result?.error || 'Failed to approve')
    }
  }

  const handleReject = async () => {
    if (!confirm('Are you sure you want to REJECT this application?')) return

    setLoading('reject')
    const result = await rejectApplication(application.id)
    setLoading(null)

    if (result && result.success) {
      toast.success('Application rejected.')
    } else {
      toast.error(result?.error || 'Failed to reject')
    }
  }

  return (
    <div className="flex gap-3">
      <button 
        onClick={handleReject}
        disabled={!!loading}
        className="flex-1 py-2 rounded-lg border border-slate-300 text-slate-700 font-medium hover:bg-red-50 hover:text-red-700 hover:border-red-200 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
      >
        {loading === 'reject' ? <Loader2 className="w-4 h-4 animate-spin" /> : <X className="w-4 h-4" />}
        Reject
      </button>
      
      <button 
        onClick={handleApprove}
        disabled={!!loading}
        className="flex-1 py-2 rounded-lg bg-slate-900 text-white font-medium hover:bg-green-600 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
      >
        {loading === 'approve' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
        Approve
      </button>
    </div>
  )
}