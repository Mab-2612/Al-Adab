'use client'

import { createClient } from '@/utils/supabase/client'
import { useEffect, useState } from 'react'
import { ArrowLeft, Upload, Loader2, CheckCircle, AlertTriangle } from 'lucide-react'
import Link from 'next/link'
import { bulkCreateStudents } from '../actions'
import { toast } from 'sonner'
import SpreadsheetInput from './SpreadsheetInput'

export default function BulkUploadPage() {
  const [classes, setClasses] = useState<any[]>([])
  const [classId, setClassId] = useState('')
  const [isSenior, setIsSenior] = useState(false)
  
  const [studentData, setStudentData] = useState<any[]>([])
  
  const [isProcessing, setIsProcessing] = useState(false)
  const [results, setResults] = useState<any>(null)

  useEffect(() => {
    const supabase = createClient()
    supabase.from('classes').select('id, name, section').order('name')
      .then(({ data }) => setClasses(data || []))
  }, [])

  const handleClassChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value
    setClassId(id)
    const cls = classes.find(c => c.id === id)
    if (cls && (cls.name.includes('SSS') || cls.section?.includes('Senior'))) {
      setIsSenior(true)
    } else {
      setIsSenior(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!classId) return toast.error('Please select a class')
    
    // Filter out empty rows (where surname is empty)
    const validRows = studentData.filter(s => s.surname.trim() !== '')
    if (validRows.length === 0) return toast.error('Please enter at least one student')

    setIsProcessing(true)
    const res = await bulkCreateStudents(classId, validRows)
    setIsProcessing(false)

    if (res?.success) {
      toast.success(res.message)
      setResults(res)
    } else {
      toast.error('Bulk upload failed')
    }
  }

  return (
    <div className="max-w-6xl mx-auto pb-20">
      
      <div className="flex items-center gap-4 mb-8">
        <Link href="/students" className="p-2 hover:bg-slate-100 rounded-full text-slate-500">
          <ArrowLeft className="w-6 h-6" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Bulk Admission</h1>
          <p className="text-slate-500">Add multiple students to a class via spreadsheet.</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 md:p-8 space-y-6">
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="max-w-md">
              <label className="text-sm font-medium text-slate-700 mb-1 block">Target Class</label>
              <select 
                value={classId} 
                onChange={handleClassChange} 
                required 
                className="w-full p-3 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="">Select Class...</option>
                {classes.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            {/* 👇 NEW SPREADSHEET COMPONENT */}
            <SpreadsheetInput 
               isSenior={isSenior} 
               onDataChange={setStudentData} 
            />

            <button 
              type="submit" 
              disabled={isProcessing} 
              className="w-full py-4 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-slate-900/10 mt-8"
            >
              {isProcessing ? <Loader2 className="w-5 h-5 animate-spin"/> : <><Upload className="w-5 h-5" /> Process Bulk Admission</>}
            </button>
          </form>

        </div>
      </div>

      {/* Results Report */}
      {results && (
        <div className="mt-8 animate-in fade-in slide-in-from-bottom-4">
          <h3 className="font-bold text-slate-900 mb-4">Upload Report</h3>
          
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3 mb-4">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <p className="text-green-800 font-medium">{results.message}</p>
          </div>

          {results.errors && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2 text-red-800 font-bold">
                <AlertTriangle className="w-5 h-5" />
                Errors ({results.errors.length})
              </div>
              <ul className="list-disc pl-5 text-sm text-red-700 space-y-1">
                {results.errors.map((err: string, i: number) => (
                  <li key={i}>{err}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

    </div>
  )
}