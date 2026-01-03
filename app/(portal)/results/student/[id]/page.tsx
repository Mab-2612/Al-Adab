import { createClient } from '@/utils/supabase/server'
import { notFound } from 'next/navigation'
import { ArrowLeft, ShieldAlert } from 'lucide-react'
import Link from 'next/link'
import PrintButton from './PrintButton' // 👈 Import the new component

// ... keep getGrade helper ...
const getGrade = (score: number) => {
  if (score >= 70) return { grade: 'A', remark: 'Distinction' }
  if (score >= 60) return { grade: 'B', remark: 'Very Good' }
  if (score >= 50) return { grade: 'C', remark: 'Credit' }
  if (score >= 45) return { grade: 'D', remark: 'Pass' }
  if (score >= 40) return { grade: 'E', remark: 'Fair' }
  return { grade: 'F', remark: 'Fail' }
}

export default async function ReportCardPage({ params, searchParams }: { params: Promise<{ id: string }>, searchParams: Promise<{ session?: string, term?: string }> }) {
  const supabase = await createClient()
  const { id } = await params
  const query = await searchParams
  
  // ... keep logic (fetching session, student, results) ...
  let sessionId = query.session
  if (!sessionId) {
    const { data: session } = await supabase.from('academic_sessions').select('id').eq('is_current', true).single()
    sessionId = session?.id
  }
  const term = query.term || '1st Term'

  const { data: student } = await supabase
    .from('students')
    .select(`*, profiles:student_profile_link (*), classes (name)`)
    .eq('id', id)
    .single()

  if (!student) notFound()

  const { data: results } = await supabase
    .from('results')
    .select(`*, subjects (name, code)`)
    .eq('student_id', id)
    .eq('session_id', sessionId)
    .eq('term', term)
    .order('subject_id')

  // Calculate Stats
  const totalScore = results?.reduce((acc: number, curr: any) => acc + (curr.ca_score + curr.exam_score), 0) || 0
  const average = results?.length ? (totalScore / results.length).toFixed(1) : '0.0'

  return (
    <div className="max-w-4xl mx-auto pb-20 print:p-0 print:max-w-none">
      
      {/* Navigation */}
      <div className="flex items-center justify-between mb-8 print:hidden">
        <Link href={`/students/${id}`} className="flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors">
          <ArrowLeft className="w-5 h-5" />
          <span className="font-medium">Back to Profile</span>
        </Link>
        
        {/* 👇 USE THE CLIENT COMPONENT HERE */}
        <PrintButton /> 
      </div>

      {/* THE REPORT SHEET */}
      <div className="bg-white p-8 md:p-12 rounded-xl shadow-sm border border-slate-200 print:shadow-none print:border-none print:p-0">
        
        {/* Header */}
        <div className="text-center border-b-2 border-slate-800 pb-6 mb-8">
          <h1 className="text-3xl font-black text-slate-900 uppercase tracking-widest mb-2">Al-Adab School</h1>
          <p className="text-slate-500 font-medium uppercase text-sm tracking-wide">Report Sheet • {term} • 2024/2025</p>
        </div>

        {/* Student Details Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8 text-sm">
          <div>
            <p className="text-slate-400 uppercase text-xs font-bold mb-1">Student Name</p>
            <p className="font-bold text-slate-900 uppercase">{student.profiles?.first_name} {student.profiles?.last_name}</p>
          </div>
          <div>
            <p className="text-slate-400 uppercase text-xs font-bold mb-1">Admission No</p>
            <p className="font-mono text-slate-900">{student.admission_number}</p>
          </div>
          <div>
            <p className="text-slate-400 uppercase text-xs font-bold mb-1">Class</p>
            <p className="font-bold text-slate-900">{student.classes?.name}</p>
          </div>
          <div>
            <p className="text-slate-400 uppercase text-xs font-bold mb-1">Overall Average</p>
            <p className="font-bold text-slate-900 text-lg">{average}%</p>
          </div>
        </div>

        {/* Scores Table */}
        <div className="border rounded-lg overflow-hidden mb-8">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="bg-slate-100 text-slate-900 font-bold uppercase text-xs border-b">
                <th className="p-3 border-r">Subject</th>
                <th className="p-3 w-16 text-center border-r">CA</th>
                <th className="p-3 w-16 text-center border-r">Exam</th>
                <th className="p-3 w-16 text-center border-r bg-slate-200">Total</th>
                <th className="p-3 w-16 text-center border-r">Grade</th>
                <th className="p-3 w-32 text-left">Remark</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {results?.map((res: any) => {
                const total = res.ca_score + res.exam_score
                const { grade, remark } = getGrade(total)
                
                return (
                  <tr key={res.id}>
                    <td className="p-3 border-r font-medium text-slate-800">{res.subjects?.name}</td>
                    <td className="p-3 border-r text-center text-slate-500">{res.ca_score}</td>
                    <td className="p-3 border-r text-center text-slate-500">{res.exam_score}</td>
                    <td className="p-3 border-r text-center font-bold text-slate-900 bg-slate-50">{total}</td>
                    <td className={`p-3 border-r text-center font-bold ${grade === 'F' ? 'text-red-600' : 'text-green-700'}`}>
                      {grade}
                    </td>
                    <td className="p-3 text-slate-500 text-xs uppercase font-medium">{remark}</td>
                  </tr>
                )
              })}
              
              {results?.length === 0 && (
                 <tr>
                   <td colSpan={6} className="p-8 text-center text-slate-400 italic">
                     No results uploaded for this student yet.
                   </td>
                 </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="grid md:grid-cols-2 gap-12 mt-12 print:mt-24">
           <div className="border-t border-slate-300 pt-4">
              <p className="text-xs uppercase font-bold text-slate-400 mb-8">Class Teacher's Signature</p>
              <div className="h-8 border-b border-dotted border-slate-400"></div>
           </div>
           <div className="border-t border-slate-300 pt-4">
              <p className="text-xs uppercase font-bold text-slate-400 mb-8">Principal's Signature</p>
              <div className="h-8 border-b border-dotted border-slate-400"></div>
           </div>
        </div>

        <div className="mt-8 text-center print:mt-12">
           <p className="text-[10px] text-slate-400 uppercase">Generated by Al-Adab Portal • {new Date().toDateString()}</p>
        </div>

      </div>
    </div>
  )
}