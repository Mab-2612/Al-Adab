'use server'

import { createAdminClient } from '@/utils/supabase/admin'
import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

// ✅ APPROVE APPLICATION
export async function approveApplication(applicationId: string) {
  const supabaseAdmin = createAdminClient()
  const supabase = await createClient()

  // 1. Fetch the Application Details
  const { data: app, error: fetchError } = await supabase
    .from('admissions')
    .select('*')
    .eq('id', applicationId)
    .single()

  if (fetchError || !app) return { error: 'Application not found.' }

  // 2. Generate Admission Number First (We need it for the fallback email)
  // Format: ADAB/YEAR/RANDOM (e.g., ADAB/2025/4821)
  const admissionNumber = `ADAB/${new Date().getFullYear()}/${Math.floor(1000 + Math.random() * 9000)}`
  const defaultPassword = 'password123'

  // 3. Create the Auth User (Smart Retry Logic)
  let userId = ''
  let finalEmail = app.email
  let emailNote = '' // To tell the admin if we changed the email

  // Attempt 1: Use the provided email
  const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
    email: app.email,
    password: defaultPassword,
    email_confirm: true,
    user_metadata: { first_name: app.first_name, last_name: app.last_name }
  })

  if (!authError && authData.user) {
    userId = authData.user.id
  } else if (authError?.message.includes('already registered') || authError?.status === 422) {
    // ⚠️ COLLISION DETECTED: Parent is enrolling a second child
    // Fallback: Generate a unique student email using Admission Number
    // e.g., ADAB20254821@student.aladab.com (Sanitized)
    const sanitizedAdm = admissionNumber.replace(/\//g, '')
    finalEmail = `${sanitizedAdm}@student.aladab.com`.toLowerCase()
    
    console.log(`Email collision for ${app.email}. Generating student email: ${finalEmail}`)

    const { data: retryData, error: retryError } = await supabaseAdmin.auth.admin.createUser({
      email: finalEmail,
      password: defaultPassword,
      email_confirm: true,
      user_metadata: { first_name: app.first_name, last_name: app.last_name }
    })

    if (retryError || !retryData.user) {
      return { error: 'Failed to create user even with generated email: ' + retryError?.message }
    }

    userId = retryData.user.id
    emailNote = ` (Login: ${finalEmail})` // Inform admin of the new login
  } else {
    // Some other error occurred
    return { error: 'Auth creation failed: ' + authError?.message }
  }

  // 4. Create Profile
  // We use upsert to be safe, but usually this is a fresh insert
  const { error: profileError } = await supabaseAdmin.from('profiles').upsert({
    id: userId,
    first_name: app.first_name,
    last_name: app.last_name,
    role: 'student',
    phone_number: app.phone,
    email: finalEmail // Save the actual login email here
  })

  if (profileError) return { error: 'Profile creation failed: ' + profileError.message }

  // 5. Create Student Record
  const { error: studentError } = await supabaseAdmin.from('students').insert({
    profile_id: userId,
    admission_number: admissionNumber,
    current_class_id: app.class_id,
    gender: app.gender,
    dob: app.dob,
    address: app.address
  })

  if (studentError) {
    // Rollback: Delete the user if student data fails (keeps DB clean)
    await supabaseAdmin.auth.admin.deleteUser(userId)
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
    message: `Approved! Admission No: ${admissionNumber}${emailNote}` 
  }
}

// ❌ REJECT APPLICATION
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