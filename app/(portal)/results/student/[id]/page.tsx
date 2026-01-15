import { createClient } from '@/utils/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Printer, Check, X } from 'lucide-react'
import Image from 'next/image'
import PrintButton from './PrintButton'

// Grading Logic
const getGrade = (score: number) => {
  if (score >= 70) return { grade: 'A', remark: 'Excellent', color: 'text-green-700' }
  if (score >= 60) return { grade: 'B', remark: 'Very Good', color: 'text-blue-700' }
  if (score >= 50) return { grade: 'C', remark: 'Credit', color: 'text-slate-700' }
  if (score >= 45) return { grade: 'D', remark: 'Pass', color: 'text-orange-700' }
  if (score >= 40) return { grade: 'E', remark: 'Fair', color: 'text-orange-600' }
  return { grade: 'F', remark: 'Fail', color: 'text-red-600' }
}

export default async function ReportCardPage({ params, searchParams }: { params: Promise<{ id: string }>, searchParams: Promise<{ session?: string, term?: string }> }) {
  const supabase = await createClient()
  const { id } = await params
  const query = await searchParams
  
  // 1. Get System Context (Session/Term)
  // Use query params if provided (for history), else use current system default
  let sessionId = query.session
  let term = query.term

  if (!sessionId || !term) {
    const { data: system } = await supabase.from('academic_sessions').select('id, name, current_term').eq('is_current', true).single()
    sessionId = sessionId || system?.id
    term = term || system?.current_term || '1st Term'
  }

  // 2. Fetch Student Data
  const { data: student } = await supabase
    .from('students')
    .select(`
      *,
      profiles:student_profile_link (*),
      classes (id, name, section)
    `)
    .eq('id', id)
    .single()

  if (!student) notFound()

  // 3. Fetch Results
  const { data: results } = await supabase
    .from('results')
    .select(`*, subjects (name, code)`)
    .eq('student_id', id)
    .eq('session_id', sessionId)
    .eq('term', term)
    .order('subject_id')

  // 4. Fetch Attendance Stats
  const { count: totalAtt } = await supabase.from('attendance').select('*', { count: 'exact', head: true }).eq('student_id', id).eq('session_id', sessionId).eq('term', term)
  const { count: presentAtt } = await supabase.from('attendance').select('*', { count: 'exact', head: true }).eq('student_id', id).eq('session_id', sessionId).eq('term', term).eq('status', 'present')

  // 5. Fetch Class Stats (For "Number in Class")
  const { count: classCount } = await supabase.from('students').select('*', { count: 'exact', head: true }).eq('current_class_id', student.current_class_id)

  // 6. Calculations
  const totalScore = results?.reduce((acc, curr) => acc + (curr.ca_score + curr.exam_score), 0) || 0
  const subjectCount = results?.length || 0
  const average = subjectCount ? (totalScore / subjectCount).toFixed(2) : '0.00'

  return (
    <div className="min-h-screen bg-slate-50 py-10 print:bg-white print:p-0">
      
      {/* Navigation (Hidden on Print) */}
      <div className="max-w-4xl mx-auto mb-6 flex justify-between items-center px-4 print:hidden">
        <Link href={`/students/${id}`} className="flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors">
          <ArrowLeft className="w-5 h-5" />
          <span className="font-medium">Back to Profile</span>
        </Link>
        <PrintButton />
      </div>

      {/* REPORT SHEET CONTAINER (A4 Ratio) */}
      <div className="max-w-[210mm] mx-auto bg-white border border-slate-300 shadow-lg p-8 md:p-12 print:shadow-none print:border-none print:p-0 print:max-w-none">
        
        {/* --- HEADER --- */}
        <div className="flex gap-6 items-center border-b-4 border-slate-900 pb-6 mb-6">
          {/* Logo */}
          <div className="w-24 h-24 relative shrink-0">
             <Image src="/logo.png" alt="Logo" fill className="object-contain" unoptimized />
          </div>
          {/* School Info */}
          <div className="flex-1 text-center">
            <h1 className="text-4xl font-black text-slate-900 uppercase tracking-wide">Al-Adab School</h1>
            <p className="text-sm font-bold text-slate-500 uppercase tracking-widest mt-1">Excellence & Character</p>
            <p className="text-xs text-slate-400 mt-2">12 Al-Adab Avenue, GRA Extension, Ilorin.</p>
            <div className="mt-3 inline-block bg-slate-900 text-white px-6 py-1 text-sm font-bold uppercase rounded-full">
              Student Report Sheet
            </div>
          </div>
          {/* Student Photo */}
          <div className="w-24 h-24 bg-slate-100 border-2 border-slate-200 shrink-0 relative overflow-hidden">
             {/* Use a placeholder or actual student image if you have one */}
             <div className="absolute inset-0 flex items-center justify-center text-slate-300 font-bold text-xs uppercase">
                Passport
             </div>
          </div>
        </div>

        {/* --- STUDENT DETAILS --- */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 text-sm border-2 border-slate-900 p-4">
          <div>
             <span className="block text-[10px] uppercase font-bold text-slate-500">Student Name</span>
             <span className="font-bold text-slate-900 uppercase text-base">
               {student.profiles?.last_name}, {student.profiles?.first_name}
             </span>
          </div>
          <div>
             <span className="block text-[10px] uppercase font-bold text-slate-500">Admission No</span>
             <span className="font-mono font-bold text-slate-900">{student.admission_number}</span>
          </div>
          <div>
             <span className="block text-[10px] uppercase font-bold text-slate-500">Class</span>
             <span className="font-bold text-slate-900">{student.classes?.name}</span>
          </div>
          <div>
             <span className="block text-[10px] uppercase font-bold text-slate-500">Session / Term</span>
             <span className="font-bold text-slate-900">{term}</span>
          </div>
          <div>
             <span className="block text-[10px] uppercase font-bold text-slate-500">No. in Class</span>
             <span className="font-bold text-slate-900">{classCount}</span>
          </div>
          <div>
             <span className="block text-[10px] uppercase font-bold text-slate-500">Attendance</span>
             <span className="font-bold text-slate-900">{presentAtt} / {totalAtt} Days</span>
          </div>
          <div>
             <span className="block text-[10px] uppercase font-bold text-slate-500">Next Term Begins</span>
             <span className="font-bold text-slate-900">--/--/----</span>
          </div>
        </div>

        {/* --- ACADEMIC PERFORMANCE (Cognitive) --- */}
        <div className="mb-8">
           <h3 className="font-bold text-slate-900 uppercase text-xs mb-1 border-b border-slate-300 pb-1">Cognitive Domain</h3>
           <table className="w-full text-sm border-collapse border border-slate-300">
             <thead>
               <tr className="bg-slate-100 text-slate-800 font-bold uppercase text-[11px]">
                 <th className="border border-slate-300 p-2 text-left">Subject</th>
                 <th className="border border-slate-300 p-2 w-12 text-center">CA (40)</th>
                 <th className="border border-slate-300 p-2 w-12 text-center">Exam (60)</th>
                 <th className="border border-slate-300 p-2 w-12 text-center bg-slate-200">Total</th>
                 <th className="border border-slate-300 p-2 w-12 text-center">Grade</th>
                 <th className="border border-slate-300 p-2 w-24 text-left">Remark</th>
               </tr>
             </thead>
             <tbody>
               {results?.map((res) => {
                 const total = res.ca_score + res.exam_score
                 const { grade, remark, color } = getGrade(total)
                 return (
                   <tr key={res.id}>
                     <td className="border border-slate-300 p-2 font-medium">{res.subjects?.name}</td>
                     <td className="border border-slate-300 p-2 text-center text-slate-600">{res.ca_score}</td>
                     <td className="border border-slate-300 p-2 text-center text-slate-600">{res.exam_score}</td>
                     <td className="border border-slate-300 p-2 text-center font-bold bg-slate-50">{total}</td>
                     <td className={`border border-slate-300 p-2 text-center font-bold ${color}`}>{grade}</td>
                     <td className="border border-slate-300 p-2 text-xs uppercase">{remark}</td>
                   </tr>
                 )
               })}
               {results?.length === 0 && (
                 <tr>
                   <td colSpan={6} className="p-6 text-center text-slate-400 italic">No results found for this term.</td>
                 </tr>
               )}
             </tbody>
           </table>
        </div>

        {/* --- SUMMARY & GRADING --- */}
        <div className="grid grid-cols-2 gap-8 mb-8">
           
           {/* Summary Table */}
           <div>
              <h3 className="font-bold text-slate-900 uppercase text-xs mb-1 border-b border-slate-300 pb-1">Performance Summary</h3>
              <table className="w-full text-sm border border-slate-300">
                <tbody>
                  <tr className="border-b border-slate-300">
                    <td className="p-2 font-bold bg-slate-50">Total Score Obtained</td>
                    <td className="p-2 text-right">{totalScore}</td>
                  </tr>
                  <tr className="border-b border-slate-300">
                    <td className="p-2 font-bold bg-slate-50">Number of Subjects</td>
                    <td className="p-2 text-right">{subjectCount}</td>
                  </tr>
                  <tr className="border-b border-slate-300">
                    <td className="p-2 font-bold bg-slate-50 text-blue-800">Average Score</td>
                    <td className="p-2 text-right font-bold text-blue-800">{average}%</td>
                  </tr>
                </tbody>
              </table>
           </div>

           {/* Grading Key */}
           <div>
              <h3 className="font-bold text-slate-900 uppercase text-xs mb-1 border-b border-slate-300 pb-1">Grading System</h3>
              <div className="grid grid-cols-3 gap-2 text-xs">
                 <div className="border p-1 text-center"><span className="font-bold">A</span> 70-100</div>
                 <div className="border p-1 text-center"><span className="font-bold">B</span> 60-69</div>
                 <div className="border p-1 text-center"><span className="font-bold">C</span> 50-59</div>
                 <div className="border p-1 text-center"><span className="font-bold">D</span> 45-49</div>
                 <div className="border p-1 text-center"><span className="font-bold">E</span> 40-44</div>
                 <div className="border p-1 text-center"><span className="font-bold text-red-600">F</span> 0-39</div>
              </div>
           </div>
        </div>

        {/* --- BEHAVIOR & SKILLS (Mocked for Structure) --- */}
        <div className="grid grid-cols-2 gap-8 mb-8 border-t-2 border-slate-900 pt-4">
           <div>
              <h3 className="font-bold text-slate-900 uppercase text-xs mb-2">Affective Domain (Behavior)</h3>
              <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                 <div className="flex justify-between border-b border-slate-100"><span>Punctuality</span> <span>5</span></div>
                 <div className="flex justify-between border-b border-slate-100"><span>Neatness</span> <span>4</span></div>
                 <div className="flex justify-between border-b border-slate-100"><span>Politeness</span> <span>5</span></div>
                 <div className="flex justify-between border-b border-slate-100"><span>Honesty</span> <span>5</span></div>
              </div>
           </div>
           <div>
              <h3 className="font-bold text-slate-900 uppercase text-xs mb-2">Psychomotor (Skills)</h3>
              <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                 <div className="flex justify-between border-b border-slate-100"><span>Handwriting</span> <span>4</span></div>
                 <div className="flex justify-between border-b border-slate-100"><span>Sports</span> <span>3</span></div>
                 <div className="flex justify-between border-b border-slate-100"><span>Fluency</span> <span>4</span></div>
                 <div className="flex justify-between border-b border-slate-100"><span>Creativity</span> <span>5</span></div>
              </div>
           </div>
        </div>

        {/* --- COMMENTS & SIGNATURE --- */}
        <div className="space-y-6 mt-8">
           <div className="flex gap-2 items-end">
              <span className="font-bold text-xs uppercase w-32 shrink-0">Class Teacher's Remark:</span>
              <div className="border-b border-dotted border-slate-400 flex-1 text-sm italic px-2">An excellent performance. Keep it up!</div>
           </div>
           <div className="flex gap-2 items-end">
              <span className="font-bold text-xs uppercase w-32 shrink-0">Principal's Remark:</span>
              <div className="border-b border-dotted border-slate-400 flex-1 text-sm italic px-2">Promoted to the next class.</div>
           </div>

           <div className="flex justify-between mt-12 pt-8">
              <div className="text-center">
                 <div className="w-40 border-b border-slate-900 mb-1"></div>
                 <p className="text-[10px] uppercase font-bold">Teacher's Signature</p>
              </div>
              <div className="text-center">
                 {/* Place stamp image here if available */}
                 <div className="w-40 border-b border-slate-900 mb-1"></div>
                 <p className="text-[10px] uppercase font-bold">Principal's Signature & Stamp</p>
              </div>
           </div>
        </div>

      </div>
    </div>
  )
}