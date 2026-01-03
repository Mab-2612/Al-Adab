'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function saveResults(formData: FormData) {
  const supabase = await createClient()

  // 1. Get Context Data
  const classId = formData.get('classId') as string
  const subjectId = formData.get('subjectId') as string
  const term = formData.get('term') as string
  
  // 2. Get Current Session
  const { data: session } = await supabase
    .from('academic_sessions')
    .select('id')
    .eq('is_current', true)
    .single()
  
  if (!session) return { error: 'No active session.' }

  // 3. Parse the Form Data (It's a bit tricky because it's a list)
  // We expect inputs named like: "student_<ID>_ca" and "student_<ID>_exam"
  const rawData = Object.fromEntries(formData.entries())
  const updates: any[] = []

  // Loop through keys to find student IDs
  Object.keys(rawData).forEach((key) => {
    if (key.startsWith('student_') && key.endsWith('_ca')) {
      const studentId = key.split('_')[1] // Extract ID
      
      const ca = Number(formData.get(`student_${studentId}_ca`) || 0)
      const exam = Number(formData.get(`student_${studentId}_exam`) || 0)
      
      // Basic Validation
      if (ca > 40) return // CA shouldn't exceed 40
      if (exam > 60) return // Exam shouldn't exceed 60

      updates.push({
        student_id: studentId,
        subject_id: subjectId,
        class_id: classId,
        session_id: session.id,
        term: term,
        ca_score: ca,
        exam_score: exam,
        // total_score is auto-calculated by DB (Generated Column)
        // grade can be calculated here or in DB. Let's let DB handle total.
      })
    }
  })

  if (updates.length === 0) return { success: true, message: 'No changes detected.' }

  // 4. Bulk Upsert to Database
  const { error } = await supabase
    .from('results')
    .upsert(updates, { 
      onConflict: 'student_id, subject_id, class_id, session_id, term' 
    })

  if (error) {
    console.error(error)
    return { error: error.message }
  }

  revalidatePath('/results/upload')
  return { success: true, message: `Saved ${updates.length} results successfully!` }
}