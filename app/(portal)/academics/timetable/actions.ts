'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

// --- SINGLE ENTRY ACTIONS (Legacy/Backup) ---

export async function addPeriod(formData: FormData) {
  const supabase = await createClient()

  const classId = formData.get('classId') as string
  const subjectId = formData.get('subjectId') as string
  const startTime = formData.get('startTime') as string
  const endTime = formData.get('endTime') as string
  const days = formData.getAll('days') as string[]

  if (!days || days.length === 0) return { error: 'Please select at least one day.' }

  const rows = days.map(day => ({
    class_id: classId,
    subject_id: subjectId,
    day,
    start_time: startTime,
    end_time: endTime,
    type: 'lesson'
  }))

  const { error } = await supabase.from('timetables').insert(rows)
  if (error) return { error: error.message }

  revalidatePath('/academics/timetable')
  return { success: true, message: `Added ${rows.length} periods.` }
}

export async function deletePeriod(id: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('timetables').delete().eq('id', id)
  if (error) return { error: error.message }
  revalidatePath('/academics/timetable')
  return { success: true, message: 'Period removed.' }
}

// --- BULK UPDATE ACTION (Main Grid Editor) ---

export async function bulkUpdateTimetable(classId: string, periods: any[]) {
  const supabase = await createClient()

  // 1. Clear ALL existing entries for this class to prevent overlaps/duplicates
  const { error: deleteError } = await supabase
    .from('timetables')
    .delete()
    .eq('class_id', classId)

  if (deleteError) return { error: 'Failed to clear old timetable: ' + deleteError.message }

  if (periods.length === 0) {
    revalidatePath('/academics/timetable')
    return { success: true, message: 'Timetable cleared.' }
  }

  // 2. Prepare new rows
  const rows = periods.map(p => ({
    class_id: classId,
    // If it's a break, subject_id must be null
    subject_id: p.type === 'break' ? null : p.subjectId, 
    day: p.day,
    start_time: p.startTime,
    end_time: p.endTime,
    // New fields for breaks
    type: p.type || 'lesson', 
    label: p.label || null // e.g. "Long Break"
  }))

  // 3. Insert new rows
  const { error: insertError } = await supabase.from('timetables').insert(rows)

  if (insertError) return { error: 'Failed to save: ' + insertError.message }

  revalidatePath('/academics/timetable')
  return { success: true, message: `Saved ${rows.length} slots successfully.` }
}