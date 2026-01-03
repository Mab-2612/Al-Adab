'use server'

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export async function submitApplication(formData: FormData) {
  const supabase = await createClient()

  // 1. Extract Text Data
  const firstName = formData.get('firstName') as string
  const lastName = formData.get('lastName') as string
  const email = formData.get('email') as string
  const phone = formData.get('phone') as string
  const gender = formData.get('gender') as string
  const dob = formData.get('dob') as string
  const classId = formData.get('classId') as string
  const address = formData.get('address') as string

  // 2. Extract File (Passport)
  const passportFile = formData.get('passport') as File
  let passportUrl = ''

  if (passportFile && passportFile.size > 0) {
    // Generate unique filename: timestamp-filename
    const filename = `${Date.now()}-${passportFile.name.replace(/\s/g, '_')}`
    
    // Upload to Supabase Storage
    const { data, error: uploadError } = await supabase
      .storage
      .from('documents')
      .upload(`applicants/${filename}`, passportFile)

    if (uploadError) return { error: 'Image upload failed: ' + uploadError.message }

    // Get Public URL
    const { data: { publicUrl } } = supabase.storage.from('documents').getPublicUrl(data.path)
    passportUrl = publicUrl
  }

  // 3. Create a new table 'admissions' (We need to run SQL for this first!)
  // Since we haven't created the 'admissions' table yet, let's assume we create it next.
  
  const { error: dbError } = await supabase
    .from('admissions')
    .insert({
      first_name: firstName,
      last_name: lastName,
      email: email,
      phone: phone,
      gender: gender,
      dob: dob,
      class_id: classId,
      address: address,
      passport_url: passportUrl,
      status: 'pending' // Default status
    })

  if (dbError) return { error: dbError.message }

  redirect('/admissions/success')
}