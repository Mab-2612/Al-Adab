'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function saveAttendance(formData: FormData) {
  const supabase = await createClient()

  const classId = formData.get('classId') as string
  const date = formData.get('date') as string
  const term = '1st Term' // Ideally fetch from current session logic
  
  // Get Current Session
  const { data: session } = await supabase
    .from('academic_sessions')
    .select('id')
    .eq('is_current', true)
    .single()

  if (!session) return { error: 'No active session found.' }

  // Get current user (Teacher)
  const { data: { user } } = await supabase.auth.getUser()

  // Parse Form Data
  const updates: any[] = []
  const rawData = Object.fromEntries(formData.entries())

  Object.keys(rawData).forEach((key) => {
    if (key.startsWith('status_')) {
      const studentId = key.split('_')[1]
      const status = rawData[key] as string

      updates.push({
        student_id: studentId,
        class_id: classId,
        session_id: session.id,
        term: term,
        date: date,
        status: status,
        recorded_by: user?.id
      })
    }
  })

  if (updates.length === 0) return { error: 'No data to save' }

  // Upsert (Insert or Update if exists for that day)
  const { error } = await supabase
    .from('attendance')
    .upsert(updates, { onConflict: 'student_id, date' })

  if (error) return { error: error.message }

  revalidatePath('/attendance')
  return { success: true, message: 'Attendance marked successfully.' }
}