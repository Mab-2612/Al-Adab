'use server'

import { createAdminClient } from '@/utils/supabase/admin'
import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

// Duplicate helper for self-containment within this action file
async function generateUniqueEmail(supabase: any, firstName: string, lastName: string) {
  const cleanFirst = firstName.trim().toLowerCase().replace(/[^a-z0-9]/g, '')
  const cleanLast = lastName.trim().toLowerCase().replace(/[^a-z0-9]/g, '')
  
  const initial = cleanLast.charAt(0)
  // 👇 CHANGED: Using hyphen instead of dot
  const baseUsername = `${initial}-${cleanFirst}`
  const domain = 'aladab.ng'
  
  const { data: existingUsers } = await supabase
    .from('profiles')
    .select('email')
    .ilike('email', `${baseUsername}%@${domain}`)

  if (!existingUsers || existingUsers.length === 0) return `${baseUsername}@${domain}`

  const suffixes = existingUsers.map((u: any) => {
    const localPart = u.email.split('@')[0]
    const suffix = localPart.replace(baseUsername, '')
    return suffix === '' ? 0 : parseInt(suffix) || 0
  })

  const maxSuffix = Math.max(...suffixes)
  return `${baseUsername}${maxSuffix + 1}@${domain}`
}

export async function approveApplication(applicationId: string) {
  const supabaseAdmin = createAdminClient()
  const supabase = await createClient()

  // 1. Fetch Application
  const { data: app, error: fetchError } = await supabase
    .from('admissions')
    .select('*')
    .eq('id', applicationId)
    .single()

  if (fetchError || !app) return { error: 'Application not found.' }

  // 2. Generate Admission Number
  const admissionNumber = `ADAB/${new Date().getFullYear()}/${Math.floor(1000 + Math.random() * 9000)}`
  const defaultPassword = 'password123'

  // 3. Generate Friendly Email
  let loginEmail = await generateUniqueEmail(supabaseAdmin, app.first_name, app.last_name)

  // 4. Create Auth User
  let authData, authError;
  for (let i = 0; i < 3; i++) {
    const result = await supabaseAdmin.auth.admin.createUser({
      email: loginEmail,
      password: defaultPassword,
      email_confirm: true,
      user_metadata: { first_name: app.first_name, last_name: app.last_name }
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

  if (authError) return { error: 'Auth creation failed: ' + authError.message }
  
  const newUserId = authData?.user?.id
  if (!newUserId) return { error: 'Failed to create user ID' }

  // 5. Create Profile
  const { error: profileError } = await supabaseAdmin.from('profiles').upsert({
    id: newUserId,
    first_name: app.first_name,
    last_name: app.last_name,
    role: 'student',
    phone_number: app.phone,
    email: app.email // Important: Keep parent email here for notifications
  })

  if (profileError) return { error: 'Profile creation failed: ' + profileError.message }

  // 6. Create Student Record
  const { error: studentError } = await supabaseAdmin.from('students').insert({
    profile_id: newUserId,
    admission_number: admissionNumber,
    current_class_id: app.class_id,
    gender: app.gender,
    dob: app.dob,
    address: app.address
  })

  if (studentError) {
    await supabaseAdmin.auth.admin.deleteUser(newUserId)
    return { error: 'Student record creation failed: ' + studentError.message }
  }

  // 7. Update Admission Status
  await supabaseAdmin
    .from('admissions')
    .update({ status: 'approved' })
    .eq('id', applicationId)

  revalidatePath('/admissions-portal')
  
  return { 
    success: true, 
    message: `Approved! Login: ${loginEmail}` 
  }
}

export async function rejectApplication(applicationId: string) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('admissions')
    .update({ status: 'rejected' })
    .eq('id', applicationId)

  if (error) return { error: error.message }
  
  revalidatePath('/admissions-portal')
  return { success: true, message: 'Application rejected.' }
}