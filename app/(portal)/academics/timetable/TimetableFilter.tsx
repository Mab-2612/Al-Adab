'use client'

import { useRouter, useSearchParams } from 'next/navigation'

export default function TimetableFilter({ classes }: { classes: any[] }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const currentClassId = searchParams.get('classId') || ''

  const handleChange = (classId: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (classId) {
      params.set('classId', classId)
    } else {
      params.delete('classId')
    }
    router.push(`/academics/timetable?${params.toString()}`)
  }

  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
      <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Select Class</label>
      <select 
        value={currentClassId}
        onChange={(e) => handleChange(e.target.value)}
        className="w-full p-2.5 border rounded-lg bg-slate-50 outline-none focus:ring-2 focus:ring-indigo-500"
      >
        <option value="">Choose Class...</option>
        {classes.map((c) => (
          <option key={c.id} value={c.id}>{c.name}</option>
        ))}
      </select>
    </div>
  )
}