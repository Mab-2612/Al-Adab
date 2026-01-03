'use server'

import { createAdminClient } from '@/utils/supabase/admin'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function createStudent(formData: FormData) {
  const supabaseAdmin = createAdminClient()

  const firstName = formData.get('firstName') as string
  const lastName = formData.get('lastName') as string // Using as Other Names
  const email = formData.get('email') as string
  const password = 'password123'
  
  const admissionNumber = formData.get('admissionNumber') as string
  const gender = formData.get('gender') as string
  const classId = formData.get('classId') as string
  const dob = formData.get('dob') as string
  const phone = formData.get('phone') as string
  const department = formData.get('department') as string || null // 👈 NEW

  // ... (Auth creation logic remains same) ...
  const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { first_name: firstName, last_name: lastName }
  })

  if (authError) {
      // Handle collision logic or return error (keeping short for brevity, reuse previous logic)
      return { error: 'Auth error: ' + authError.message }
  }

  const newUserId = authData.user.id

  // Update Profile
  await supabaseAdmin.from('profiles').upsert({
    id: newUserId,
    first_name: firstName,
    last_name: lastName,
    role: 'student',
    phone_number: phone
  })

  // Insert Student
  const { error: studentError } = await supabaseAdmin
    .from('students')
    .insert({
      profile_id: newUserId,
      admission_number: admissionNumber,
      gender,
      current_class_id: classId,
      dob: dob || null,
      department: department // 👈 Save Department
    })

  if (studentError) {
    await supabaseAdmin.auth.admin.deleteUser(newUserId)
    return { error: 'Student creation failed: ' + studentError.message }
  }

  revalidatePath('/students')
  redirect('/students')
}

// Update Student
export async function updateStudent(studentId: string, profileId: string, formData: FormData) {
  const supabaseAdmin = createAdminClient()

  const firstName = formData.get('firstName') as string
  const lastName = formData.get('lastName') as string
  const admissionNumber = formData.get('admissionNumber') as string
  const classId = formData.get('classId') as string
  const gender = formData.get('gender') as string
  const dob = formData.get('dob') as string
  const phone = formData.get('phone') as string
  const department = formData.get('department') as string || null // 👈 NEW

  // Update Profile
  await supabaseAdmin.from('profiles').update({
      first_name: firstName,
      last_name: lastName,
      phone_number: phone
    }).eq('id', profileId)

  // Update Student
  const { error: studentError } = await supabaseAdmin
    .from('students')
    .update({
      admission_number: admissionNumber,
      current_class_id: classId,
      gender: gender,
      dob: dob || null,
      department: department // 👈 Update Department
    })
    .eq('id', studentId)

  if (studentError) return { error: 'Update failed' }

  revalidatePath('/students')
  redirect('/students')
}

// ... deleteStudent remains same ...
export async function deleteStudent(studentId: string, profileId: string) {
    // ... same code as before
    const supabaseAdmin = createAdminClient()
    await supabaseAdmin.from('students').delete().eq('id', studentId)
    await supabaseAdmin.auth.admin.deleteUser(profileId)
    revalidatePath('/students')
}