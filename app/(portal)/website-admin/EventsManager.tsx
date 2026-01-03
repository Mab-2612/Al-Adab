'use client'

import { createEvent, deleteEvent } from './actions'
import { CalendarPlus, Trash2, MapPin, Loader2 } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

export default function EventsManager({ events }: { events: any[] }) {
  const [isSaving, setIsSaving] = useState(false)

  const handleCreate = async (formData: FormData) => {
    setIsSaving(true)
    const res = await createEvent(formData)
    setIsSaving(false)
    if (res?.success) toast.success(res.message)
    else toast.error(res?.error)
  }

  return (
    <div className="grid lg:grid-cols-3 gap-8">
      {/* Form */}
      <div className="lg:col-span-1">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm sticky top-24">
          <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
            <CalendarPlus className="w-5 h-5 text-purple-600" /> Add Event
          </h3>
          <form action={handleCreate} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Event Title</label>
              <input name="title" required placeholder="e.g. Entrance Exam" className="w-full p-2.5 border rounded-lg" />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Date & Time</label>
              <input name="date" type="datetime-local" required className="w-full p-2.5 border rounded-lg" />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Location</label>
              <input name="location" placeholder="e.g. School Hall" className="w-full p-2.5 border rounded-lg" />
            </div>
            <button disabled={isSaving} className="w-full py-2.5 bg-purple-600 text-white rounded-lg font-bold hover:bg-purple-700 disabled:opacity-50">
              {isSaving ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'Publish Event'}
            </button>
          </form>
        </div>
      </div>

      {/* List */}
      <div className="lg:col-span-2 space-y-4">
        {events.map((evt) => (
          <div key={evt.id} className="bg-white p-4 rounded-xl border border-slate-200 flex items-center justify-between group hover:border-purple-300 transition-colors">
            <div className="flex gap-4 items-center">
              <div className="bg-purple-50 text-purple-700 p-3 rounded-lg text-center min-w-[60px]">
                <span className="block text-xs font-bold uppercase">{new Date(evt.date).toLocaleString('default', { month: 'short' })}</span>
                <span className="block text-xl font-bold">{new Date(evt.date).getDate()}</span>
              </div>
              <div>
                <h4 className="font-bold text-slate-900">{evt.title}</h4>
                <p className="text-xs text-slate-500 flex items-center gap-1">
                  <MapPin className="w-3 h-3" /> {evt.location || 'Campus'}
                </p>
              </div>
            </div>
            <button 
              onClick={() => deleteEvent(evt.id)}
              className="p-2 text-slate-300 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        ))}
        {events.length === 0 && <div className="text-center p-8 text-slate-400">No upcoming events.</div>}
      </div>
    </div>
  )
}