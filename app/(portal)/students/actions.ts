'use server'

import { createAdminClient } from '@/utils/supabase/admin'
import { revalidatePath } from 'next/cache'

// Helper to generate base email
function getBaseEmail(firstName: string, lastName: string) {
  const surname = lastName.trim().split(' ')[0].toLowerCase().replace(/[^a-z0-9]/g, '')
  const first = firstName.trim().toLowerCase().replace(/[^a-z0-9]/g, '')
  if (!surname || !first) return `student-${Date.now()}`
  const initial = surname.charAt(0)
  return `${initial}-${first}`
}

export async function createStudent(formData: FormData) {
  const supabaseAdmin = createAdminClient()
  // ... (Inputs extraction) ...
  const firstName = formData.get('firstName') as string
  const lastName = formData.get('lastName') as string
  const contactEmail = formData.get('email') as string
  const password = 'password123'
  const admissionNumber = formData.get('admissionNumber') as string
  const gender = formData.get('gender') as string
  const classId = formData.get('classId') as string
  const dob = formData.get('dob') as string
  const phone = formData.get('phone') as string
  const department = formData.get('department') as string || null

  const baseUsername = getBaseEmail(firstName, lastName)
  const domain = 'aladab.ng'
  
  let authData = null
  let authError = null
  let finalEmail = `${baseUsername}@${domain}`

  for (let i = 0; i < 10; i++) {
    if (i > 0) finalEmail = `${baseUsername}${i}@${domain}`
    const result = await supabaseAdmin.auth.admin.createUser({
      email: finalEmail, password, email_confirm: true,
      user_metadata: { first_name: firstName, last_name: lastName }
    })
    if (result.error) {
      if (result.error.message.toLowerCase().includes('registered') || result.error.status === 422) continue 
      authError = result.error
      break
    }
    authData = result.data
    break
  }

  if (authError) return { error: 'Auth error: ' + authError.message }
  if (!authData?.user) return { error: 'Failed to create user' }

  const newUserId = authData.user.id

  await supabaseAdmin.from('profiles').upsert({
    id: newUserId, first_name: firstName, last_name: lastName,
    role: 'student', phone_number: phone, email: contactEmail
  })

  const { error: studentError } = await supabaseAdmin.from('students').insert({
    profile_id: newUserId, admission_number: admissionNumber,
    gender, current_class_id: classId, dob: dob || null, department
  })

  if (studentError) {
    await supabaseAdmin.auth.admin.deleteUser(newUserId)
    return { error: 'Student creation failed: ' + studentError.message }
  }

  revalidatePath('/students')
  return { success: true, message: 'Student created successfully!' }
}

// 👇 UPDATED: Removed 'redirect', added return object
export async function updateStudent(studentId: string, profileId: string, formData: FormData) {
    const supabaseAdmin = createAdminClient()

    const firstName = formData.get('firstName') as string
    const lastName = formData.get('lastName') as string
    const admissionNumber = formData.get('admissionNumber') as string
    const classId = formData.get('classId') as string
    const gender = formData.get('gender') as string
    const dob = formData.get('dob') as string
    const phone = formData.get('phone') as string
    const department = formData.get('department') as string || null

    // Update Profile
    const { error: profileError } = await supabaseAdmin.from('profiles').update({
        first_name: firstName,
        last_name: lastName,
        phone_number: phone
    }).eq('id', profileId)

    if (profileError) return { error: 'Profile update failed: ' + profileError.message }

    // Update Student
    const { error: studentError } = await supabaseAdmin
      .from('students')
      .update({
          admission_number: admissionNumber,
          current_class_id: classId,
          gender, 
          dob: dob || null, 
          department
      }).eq('id', studentId)

    if (studentError) return { error: 'Student update failed: ' + studentError.message }

    revalidatePath('/students')
    // 👇 Returns success so client can handle redirect
    return { success: true, message: 'Student updated successfully.' }
}

export async function deleteStudent(studentId: string, profileId: string) {
    const supabaseAdmin = createAdminClient()
    const { error } = await supabaseAdmin.auth.admin.deleteUser(profileId)
    if (error) return { error: error.message }
    revalidatePath('/students')
    return { success: true, message: 'Student deleted successfully' }
}

export async function generateStudentLogin(studentId: string, profileId: string, admissionNumber: string) {
  const supabaseAdmin = createAdminClient()
  const defaultPassword = 'password123'
  const { error } = await supabaseAdmin.auth.admin.updateUserById(profileId, {
    password: defaultPassword, email_confirm: true 
  })
  if (error) return { error: 'Password reset failed: ' + error.message }
  return { success: true, message: `Password reset to '${defaultPassword}'` }
}

export async function getStudentLoginEmail(profileId: string) {
  const supabaseAdmin = createAdminClient()
  const { data: { user }, error } = await supabaseAdmin.auth.admin.getUserById(profileId)
  if (error || !user) return null
  return user.email
}