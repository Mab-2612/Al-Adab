'use client'

import { Filter, X } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'

export default function SubjectToolbar() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const level = searchParams.get('level') || ''
  const dept = searchParams.get('dept') || ''

  const handleFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value) {
      params.set(key, value)
    } else {
      params.delete(key)
    }
    router.replace(`?${params.toString()}`)
  }

  const clearFilters = () => {
    router.replace('/academics/subjects')
  }

  const hasFilters = level || dept

  return (
    <div className="bg-slate-50 border-b border-slate-100 p-4 flex flex-wrap items-center gap-3">
      <div className="flex items-center gap-2 text-slate-500 font-bold text-xs uppercase mr-2">
        <Filter className="w-4 h-4" /> Filters:
      </div>

      {/* Level Filter */}
      <select 
        value={level}
        onChange={(e) => handleFilter('level', e.target.value)}
        className="px-3 py-1.5 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500 bg-white shadow-sm"
      >
        <option value="">All Levels</option>
        <option value="Junior">Junior Secondary</option>
        <option value="Senior">Senior Secondary</option>
      </select>

      {/* Department Filter (Only relevant if Senior or All) */}
      <select 
        value={dept}
        onChange={(e) => handleFilter('dept', e.target.value)}
        disabled={level === 'Junior'} // Juniors don't have depts usually
        className="px-3 py-1.5 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500 bg-white shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <option value="">All Departments</option>
        <option value="General">General</option>
        <option value="Science">Science</option>
        <option value="Arts">Arts</option>
        <option value="Commercial">Commercial</option>
      </select>

      {/* Clear Button */}
      {hasFilters && (
        <button 
          onClick={clearFilters}
          className="text-xs text-slate-400 hover:text-red-500 flex items-center gap-1 ml-auto"
        >
          <X className="w-3 h-3" /> Clear
        </button>
      )}
    </div>
  )
}