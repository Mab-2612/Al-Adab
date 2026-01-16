'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

// ... addPeriod / deletePeriod (Legacy, can ignore) ...

// 👇 UPDATED: Bulk Update with Department Support
export async function bulkUpdateTimetable(classId: string, periods: any[]) {
  const supabase = await createClient()

  // 1. Clear existing
  const { error: deleteError } = await supabase
    .from('timetables')
    .delete()
    .eq('class_id', classId)

  if (deleteError) return { error: 'Failed to clear old timetable: ' + deleteError.message }

  if (periods.length === 0) return { success: true, message: 'Timetable cleared.' }

  // 2. Prepare rows
  const rows = periods.map(p => ({
    class_id: classId,
    subject_id: p.type === 'break' ? null : p.subjectId,
    day: p.day,
    start_time: p.startTime,
    end_time: p.endTime,
    type: p.type || 'lesson',
    label: p.label || null,
    // 👇 NEW: Save Department (null = General)
    department: p.department || null
  }))

  // 3. Insert
  const { error: insertError } = await supabase.from('timetables').insert(rows)

  if (insertError) return { error: 'Failed to save: ' + insertError.message }

  revalidatePath('/academics/timetable')
  return { success: true, message: `Saved ${rows.length} slots successfully.` }
}