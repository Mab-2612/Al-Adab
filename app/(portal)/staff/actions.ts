'use server'

import { createAdminClient } from '@/utils/supabase/admin'
import { revalidatePath } from 'next/cache'

export async function createStaff(formData: FormData) {
  const supabaseAdmin = createAdminClient()

  const firstName = formData.get('firstName') as string
  const lastName = formData.get('lastName') as string
  const email = formData.get('email') as string
  const phone = formData.get('phone') as string
  const role = formData.get('role') as 'teacher' | 'admin'
  const specialization = formData.get('specialization') as string || null 
  const password = 'password123'

  const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { first_name: firstName, last_name: lastName }
  })

  if (authError) return { error: authError.message }
  if (!authData.user) return { error: 'Failed to create user' }

  const { error: profileError } = await supabaseAdmin.from('profiles').upsert({
    id: authData.user.id,
    first_name: firstName,
    last_name: lastName,
    email,
    phone_number: phone,
    role: role,
    specialization: role === 'teacher' ? specialization : null
  })

  if (profileError) return { error: 'Profile error: ' + profileError.message }

  revalidatePath('/staff')
  return { success: true, message: `${role === 'admin' ? 'Admin' : 'Teacher'} account created.` }
}

export async function deleteStaff(id: string) {
  const supabaseAdmin = createAdminClient()
  const { error } = await supabaseAdmin.auth.admin.deleteUser(id)
  if (error) return { error: error.message }
  revalidatePath('/staff')
  return { success: true, message: 'Staff account removed.' }
}

export async function updateStaff(id: string, formData: FormData) {
  const supabaseAdmin = createAdminClient()
  const firstName = formData.get('firstName') as string
  const lastName = formData.get('lastName') as string
  const phone = formData.get('phone') as string
  const role = formData.get('role') as 'teacher' | 'admin'
  const specialization = formData.get('specialization') as string || null

  const { error } = await supabaseAdmin.from('profiles').update({
    first_name: firstName,
    last_name: lastName,
    phone_number: phone,
    role: role,
    specialization: role === 'teacher' ? specialization : null
  }).eq('id', id)

  if (error) return { error: 'Update failed: ' + error.message }
  revalidatePath('/staff')
  return { success: true, message: 'Staff details updated.' }
}