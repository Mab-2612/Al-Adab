'use client'

import { generateStudentLogin } from '../../actions'
import { Loader2, RefreshCcw, X } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

export default function ResetLoginModal({ 
  studentId, 
  profileId, 
  admissionNumber, 
  onClose,
  onSuccess 
}: { 
  studentId: string, 
  profileId: string, 
  admissionNumber: string, 
  onClose: () => void,
  onSuccess: (email: string) => void
}) {
  const [isProcessing, setIsProcessing] = useState(false)

  const handleReset = async () => {
    setIsProcessing(true)
    const res = await generateStudentLogin(studentId, profileId, admissionNumber)
    setIsProcessing(false)

    if (res?.success) {
      toast.success(res.message)
      onClose()
    } else {
      toast.error(res?.error)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full overflow-hidden">
        
        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
           <h3 className="font-bold text-slate-800 flex items-center gap-2">
             Reset Password
           </h3>
           <button onClick={onClose} className="p-1 hover:bg-slate-200 rounded-full text-slate-500">
             <X className="w-5 h-5" />
           </button>
        </div>

        <div className="p-6 text-center">
          <div className="w-16 h-16 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <RefreshCcw className="w-8 h-8" />
          </div>
          
          <h3 className="text-lg font-bold text-slate-900 mb-2">Reset to Default?</h3>
          
          <p className="text-slate-500 text-sm mb-6 leading-relaxed">
            This will reset the student's password to <strong>password123</strong>. Their login email will remain unchanged.
          </p>

          <div className="flex gap-3">
            <button 
              onClick={onClose} 
              disabled={isProcessing}
              className="flex-1 py-2.5 border border-slate-300 text-slate-700 rounded-lg font-bold hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button 
              onClick={handleReset}
              disabled={isProcessing}
              className="flex-1 py-2.5 bg-purple-600 text-white rounded-lg font-bold hover:bg-purple-700 flex items-center justify-center gap-2 transition-colors shadow-sm"
            >
              {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Confirm Reset'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}