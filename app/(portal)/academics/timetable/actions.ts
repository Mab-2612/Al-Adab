'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function addPeriod(formData: FormData) {
  const supabase = await createClient()

  const classId = formData.get('classId') as string
  const subjectId = formData.get('subjectId') as string
  const startTime = formData.get('startTime') as string
  const endTime = formData.get('endTime') as string
  
  // Get all selected days
  const days = formData.getAll('days') as string[]

  if (!days || days.length === 0) {
    return { error: 'Please select at least one day.' }
  }

  if (startTime >= endTime) {
    return { error: 'Start time must be before end time.' }
  }

  // Create an array of rows to insert at once
  const rows = days.map(day => ({
    class_id: classId,
    subject_id: subjectId,
    day,
    start_time: startTime,
    end_time: endTime
  }))

  const { error } = await supabase
    .from('timetables')
    .insert(rows)

  if (error) return { error: error.message }

  revalidatePath('/academics/timetable')
  return { success: true, message: `Added ${rows.length} periods successfully.` }
}

export async function deletePeriod(id: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('timetables').delete().eq('id', id)
  
  if (error) return { error: error.message }
  revalidatePath('/academics/timetable')
  return { success: true, message: 'Period removed.' }
}