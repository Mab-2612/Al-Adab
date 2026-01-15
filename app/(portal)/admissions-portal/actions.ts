'use server'

import { createAdminClient } from '@/utils/supabase/admin'
import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

// Helper to generate base email
function getBaseEmail(firstName: string, lastName: string) {
  const cleanFirst = firstName.trim().toLowerCase().replace(/[^a-z0-9]/g, '')
  const cleanLast = lastName.trim().toLowerCase().replace(/[^a-z0-9]/g, '')
  const initial = cleanLast.charAt(0)
  return `${initial}-${cleanFirst}`
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
  const admissionNumber = `ALCCO/${new Date().getFullYear()}/${Math.floor(1000 + Math.random() * 9000)}`
  const defaultPassword = 'password123'

  // 3. Generate Friendly Email
  const baseUsername = getBaseEmail(app.first_name, app.last_name)
  const domain = 'aladab.ng'
  
  let loginEmail = `${baseUsername}@${domain}`
  let authData, authError
  
  // Retry loop for email generation
  for (let i = 0; i < 10; i++) {
    if (i > 0) loginEmail = `${baseUsername}${i}@${domain}`
    
    const result = await supabaseAdmin.auth.admin.createUser({
      email: loginEmail,
      password: defaultPassword,
      email_confirm: true,
      user_metadata: { first_name: app.first_name, last_name: app.last_name }
    })
    
    if (result.error) {
       if (result.error.message.includes('registered')) continue
       authError = result.error
       break
    }
    authData = result.data
    break
  }

  if (authError) return { error: 'Auth creation failed: ' + authError.message }
  
  const newUserId = authData?.user?.id
  if (!newUserId) return { error: 'Failed to create user ID' }

  // 4. Create Profile
  const { error: profileError } = await supabaseAdmin.from('profiles').upsert({
    id: newUserId,
    first_name: app.first_name,
    last_name: app.last_name,
    role: 'student',
    phone_number: app.phone,
    email: loginEmail // 👈 FIX: Save Student Login Email, NOT app.email (Parent)
  })

  if (profileError) return { error: 'Profile creation failed: ' + profileError.message }

  // 5. Create Student Record
  // (Optional: We could save app.email here as 'parent_email' if we added that column to students table)
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

  // 6. Update Admission Status
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