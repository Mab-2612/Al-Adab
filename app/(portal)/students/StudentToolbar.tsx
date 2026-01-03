'use client'

import { Search, Filter, FileDown } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useDebouncedCallback } from 'use-debounce'

export default function StudentToolbar({ classes }: { classes: any[] }) {
  const searchParams = useSearchParams()
  const { replace } = useRouter()

  // Handle Search (Debounced to prevent spamming server on every keystroke)
  const handleSearch = useDebouncedCallback((term: string) => {
    const params = new URLSearchParams(searchParams)
    if (term) {
      params.set('q', term)
    } else {
      params.delete('q')
    }
    replace(`/students?${params.toString()}`)
  }, 300)

  // Handle Class Filter
  const handleClassFilter = (classId: string) => {
    const params = new URLSearchParams(searchParams)
    if (classId) {
      params.set('classId', classId)
    } else {
      params.delete('classId')
    }
    replace(`/students?${params.toString()}`)
  }

  return (
    <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col md:flex-row gap-4 justify-between">
      
      {/* Search Input */}
      <div className="relative flex-1 max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
        <input 
          type="text" 
          placeholder="Search by name or admission number..." 
          defaultValue={searchParams.get('q')?.toString()}
          onChange={(e) => handleSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 focus:bg-white transition-colors"
        />
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2">
        
        {/* Class Filter Dropdown */}
        <div className="relative">
          <select 
            onChange={(e) => handleClassFilter(e.target.value)}
            defaultValue={searchParams.get('classId')?.toString()}
            className="appearance-none px-4 py-2.5 border border-slate-200 rounded-lg bg-white hover:bg-slate-50 text-slate-700 font-medium pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
          >
            <option value="">All Classes</option>
            {classes.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          <Filter className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
        </div>

        {/* Export Button (Placeholder for now) */}
        <button className="px-4 py-2.5 border border-slate-200 rounded-lg flex items-center gap-2 hover:bg-slate-50 text-slate-700 font-medium transition-colors">
          <FileDown className="w-4 h-4" /> 
          <span className="hidden sm:inline">Export</span>
        </button>
      </div>
    </div>
  )
}