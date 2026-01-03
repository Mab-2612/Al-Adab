'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

// --- SUBJECTS ---

export async function createSubject(formData: FormData) {
  const supabase = await createClient()

  const name = formData.get('name') as string
  const code = formData.get('code') as string
  const category = formData.get('category') as string
  const teacherId = formData.get('teacherId') as string || null
  const isCompulsory = formData.get('isCompulsory') === 'on'
  const departmentTarget = formData.get('departmentTarget') as string || null // 👈 NEW

  const { error } = await supabase
    .from('subjects')
    .insert({ 
      name, 
      code, 
      category, 
      teacher_id: teacherId, 
      is_compulsory: isCompulsory,
      department_target: departmentTarget 
    })

  if (error) return { success: false, message: error.message }

  revalidatePath('/academics/subjects')
  return { success: true, message: 'Subject created successfully' }
}

export async function updateSubject(id: string, formData: FormData) {
  const supabase = await createClient()

  const name = formData.get('name') as string
  const code = formData.get('code') as string
  const category = formData.get('category') as string
  const teacherId = formData.get('teacherId') as string || null
  const isCompulsory = formData.get('isCompulsory') === 'on'
  const departmentTarget = formData.get('departmentTarget') as string || null // 👈 NEW

  const { error } = await supabase
    .from('subjects')
    .update({ 
      name, 
      code, 
      category, 
      teacher_id: teacherId,
      is_compulsory: isCompulsory,
      department_target: departmentTarget
    })
    .eq('id', id)

  if (error) return { success: false, message: error.message }

  revalidatePath('/academics/subjects')
  return { success: true, message: 'Subject updated successfully' }
}

export async function deleteSubject(id: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('subjects').delete().eq('id', id)
  if (error) return { success: false, message: error.message }
  revalidatePath('/academics/subjects')
  return { success: true, message: 'Subject deleted successfully' }
}

// --- CLASSES ---

export async function updateClass(id: string, formData: FormData) {
  const supabase = await createClient()
  const name = formData.get('name') as string
  const teacherId = formData.get('teacherId') as string || null

  const { error } = await supabase
    .from('classes')
    .update({ name, class_teacher_id: teacherId })
    .eq('id', id)

  if (error) return { success: false, message: error.message }

  revalidatePath('/academics/classes')
  return { success: true, message: 'Class updated successfully' }
}