'use client'

import { createFee, deleteFee } from '../actions'
import { Save, Tag, Loader2, Pencil, Trash2, AlertTriangle } from 'lucide-react'
import { useState, useRef } from 'react'
import { toast } from 'sonner'
import EditFeeModal from './EditFeeModal'

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(amount)
}

export default function FeeManager({ classes, fees }: { classes: any[], fees: any[] }) {
  const [isCreating, setIsCreating] = useState(false)
  const [editingFee, setEditingFee] = useState<any>(null)
  
  // Custom Delete Modal State
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  
  const formRef = useRef<HTMLFormElement>(null)

  const handleCreate = async (formData: FormData) => {
    setIsCreating(true)
    const res = await createFee(formData)
    setIsCreating(false)

    if (res?.success) {
      toast.success('Fee added successfully')
      formRef.current?.reset()
    } else {
      toast.error(res?.error)
    }
  }

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
    <div className="grid lg:grid-cols-3 gap-8">
      
      {/* LEFT: Create Fee Form */}
      <div className="lg:col-span-1">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 sticky top-24">
          <h2 className="font-bold text-slate-900 mb-6 flex items-center gap-2">
            <Tag className="w-5 h-5 text-blue-600" />
            Add New Fee
          </h2>

          <form ref={formRef} action={handleCreate} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Target Class</label>
              <select name="classId" required className="w-full p-2.5 border border-slate-200 rounded-lg outline-none bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500">
                <option value="">Select Class...</option>
                {classes?.map((c: any) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Term</label>
              <select name="term" required className="w-full p-2.5 border border-slate-200 rounded-lg outline-none bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500">
                <option value="1st Term">1st Term</option>
                <option value="2nd Term">2nd Term</option>
                <option value="3rd Term">3rd Term</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Amount (₦)</label>
              <input name="amount" type="number" required placeholder="e.g. 50000" className="w-full p-2.5 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 font-mono" />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
              <input name="description" type="text" required placeholder="e.g. Tuition" className="w-full p-2.5 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" />
            </div>

            <button disabled={isCreating} className="w-full py-2.5 bg-slate-900 text-white rounded-lg font-medium hover:bg-slate-800 transition-colors flex items-center justify-center gap-2 mt-4 disabled:opacity-50">
              {isCreating ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Save className="w-4 h-4" /> Save Fee</>}
            </button>
          </form>
        </div>
      </div>

      {/* RIGHT: Existing Fees List */}
      <div className="lg:col-span-2 space-y-4">
        <h2 className="font-bold text-slate-900 mb-2">Active Fee Structures</h2>
        
        {fees?.map((fee: any) => (
          <div key={fee.id} className="bg-white rounded-xl p-5 shadow-sm border border-slate-200 flex items-center justify-between group hover:border-blue-400 transition-colors">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <span className="font-bold text-slate-900 text-lg">{fee.classes?.name}</span>
                <span className="px-2 py-0.5 rounded text-xs font-bold bg-blue-50 text-blue-700 border border-blue-100">{fee.term}</span>
              </div>
              <p className="text-slate-500 text-sm">{fee.description}</p>
            </div>
            
            <div className="text-right flex items-center gap-4">
              <div>
                 <p className="font-bold text-slate-900 text-lg">{formatCurrency(fee.amount)}</p>
                 <p className="text-xs text-slate-400">per student</p>
              </div>

              {/* ACTION BUTTONS */}
              <div className="flex gap-1 items-center bg-slate-50 p-1 rounded-lg border border-slate-100">
                <button 
                  onClick={() => setEditingFee(fee)}
                  className="p-2 text-slate-400 hover:text-blue-600 hover:bg-white rounded-md transition-all"
                  title="Edit Fee"
                >
                  <Pencil className="w-4 h-4" />
                </button>
                <div className="w-px h-4 bg-slate-200"></div>
                <button 
                  onClick={() => setDeletingId(fee.id)}
                  className="p-2 text-slate-400 hover:text-red-600 hover:bg-white rounded-md transition-all"
                  title="Delete Fee"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}

        {(!fees || fees.length === 0) && (
          <div className="text-center py-12 bg-slate-50 rounded-xl border border-dashed border-slate-300">
            <p className="text-slate-500">No fees set for this session yet.</p>
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

      {/* Custom Delete Modal */}
      {deletingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-xl shadow-xl max-w-sm w-full overflow-hidden p-6 text-center">
            <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Delete Fee?</h3>
            <p className="text-slate-500 text-sm mb-6">Are you sure you want to remove this fee structure? This cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeletingId(null)} disabled={isDeleting} className="flex-1 py-2 border border-slate-200 rounded-lg text-sm font-bold text-slate-600 hover:bg-slate-50">Cancel</button>
              <button onClick={confirmDelete} disabled={isDeleting} className="flex-1 py-2 bg-red-600 text-white rounded-lg text-sm font-bold hover:bg-red-700 flex items-center justify-center gap-2">
                {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Yes, Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}