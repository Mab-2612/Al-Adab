'use client'

import { createClient } from '@/utils/supabase/client'
import { useEffect, useState } from 'react'
import { ArrowLeft, Upload, Loader2, CheckCircle, AlertTriangle } from 'lucide-react'
import Link from 'next/link'
import { bulkCreateStudents } from '../actions'
import { toast } from 'sonner'

export default function BulkUploadPage() {
  const [classes, setClasses] = useState<any[]>([])
  const [classId, setClassId] = useState('')
  const [names, setNames] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [results, setResults] = useState<any>(null)

  useEffect(() => {
    const supabase = createClient()
    supabase.from('classes').select('id, name').order('name')
      .then(({ data }) => setClasses(data || []))
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!classId) return toast.error('Please select a class')
    if (!names.trim()) return toast.error('Please enter student data')

    setIsProcessing(true)
    const res = await bulkCreateStudents(classId, names)
    setIsProcessing(false)

    if (res?.success) {
      toast.success(res.message)
      setResults(res)
      setNames('') // Clear input
    } else {
      toast.error('Bulk upload failed')
    }
  }

  return (
    <div className="max-w-4xl mx-auto pb-20">
      
      <div className="flex items-center gap-4 mb-8">
        <Link href="/students" className="p-2 hover:bg-slate-100 rounded-full text-slate-500">
          <ArrowLeft className="w-6 h-6" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Bulk Admission</h1>
          <p className="text-slate-500">Add multiple students using spreadsheet data.</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 md:p-8 space-y-6">
          
          {/* INSTRUCTIONS */}
          <div className="bg-blue-50 border border-blue-100 rounded-lg p-5 text-sm text-blue-800">
            <p className="font-bold mb-2 text-base">Spreadsheet Format Guide:</p>
            <p className="mb-2">Enter student details <strong>one per line</strong>, separated by <strong>commas</strong>.</p>
            
            <div className="bg-white/50 p-4 rounded border border-blue-100 font-mono text-xs space-y-2 overflow-x-auto">
              <p className="font-bold text-slate-500 uppercase tracking-wide">
                Surname, FirstName, OtherNames, Gender, DOB(YYYY-MM-DD), Phone, Department
              </p>
              <div className="space-y-1 text-slate-700">
                <p>Musa, Ibrahim, Aliyu, Male, 2010-05-20, 08012345678</p>
                <p>Adeleke, Sarah, , Female, 2011-02-14, 08098765432, Science</p>
                <p>Okonkwo, Chukwudi, David, Male, 2010-09-01, 09011223344, Commercial</p>
              </div>
            </div>
            
            <ul className="mt-4 space-y-1 list-disc pl-5 text-xs">
              <li><strong>Surname & FirstName:</strong> Required.</li>
              <li><strong>Department:</strong> Required for Senior Classes (Science, Arts, Commercial).</li>
              <li><strong>DOB format:</strong> Year-Month-Day (e.g. 2010-01-31).</li>
              <li><strong>Missing Info:</strong> Leave blank between commas (e.g., `Surname, Name, , Male`).</li>
            </ul>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="text-sm font-medium text-slate-700 mb-1 block">Target Class</label>
              <select 
                value={classId} 
                onChange={(e) => setClassId(e.target.value)} 
                required 
                className="w-full p-3 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="">Select Class...</option>
                {classes.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700 mb-1 block">Paste Data (CSV Format)</label>
              <textarea 
                value={names}
                onChange={(e) => setNames(e.target.value)}
                required 
                rows={12} 
                placeholder={`Musa, Ibrahim, , Male, 2010-05-12, 08012345678\nAdeleke, Sarah, Bisi, Female, 2011-02-14, 08099998888, Science`}
                className="w-full p-4 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm leading-relaxed"
              ></textarea>
              <div className="flex justify-end mt-2">
                <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded">
                  {names.split('\n').filter(n => n.trim()).length} rows detected
                </span>
              </div>
            </div>

            <button 
              type="submit" 
              disabled={isProcessing} 
              className="w-full py-3 bg-slate-900 text-white rounded-lg font-bold hover:bg-slate-800 disabled:opacity-50 flex items-center justify-center gap-2"
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