'use server'

import { createAdminClient } from '@/utils/supabase/admin'
import { revalidatePath } from 'next/cache'

// Helper to generate base email: surname-firstname
function getBaseEmail(firstName: string, lastName: string) {
  // Extract surname from "Other Names" (first word)
  const surname = lastName.trim().split(' ')[0].toLowerCase().replace(/[^a-z0-9]/g, '')
  const first = firstName.trim().toLowerCase().replace(/[^a-z0-9]/g, '')
  
  if (!surname || !first) return `student-${Date.now()}`
  
  // Format: s-firstname
  const initial = surname.charAt(0)
  return `${initial}-${first}`
}

// Data Type for Bulk Upload
type BulkStudentData = {
  surname: string
  firstName: string
  otherNames?: string
  gender: string
  dob?: string
  phone?: string
  department?: string
}

// 1. BULK CREATE
export async function bulkCreateStudents(classId: string, students: BulkStudentData[]) {
  const supabaseAdmin = createAdminClient()
  const password = 'password123'
  
  // Fetch Class Info to enforce Department rule
  const { data: classInfo } = await supabaseAdmin
    .from('classes')
    .select('name, section')
    .eq('id', classId)
    .single()
    
  const isSenior = classInfo?.name.includes('SSS') || classInfo?.section?.includes('Senior')

  let successCount = 0
  let errors: string[] = []

  for (const student of students) {
    if (!student.surname || !student.firstName) {
      errors.push(`Skipped row: Missing Name`)
      continue
    }

    if (isSenior && !student.department) {
      errors.push(`Skipped ${student.surname} ${student.firstName}: Department is required for Senior classes.`)
      continue
    }

    const fullLastName = `${student.surname} ${student.otherNames || ''}`.trim()
    
    // Generate Credentials
    const baseUsername = getBaseEmail(student.firstName, student.surname)
    const domain = 'aladab.ng'
    const admissionNumber = `ALCCO/${new Date().getFullYear()}/${Math.floor(1000 + Math.random() * 9000)}`
    
    let loginEmail = `${baseUsername}@${domain}`
    let authData, authError
    
    // Auth Creation Loop
    for (let i = 0; i < 10; i++) {
      if (i > 0) loginEmail = `${baseUsername}${i}@${domain}`
      
      const result = await supabaseAdmin.auth.admin.createUser({
        email: loginEmail,
        password,
        email_confirm: true,
        user_metadata: { first_name: student.firstName, last_name: fullLastName }
      })

      if (result.error) {
        if (result.error.message.toLowerCase().includes('registered') || result.error.status === 422) {
          continue 
        }
        authError = result.error
        break
      }
      authData = result.data
      break
    }

    if (!authData?.user) {
      errors.push(`Failed to create account for ${student.surname} ${student.firstName}`)
      continue
    }

    const newUserId = authData.user.id

    // DB Insertions
    await supabaseAdmin.from('profiles').upsert({
      id: newUserId,
      first_name: student.firstName,
      last_name: fullLastName,
      role: 'student',
      phone_number: student.phone,
      email: loginEmail // Correctly saves Student Email
    })

    const { error: studentError } = await supabaseAdmin.from('students').insert({
      profile_id: newUserId,
      admission_number: admissionNumber,
      current_class_id: classId,
      gender: student.gender || 'Male',
      dob: student.dob || null,
      department: student.department || null
    })

    if (studentError) {
      await supabaseAdmin.auth.admin.deleteUser(newUserId)
      errors.push(`DB Error for ${student.surname}: ${studentError.message}`)
    } else {
      successCount++
    }
  }

  revalidatePath('/students')
  return { 
    success: true, 
    message: `Successfully added ${successCount} students.`,
    errors: errors.length > 0 ? errors : undefined 
  }
}

// 2. SINGLE CREATE
export async function createStudent(formData: FormData) {
  const supabaseAdmin = createAdminClient()

  const firstName = formData.get('firstName') as string
  const lastName = formData.get('lastName') as string // "Other Names"
  // Note: surname is derived from lastName (Other Names) for email gen
  const surname = lastName.trim().split(' ')[0] 
  
  const contactEmail = formData.get('email') as string // Parent's email
  const password = 'password123'
  const admissionNumber = formData.get('admissionNumber') as string
  const gender = formData.get('gender') as string
  const classId = formData.get('classId') as string
  const dob = formData.get('dob') as string
  const phone = formData.get('phone') as string
  const department = formData.get('department') as string || null

  const baseUsername = getBaseEmail(firstName, surname)
  const domain = 'aladab.ng'
  
  let authData = null
  let authError = null
  let finalEmail = `${baseUsername}@${domain}`

  for (let i = 0; i < 10; i++) {
    if (i > 0) finalEmail = `${baseUsername}${i}@${domain}`

    const result = await supabaseAdmin.auth.admin.createUser({
      email: finalEmail,
      password,
      email_confirm: true,
      user_metadata: { first_name: firstName, last_name: lastName }
    })

    if (result.error) {
      if (result.error.message.toLowerCase().includes('registered') || result.error.status === 422) {
        continue 
      }
      authError = result.error
      break
    }
    authData = result.data
    break
  }

  if (authError) return { error: 'Auth error: ' + authError.message }
  if (!authData?.user) return { error: 'Failed to create user' }

  const newUserId = authData.user.id

  // Update Profile
  await supabaseAdmin.from('profiles').upsert({
    id: newUserId,
    first_name: firstName,
    last_name: lastName,
    role: 'student',
    phone_number: phone,
    email: finalEmail // FIX: Save student login email here so it shows in the list
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
      department: department
    })

  if (studentError) {
    await supabaseAdmin.auth.admin.deleteUser(newUserId)
    return { error: 'Student creation failed: ' + studentError.message }
  }

  revalidatePath('/students')
  return { success: true, message: 'Student created successfully!' }
}

// 3. UPDATE STUDENT
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

    const { error } = await supabaseAdmin.from('students').update({
        admission_number: admissionNumber,
        current_class_id: classId,
        gender, dob: dob || null, department
    }).eq('id', studentId)

    if (error) return { error: 'Update failed' }
    revalidatePath('/students')
    return { success: true, message: 'Student updated.' }
}

// 4. DELETE STUDENT
export async function deleteStudent(studentId: string, profileId: string) {
    const supabaseAdmin = createAdminClient()
    const { error } = await supabaseAdmin.auth.admin.deleteUser(profileId)
    if (error) return { error: error.message }
    revalidatePath('/students')
    return { success: true, message: 'Student deleted successfully' }
}

// 5. GENERATE/RESET LOGIN
export async function generateStudentLogin(studentId: string, profileId: string, admissionNumber: string) {
  const supabaseAdmin = createAdminClient()

  // 1. Get Profile to generate name-based email if needed
  const { data: profile } = await supabaseAdmin.from('profiles').select('first_name, last_name').eq('id', profileId).single()
  if (!profile) return { error: 'Profile not found' }

  // 2. Get Current Auth Data
  const { data: { user }, error: authError } = await supabaseAdmin.auth.admin.getUserById(profileId)
  if (authError || !user) return { error: 'Auth user not found.' }

  const currentEmail = user.email || ''
  const defaultPassword = 'password123'
  const domain = 'aladab.ng'
  
  // 3. Check if we need to migrate email or just reset password
  const needsEmailUpdate = !currentEmail.endsWith(`@${domain}`)
  let finalEmail = currentEmail

  if (needsEmailUpdate) {
     // Generate NEW email only if current one is "wrong" (e.g. gmail)
     // Use first word of last_name as surname for consistency
     const surname = profile.last_name.trim().split(' ')[0]
     const baseUsername = getBaseEmail(profile.first_name, surname)
     finalEmail = `${baseUsername}@${domain}`
     
     let updateError = null
     for (let i = 0; i < 10; i++) {
        if (i > 0) finalEmail = `${baseUsername}${i}@${domain}`
        
        const { error } = await supabaseAdmin.auth.admin.updateUserById(profileId, {
           email: finalEmail,
           password: defaultPassword,
           email_confirm: true
        })
        
        if (error) {
           if (error.message.toLowerCase().includes('registered') || error.status === 422) continue
           updateError = error
           break
        }
        updateError = null
        break 
     }
     if (updateError) return { error: 'Failed to update login: ' + updateError.message }

     // Also update profile table so list view is correct
     await supabaseAdmin.from('profiles').update({ email: finalEmail }).eq('id', profileId)

  } else {
     const { error: resetError } = await supabaseAdmin.auth.admin.updateUserById(profileId, {
        password: defaultPassword,
        email_confirm: true 
     })
     if (resetError) return { error: 'Password reset failed: ' + resetError.message }
  }

  revalidatePath(`/students/${studentId}/edit`)
  revalidatePath('/students') 
  
  if (needsEmailUpdate) {
    return { success: true, message: `Migrated! New Login: ${finalEmail}` }
  } else {
    return { success: true, message: `Password reset to '${defaultPassword}'. Email remains ${finalEmail}` }
  }
}

// 6. GET LOGIN EMAIL
export async function getStudentLoginEmail(profileId: string) {
  const supabaseAdmin = createAdminClient()
  const { data: { user }, error } = await supabaseAdmin.auth.admin.getUserById(profileId)
  if (error || !user) return null
  return user.email
}