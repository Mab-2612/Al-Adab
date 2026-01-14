'use server'

import { createAdminClient } from '@/utils/supabase/admin'
import { revalidatePath } from 'next/cache'

// Helper to generate base email: surname-firstname
function getBaseEmail(firstName: string, lastName: string) {
  const surname = lastName.trim().split(' ')[0].toLowerCase().replace(/[^a-z0-9]/g, '')
  const first = firstName.trim().toLowerCase().replace(/[^a-z0-9]/g, '')
  if (!surname || !first) return `student-${Date.now()}`
  const initial = surname.charAt(0)
  return `${initial}-${first}`
}

// 👇 UPDATED: Bulk Creation with new columns and validation
export async function bulkCreateStudents(classId: string, bulkData: string) {
  const supabaseAdmin = createAdminClient()
  const password = 'password123'
  
  // 1. Fetch Class Info to enforce Department rule
  const { data: classInfo } = await supabaseAdmin
    .from('classes')
    .select('name, section')
    .eq('id', classId)
    .single()
    
  const isSenior = classInfo?.name.includes('SSS') || classInfo?.section?.includes('Senior')

  const lines = bulkData.split('\n').filter(line => line.trim() !== '')
  let successCount = 0
  let errors: string[] = []

  for (const line of lines) {
    // Expected CSV Format: 
    // Surname, FirstName, OtherNames, Gender, DOB, Phone, Department
    const cols = line.split(',').map(s => s.trim())
    
    // Basic Validation
    if (cols.length < 2) {
      errors.push(`Skipped "${line}": Invalid format. Needs at least Surname, FirstName.`)
      continue
    }

    const surname = cols[0]
    const firstName = cols[1]
    const otherNames = cols[2] || ''
    const gender = cols[3] || 'Male'
    const dob = cols[4] || null // Expected YYYY-MM-DD
    const phone = cols[5] || ''
    const department = cols[6] || null

    // Combined Last Name (Surname + Other Names)
    const fullLastName = `${surname} ${otherNames}`.trim()

    // 🚨 Strict Rule: Department Compulsory for SSS
    if (isSenior && !department) {
      errors.push(`Skipped "${surname} ${firstName}": Department is required for Senior classes.`)
      continue
    }
    
    // Generate Credentials
    const baseUsername = getBaseEmail(firstName, surname)
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
        user_metadata: { first_name: firstName, last_name: fullLastName }
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
      errors.push(`Failed to create account for ${surname} ${firstName}`)
      continue
    }

    const newUserId = authData.user.id

    // DB Insertions
    await supabaseAdmin.from('profiles').upsert({
      id: newUserId,
      first_name: firstName,
      last_name: fullLastName,
      role: 'student',
      phone_number: phone // 👈 Saved Parent Phone
    })

    const { error: studentError } = await supabaseAdmin.from('students').insert({
      profile_id: newUserId,
      admission_number: admissionNumber,
      current_class_id: classId,
      gender: gender,
      dob: dob, // 👈 Saved DOB
      department: department
    })

    if (studentError) {
      await supabaseAdmin.auth.admin.deleteUser(newUserId)
      errors.push(`DB Error for ${surname} ${firstName}: ${studentError.message}`)
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

// ... (Rest of the file: createStudent, updateStudent, etc. remain unchanged) ...
export async function createStudent(formData: FormData) {
  const supabaseAdmin = createAdminClient()

  const firstName = formData.get('firstName') as string
  const lastName = formData.get('lastName') as string // "Other Names" (Surname First)
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

  await supabaseAdmin.from('profiles').upsert({
    id: newUserId,
    first_name: firstName,
    last_name: lastName,
    role: 'student',
    phone_number: phone,
    email: contactEmail
  })

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