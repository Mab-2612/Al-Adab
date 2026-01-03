'use client'

import { Pencil, Trash2, AlertTriangle, Loader2 } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { deleteFee } from './actions'
import EditFeeModal from './fees/EditFeeModal'

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(amount)
}

export default function InteractiveFeeList({ fees, classes }: { fees: any[], classes: any[] }) {
  const [editingFee, setEditingFee] = useState<any>(null)
  
  // Custom Delete Modal State
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const confirmDelete = async () => {
    if (!deletingId) return
    setIsDeleting(true)
    const res = await deleteFee(deletingId)
    setIsDeleting(false)

    if (res?.success) {
      toast.success('Fee deleted successfully')
      setDeletingId(null)
    } else {
      toast.error(res?.error)
    }
  }

  return (
    <>
      <div className="divide-y divide-slate-100">
        {fees?.map((fee) => (
          <div key={fee.id} className="p-4 flex items-center justify-between group hover:bg-slate-50 transition-colors">
            
            {/* Info */}
            <div>
              <div className="flex items-center gap-3 mb-1">
                <span className="font-bold text-slate-900 text-sm">{fee.classes?.name}</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-100 uppercase">
                  {fee.term}
                </span>
              </div>
              <p className="text-xs text-slate-500">{fee.description}</p>
            </div>
            
            {/* Actions */}
            <div className="flex items-center gap-4">
              <p className="font-bold text-slate-900 text-sm">{formatCurrency(fee.amount)}</p>
              
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button 
                  onClick={() => setEditingFee(fee)}
                  className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-white rounded-md transition-all shadow-sm border border-transparent hover:border-slate-200"
                  title="Edit Fee"
                >
                  <Pencil className="w-3.5 h-3.5" />
                </button>
                {/* Trigger Custom Modal */}
                <button 
                  onClick={() => setDeletingId(fee.id)}
                  className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-white rounded-md transition-all shadow-sm border border-transparent hover:border-slate-200"
                  title="Delete Fee"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

          </div>
        ))}

        {(!fees || fees.length === 0) && (
          <div className="p-8 text-center text-slate-500 text-sm">
            No fees configured.
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {editingFee && (
        <EditFeeModal 
          key={editingFee.id} 
          fee={editingFee} 
          classes={classes} 
          onClose={() => setEditingFee(null)} 
        />
      )}

      {/* Custom Delete Modal (Dashboard Version) */}
      {deletingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-xl shadow-xl max-w-sm w-full overflow-hidden p-6 text-center">
            <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Delete Fee?</h3>
            <p className="text-slate-500 text-sm mb-6">Are you sure you want to remove this fee structure? This cannot be undone.</p>
            <div className="flex gap-3">
              <button 
                onClick={() => setDeletingId(null)}
                disabled={isDeleting}
                className="flex-1 py-2 border border-slate-200 rounded-lg text-sm font-bold text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button 
                onClick={confirmDelete}
                disabled={isDeleting}
                className="flex-1 py-2 bg-red-600 text-white rounded-lg text-sm font-bold hover:bg-red-700 flex items-center justify-center gap-2"
              >
                {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Yes, Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}