'use client'

import { useRouter, useSearchParams } from 'next/navigation'

export default function ResultFilters({ classes, subjects }: { classes: any[], subjects: any[] }) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const currentClassId = searchParams.get('classId') || ''
  const currentSubjectId = searchParams.get('subjectId') || ''

  const handleFilterChange = (key: string, value: string) => {
    // 1. Create a new URLSearchParams object based on current params
    const params = new URLSearchParams(searchParams.toString())
    
    // 2. Update the specific key
    if (value) {
      params.set(key, value)
    } else {
      params.delete(key)
    }

    // 3. Push the new URL (this triggers the Server Component to re-fetch data)
    router.push(`/results/upload?${params.toString()}`)
  }

  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm sticky top-24">
      <h3 className="font-bold text-slate-900 mb-4">Select Context</h3>
      
      <div className="space-y-4">
        <div>
          <label className="text-xs font-bold text-slate-500 uppercase">Class</label>
          <select 
            value={currentClassId}
            className="w-full mt-1 p-2 border rounded-lg bg-slate-50 outline-none focus:ring-2 focus:ring-blue-500"
            onChange={(e) => handleFilterChange('classId', e.target.value)}
          >
            <option value="">Select Class...</option>
            {classes?.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-xs font-bold text-slate-500 uppercase">Subject</label>
          <select 
            value={currentSubjectId}
            className="w-full mt-1 p-2 border rounded-lg bg-slate-50 outline-none focus:ring-2 focus:ring-blue-500"
            onChange={(e) => handleFilterChange('subjectId', e.target.value)}
          >
            <option value="">Select Subject...</option>
            {subjects?.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  )
}