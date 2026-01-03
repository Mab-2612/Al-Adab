'use client'

import { updateFee, deleteFee } from '../actions'
import { Loader2, X, Trash2, CheckCircle, AlertTriangle } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

export default function EditFeeModal({ fee, classes, onClose }: { fee: any, classes: any[], onClose: () => void }) {
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  // 1. Handle Update
  const handleUpdate = async (formData: FormData) => {
    setIsSaving(true)
    const res = await updateFee(fee.id, formData)
    setIsSaving(false)

    if (res?.success) {
      toast.success('Fee updated successfully')
      onClose()
    } else {
      toast.error(res?.error || 'Update failed')
    }
  }

  // 2. Handle Delete
  const handleDelete = async () => {
    setIsDeleting(true)
    const res = await deleteFee(fee.id)
    setIsDeleting(false)

    if (res?.success) {
      toast.success('Fee deleted successfully')
      onClose()
    } else {
      toast.error(res?.error)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full overflow-hidden flex flex-col max-h-[90vh]">
        
        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
           <h3 className="font-bold text-slate-800 flex items-center gap-2">
             Edit Fee Structure
           </h3>
           <button onClick={onClose} className="p-1 hover:bg-slate-200 rounded-full text-slate-500">
             <X className="w-5 h-5" />
           </button>
        </div>
        
        {/* Toggle between Edit Form and Delete Confirmation */}
        {!showDeleteConfirm ? (
          <div className="overflow-y-auto p-6 space-y-6">
            <form action={handleUpdate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Target Class</label>
                <select name="classId" defaultValue={fee.class_id} required className="w-full p-2.5 border border-slate-200 rounded-lg outline-none bg-white focus:ring-2 focus:ring-blue-500">
                  {classes?.map((c: any) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Term</label>
                <select name="term" defaultValue={fee.term} required className="w-full p-2.5 border border-slate-200 rounded-lg outline-none bg-white focus:ring-2 focus:ring-blue-500">
                  <option value="1st Term">1st Term</option>
                  <option value="2nd Term">2nd Term</option>
                  <option value="3rd Term">3rd Term</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Amount (₦)</label>
                <input name="amount" type="number" defaultValue={fee.amount} required className="w-full p-2.5 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 font-mono" />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                <input name="description" type="text" defaultValue={fee.description} required className="w-full p-2.5 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" />
              </div>

              <button 
                type="submit"
                disabled={isSaving} 
                className="w-full py-2.5 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2 transition-colors shadow-sm mt-2"
              >
                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <><CheckCircle className="w-4 h-4"/> Update Fee</>}
              </button>
            </form>

            {/* DANGER ZONE */}
            <div className="pt-6 border-t border-slate-100">
              <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-100">
                <span className="text-xs text-red-700 font-medium">Delete this fee?</span>
                <button 
                  type="button"
                  onClick={() => setShowDeleteConfirm(true)}
                  className="px-3 py-1.5 bg-white border border-red-200 text-red-600 rounded-md text-xs font-bold hover:bg-red-50 transition-colors flex items-center gap-1"
                >
                  <Trash2 className="w-3 h-3" /> Delete
                </button>
              </div>
            </div>
          </div>
        ) : (
          // CONFIRMATION VIEW
          <div className="p-8 text-center animate-in fade-in zoom-in duration-200">
            <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Are you sure?</h3>
            <p className="text-slate-500 mb-8 text-sm">
              Do you really want to delete this fee structure? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button 
                onClick={() => setShowDeleteConfirm(false)}
                disabled={isDeleting}
                className="flex-1 py-2.5 border border-slate-300 text-slate-700 rounded-lg font-bold hover:bg-slate-50"
              >
                Cancel
              </button>
              <button 
                onClick={handleDelete}
                disabled={isDeleting}
                className="flex-1 py-2.5 bg-red-600 text-white rounded-lg font-bold hover:bg-red-700 flex items-center justify-center gap-2"
              >
                {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Yes, Delete'}
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}