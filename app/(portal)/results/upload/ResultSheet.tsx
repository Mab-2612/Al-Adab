'use client'

import { saveResults } from '../actions'
import { Save, Loader2, AlertCircle, Calculator } from 'lucide-react'
import { toast } from 'sonner'
import { useState, useEffect } from 'react'

export default function ResultSheet({ 
  classId, 
  subjectId, 
  students, 
  existingResults,
  systemTerm 
}: { 
  classId: string, 
  subjectId: string, 
  students: any[], 
  existingResults: any[],
  systemTerm: string 
}) {
  const [isSaving, setIsSaving] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)

  // Hydrate initial state with existing scores or empty strings
  const [scores, setScores] = useState<Record<string, { ca: string, exam: string }>>({})

  useEffect(() => {
    const initial: any = {}
    students.forEach(student => {
      const prev = existingResults.find(r => r.student_id === student.id)
      initial[student.id] = {
        ca: prev?.ca_score ?? '',
        exam: prev?.exam_score ?? ''
      }
    })
    setScores(initial)
  }, [students, existingResults])

  const handleScoreChange = (studentId: string, field: 'ca' | 'exam', value: string) => {
    // Input Validation
    const num = parseFloat(value)
    if (value !== '' && isNaN(num)) return // Prevent non-numbers
    if (field === 'ca' && num > 40) return // Max 40 for CA
    if (field === 'exam' && num > 60) return // Max 60 for Exam

    setScores(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        [field]: value
      }
    }))
    setHasChanges(true)
  }

  // Keyboard Navigation Logic
  const handleKeyDown = (e: React.KeyboardEvent, index: number, field: 'ca' | 'exam') => {
    if (e.key === 'Enter' || e.key === 'ArrowDown') {
      e.preventDefault()
      const nextInput = document.getElementById(`${field}-${index + 1}`)
      nextInput?.focus()
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault()
      const prevInput = document.getElementById(`${field}-${index - 1}`)
      prevInput?.focus()
    }
    if (e.key === 'ArrowRight' && field === 'ca') {
      e.preventDefault()
      document.getElementById(`exam-${index}`)?.focus()
    }
    if (e.key === 'ArrowLeft' && field === 'exam') {
      e.preventDefault()
      document.getElementById(`ca-${index}`)?.focus()
    }
  }

  const handleSubmit = async (formData: FormData) => {
    setIsSaving(true)
    const result = await saveResults(formData)
    setIsSaving(false)

    if (result && result.success) {
      toast.success(result.message)
      setHasChanges(false)
    } else {
      toast.error(result?.error || 'Failed to save')
    }
  }

  // Calculate live stats for the header bar
  const calculatedStats = Object.values(scores).reduce((acc, curr) => {
    const total = (Number(curr.ca) || 0) + (Number(curr.exam) || 0)
    if (total > 0 || (curr.ca !== '' || curr.exam !== '')) {
      acc.count++
      acc.sum += total
      acc.highest = Math.max(acc.highest, total)
      if (total < 40) acc.failures++
    }
    return acc
  }, { count: 0, sum: 0, highest: 0, failures: 0 })
  
  const average = calculatedStats.count ? (calculatedStats.sum / calculatedStats.count).toFixed(1) : '0.0'

  return (
    <form action={handleSubmit} className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden flex flex-col h-[calc(100vh-200px)]">
      
      {/* Hidden Context Fields */}
      <input type="hidden" name="classId" value={classId} />
      <input type="hidden" name="subjectId" value={subjectId} />
      <input type="hidden" name="term" value={systemTerm} />
      
      {/* Sticky Toolbar / Stats Header */}
      <div className="p-4 bg-white border-b border-slate-200 flex flex-wrap justify-between items-center sticky top-0 z-20 shadow-sm gap-4">
        <div>
          <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
            Broadsheet Input
            {hasChanges && <span className="text-xs font-normal text-amber-600 bg-amber-50 px-2 py-1 rounded-full border border-amber-100 flex items-center gap-1"><AlertCircle className="w-3 h-3"/> Unsaved Changes</span>}
          </h3>
          <div className="flex gap-4 text-xs text-slate-500 mt-1">
             <span>Avg: <strong>{average}</strong></span>
             <span>Highest: <strong>{calculatedStats.highest}</strong></span>
             <span>Failures: <strong className="text-red-600">{calculatedStats.failures}</strong></span>
          </div>
        </div>
        
        <div className="flex gap-4 items-center">
           <div className="px-3 py-1.5 bg-slate-100 text-slate-600 font-bold rounded-lg text-xs border border-slate-200 hidden sm:block">
             {systemTerm}
           </div>

           <button 
             type="submit" 
             disabled={isSaving}
             className={`px-6 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all shadow-sm ${
               hasChanges 
               ? 'bg-blue-600 text-white hover:bg-blue-700 hover:shadow-md hover:-translate-y-0.5' 
               : 'bg-slate-100 text-slate-400 cursor-not-allowed'
             }`}
           >
             {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
             Save Broadsheet
           </button>
        </div>
      </div>

      {/* Scrollable Table Area */}
      <div className="flex-1 overflow-auto relative">
        <table className="w-full text-left border-collapse min-w-[800px]">
          <thead className="sticky top-0 z-10 shadow-sm">
            <tr className="bg-slate-50 text-xs uppercase text-slate-500 font-bold border-b border-slate-200">
              <th className="p-4 w-12 sticky left-0 bg-slate-50 border-r border-slate-200">#</th>
              <th className="p-4 min-w-[250px] sticky left-12 bg-slate-50 border-r border-slate-200 z-20">Student Name</th>
              <th className="p-2 w-32 text-center bg-blue-50/50 border-r border-slate-200">CA (40)</th>
              <th className="p-2 w-32 text-center bg-purple-50/50 border-r border-slate-200">Exam (60)</th>
              <th className="p-2 w-24 text-center border-r border-slate-200">Total</th>
              <th className="p-2 w-24 text-center border-r border-slate-200">Grade</th>
              <th className="p-2 w-32 text-left">Remark</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {students.map((student, idx) => {
              const sScore = scores[student.id] || { ca: '', exam: '' }
              const total = (Number(sScore.ca) || 0) + (Number(sScore.exam) || 0)
              
              // Grade Logic
              let grade = 'F'
              let remark = 'Fail'
              let color = 'text-red-600'
              
              if (total >= 70) { grade = 'A'; remark = 'Excellent'; color = 'text-green-600'; }
              else if (total >= 60) { grade = 'B'; remark = 'V. Good'; color = 'text-blue-600'; }
              else if (total >= 50) { grade = 'C'; remark = 'Credit'; color = 'text-slate-700'; }
              else if (total >= 45) { grade = 'D'; remark = 'Pass'; color = 'text-slate-500'; }
              else if (total >= 40) { grade = 'E'; remark = 'Fair'; color = 'text-orange-600'; }
              
              const isEmpty = sScore.ca === '' && sScore.exam === ''

              return (
                <tr key={student.id} className="hover:bg-slate-50 group">
                  <td className="p-4 text-slate-400 font-mono text-xs sticky left-0 bg-white group-hover:bg-slate-50 border-r border-slate-100">{idx + 1}</td>
                  
                  {/* Sticky Name Column */}
                  <td className="p-4 sticky left-12 bg-white group-hover:bg-slate-50 border-r border-slate-100 z-10">
                    <p className="font-bold text-slate-900 text-sm truncate w-full">
                       {student.profiles?.last_name}, {student.profiles?.first_name}
                    </p>
                    <p className="text-[10px] text-slate-400 font-mono">{student.admission_number}</p>
                  </td>
                  
                  {/* CA Input */}
                  <td className="p-0 border-r border-slate-100 bg-blue-50/10">
                    <input 
                      id={`ca-${idx}`}
                      type="number" 
                      name={`student_${student.id}_ca`}
                      value={sScore.ca}
                      onChange={(e) => handleScoreChange(student.id, 'ca', e.target.value)}
                      onKeyDown={(e) => handleKeyDown(e, idx, 'ca')}
                      className="w-full h-full p-4 text-center bg-transparent outline-none focus:bg-blue-50 focus:ring-2 focus:ring-inset focus:ring-blue-500 transition-all font-mono text-slate-700 placeholder:text-slate-200 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      placeholder="-"
                      autoComplete="off"
                    />
                  </td>
                  
                  {/* Exam Input */}
                  <td className="p-0 border-r border-slate-100 bg-purple-50/10">
                    <input 
                      id={`exam-${idx}`}
                      type="number" 
                      name={`student_${student.id}_exam`}
                      value={sScore.exam}
                      onChange={(e) => handleScoreChange(student.id, 'exam', e.target.value)}
                      onKeyDown={(e) => handleKeyDown(e, idx, 'exam')}
                      className="w-full h-full p-4 text-center bg-transparent outline-none focus:bg-purple-50 focus:ring-2 focus:ring-inset focus:ring-purple-500 transition-all font-mono text-slate-700 placeholder:text-slate-200 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      placeholder="-"
                      autoComplete="off"
                    />
                  </td>
                  
                  {/* Stats Output */}
                  <td className="p-4 text-center font-bold text-slate-800 border-r border-slate-100">
                     {isEmpty ? '-' : total}
                  </td>
                  <td className={`p-4 text-center font-bold border-r border-slate-100 ${isEmpty ? 'text-slate-200' : color}`}>
                     {isEmpty ? '-' : grade}
                  </td>
                  <td className={`p-4 text-xs font-medium ${isEmpty ? 'text-slate-200' : 'text-slate-500'}`}>
                     {isEmpty ? '-' : remark}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      
      {students.length === 0 && (
        <div className="flex-1 flex flex-col items-center justify-center text-slate-400 bg-slate-50">
           <Calculator className="w-12 h-12 mb-2 opacity-20" />
           <p>No students found for this class.</p>
        </div>
      )}
    </form>
  )
}