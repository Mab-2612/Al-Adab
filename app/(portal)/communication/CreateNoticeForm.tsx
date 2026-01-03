'use client'

import { createNotice } from './actions'
import { Send, Loader2 } from 'lucide-react'
import { useState, useRef } from 'react'
import { toast } from 'sonner'

export default function CreateNoticeForm() {
  const [isSending, setIsSending] = useState(false)
  const formRef = useRef<HTMLFormElement>(null)

  const handleSubmit = async (formData: FormData) => {
    setIsSending(true)
    const res = await createNotice(formData)
    setIsSending(false)

    if (res?.success) {
      toast.success(res.message)
      formRef.current?.reset()
    } else {
      toast.error(res?.error)
    }
  }

  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm sticky top-24">
      <h3 className="font-bold text-slate-900 mb-4">Draft Message</h3>
      <form ref={formRef} action={handleSubmit} className="space-y-4">
        
        <div>
          <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Audience</label>
          <select name="audience" className="w-full p-2.5 border rounded-lg bg-slate-50 outline-none focus:ring-2 focus:ring-orange-500">
            <option value="all">Everyone (Public)</option>
            <option value="student">Students & Parents</option>
            <option value="staff">Staff Only</option>
          </select>
        </div>

        <div>
          <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Title</label>
          <input name="title" required placeholder="e.g. Mid-Term Break" className="w-full p-2.5 border rounded-lg outline-none focus:ring-2 focus:ring-orange-500" />
        </div>

        <div>
          <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Message</label>
          <textarea name="content" required rows={4} placeholder="Type your announcement here..." className="w-full p-2.5 border rounded-lg outline-none focus:ring-2 focus:ring-orange-500"></textarea>
        </div>

        <button disabled={isSending} className="w-full py-2.5 bg-slate-900 text-white rounded-lg font-bold hover:bg-slate-800 disabled:opacity-50 flex items-center justify-center gap-2">
          {isSending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          Post Announcement
        </button>

      </form>
    </div>
  )
}