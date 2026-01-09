'use server'

import { createAdminClient } from '@/utils/supabase/admin'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

// Helper to generate unique email: initial-firstname@aladab.ng
async function generateUniqueEmail(supabase: any, firstName: string, lastName: string) {
  const cleanFirst = firstName.trim().toLowerCase().replace(/[^a-z0-9]/g, '')
  const cleanLast = lastName.trim().toLowerCase().replace(/[^a-z0-9]/g, '')
  
  const initial = cleanLast.charAt(0)
  const baseUsername = `${initial}-${cleanFirst}`
  const domain = 'aladab.ng'
  
  const { data: existingUsers } = await supabase
    .from('profiles')
    .select('email')
    .ilike('email', `${baseUsername}%@${domain}`)

  if (!existingUsers || existingUsers.length === 0) {
    return `${baseUsername}@${domain}`
  }

  const suffixes = existingUsers.map((u: any) => {
    const localPart = u.email.split('@')[0]
    const suffix = localPart.replace(baseUsername, '')
    return suffix === '' ? 0 : parseInt(suffix) || 0
  })

  const maxSuffix = Math.max(...suffixes)
  return `${baseUsername}${maxSuffix + 1}@${domain}`
}

export async function createStudent(formData: FormData) {
  const supabaseAdmin = createAdminClient()

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

  let loginEmail = await generateUniqueEmail(supabaseAdmin, firstName, lastName)

  // 1. Create Auth User
  let authData, authError;
  for (let i = 0; i < 3; i++) {
    const result = await supabaseAdmin.auth.admin.createUser({
      email: loginEmail,
      password,
      email_confirm: true,
      user_metadata: { first_name: firstName, last_name: lastName }
    })
    
    if (result.error && result.error.message.includes('already registered')) {
       const base = loginEmail.split('@')[0]
       loginEmail = `${base}${Math.floor(Math.random() * 99)}@aladab.ng`
       continue;
    }
    
    authData = result.data;
    authError = result.error;
    break;
  }

  if (authError) return { error: 'Auth error: ' + authError.message }
  if (!authData?.user) return { error: 'Failed to create user' }

  const newUserId = authData.user.id

  // 2. Update Profile
  await supabaseAdmin.from('profiles').upsert({
    id: newUserId,
    first_name: firstName,
    last_name: lastName,
    role: 'student',
    phone_number: phone,
    email: contactEmail
  })

  // 3. Insert Student
  const { error: studentError } = await supabaseAdmin
    .from('students')
    .insert({
      profile_id: newUserId,
      admission_number: admissionNumber,
      gender,
      current_class_id: classId,
      dob: dob || null,
      department: department
    })

  if (studentError) {
    await supabaseAdmin.auth.admin.deleteUser(newUserId)
    return { error: 'Student creation failed: ' + studentError.message }
  }

  revalidatePath('/students')
  redirect('/students')
}

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

  await supabaseAdmin.from('profiles').update({
      first_name: firstName,
      last_name: lastName,
      phone_number: phone
    }).eq('id', profileId)

  const { error: studentError } = await supabaseAdmin
    .from('students')
    .update({
      admission_number: admissionNumber,
      current_class_id: classId,
      gender: gender,
      dob: dob || null,
      department: department
    })
    .eq('id', studentId)

  if (studentError) return { error: 'Update failed' }

  revalidatePath('/students')
  redirect('/students')
}

// 👇 THIS WAS MISSING OR BROKEN
export async function deleteStudent(studentId: string, profileId: string) {
    const supabaseAdmin = createAdminClient()
    
    // Delete auth user (Cascade deletes profile, and our SQL fixes ensure student record handles this)
    const { error } = await supabaseAdmin.auth.admin.deleteUser(profileId)
    
    if (error) return { success: false, message: error.message }
    
    revalidatePath('/students')
    return { success: true, message: 'Student deleted successfully' }
}

export async function getStudentLoginEmail(profileId: string) {
  const supabaseAdmin = createAdminClient()
  const { data: { user }, error } = await supabaseAdmin.auth.admin.getUserById(profileId)
  
  if (error || !user) return null
  return user.email
}

export async function generateStudentLogin(studentId: string, profileId: string, admissionNumber: string) {
  const supabaseAdmin = createAdminClient()

  const { data: profile } = await supabaseAdmin.from('profiles').select('first_name, last_name').eq('id', profileId).single()
  
  if (!profile) return { error: 'Profile not found' }

  const loginEmail = await generateUniqueEmail(supabaseAdmin, profile.first_name, profile.last_name)
  const defaultPassword = 'password123'

  const { error } = await supabaseAdmin.auth.admin.updateUserById(profileId, {
    email: loginEmail,
    password: defaultPassword,
    email_confirm: true
  })

  if (error) return { error: 'Failed to update login: ' + error.message }

  revalidatePath(`/students/${studentId}/edit`)
  return { success: true, message: `Login updated to: ${loginEmail}` }
}