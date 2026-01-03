import { createClient } from '@/utils/supabase/server'
import { BookOpen } from 'lucide-react'
import ResultSheet from './ResultSheet'
import ResultFilters from './ResultFilters'

export default async function ResultUploadPage({ searchParams }: { searchParams: Promise<{ classId?: string, subjectId?: string }> }) {
  const supabase = await createClient()
  const params = await searchParams

  // 1. Fetch Classes
  const { data: classes } = await supabase.from('classes').select('id, name, section').order('name')
  
  // 2. Fetch Subjects
  const { data: subjects } = await supabase.from('subjects').select('id, name, code, category').order('name')

  // 3. Fetch System Term
  const { data: session } = await supabase.from('academic_sessions').select('current_term').eq('is_current', true).single()
  const systemTerm = session?.current_term || '1st Term'

  // 4. Smart Fetch Logic
  let students = null
  let existingResults = null

  if (params.classId && params.subjectId) {
    
    // A. Check Subject Department Scope
    const { data: selectedSubject } = await supabase
      .from('subjects')
      .select('department_target')
      .eq('id', params.subjectId)
      .single()
    
    const targetDept = selectedSubject?.department_target

    // B. Build Query
    let query = supabase
      .from('students')
      .select('id, admission_number, department, profiles:student_profile_link(first_name, last_name)')
      .eq('current_class_id', params.classId)
      .order('admission_number')

    // C. Apply Department Filter if Subject is Specific
    if (targetDept && targetDept !== 'General') {
       query = query.eq('department', targetDept)
    }

    const { data: sData } = await query
    students = sData || []

    // Fetch Results
    const { data: rData } = await supabase
      .from('results')
      .select('student_id, ca_score, exam_score')
      .eq('class_id', params.classId)
      .eq('subject_id', params.subjectId)
      .eq('term', systemTerm)
    
    existingResults = rData || []
  }

  return (
    <div className="max-w-6xl mx-auto pb-20">
      <div className="flex items-center gap-4 mb-8">
         <div className="p-3 bg-blue-100 text-blue-600 rounded-xl">
           <BookOpen className="w-6 h-6" />
         </div>
         <div>
           <h1 className="text-2xl font-bold text-slate-900">Result Entry</h1>
           <p className="text-slate-500">Input scores for the current academic session.</p>
         </div>
      </div>

      <div className="grid lg:grid-cols-4 gap-8">
        <div className="lg:col-span-1 space-y-6">
           <ResultFilters classes={classes || []} subjects={subjects || []} />
        </div>

        <div className="lg:col-span-3">
          {params.classId && params.subjectId ? (
             <ResultSheet 
               classId={params.classId}
               subjectId={params.subjectId}
               students={students || []}
               existingResults={existingResults || []}
               systemTerm={systemTerm} 
             />
          ) : (
             <div className="h-64 flex flex-col items-center justify-center bg-slate-50 border border-dashed border-slate-300 rounded-xl text-slate-400">
               <BookOpen className="w-12 h-12 mb-2 opacity-50" />
               <p>Select a Class and Subject to load the scoresheet.</p>
             </div>
          )}
        </div>
      </div>
    </div>
  )
}