'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

// 1. Update Profile (Restricted)
export async function updateProfile(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'Not authenticated' }

  // Check Role
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  
  // Rule: Only Admins can update profiles directly. 
  // Students/Teachers cannot update via this form anymore.
  if (profile?.role !== 'admin') {
    return { error: 'Permission denied. Please contact the administrator to update your details.' }
  }

  const firstName = formData.get('firstName') as string
  const lastName = formData.get('lastName') as string
  const phone = formData.get('phone') as string

  const { error: profileError } = await supabase
    .from('profiles')
    .update({
      first_name: firstName,
      last_name: lastName, // We use this column for "Other Names"
      phone_number: phone
    })
    .eq('id', user.id)

  if (profileError) return { error: profileError.message }

  revalidatePath('/settings')
  return { success: true, message: 'Profile updated successfully.' }
}

// 2. Change Password (Allowed for everyone)
export async function changePassword(formData: FormData) {
  const supabase = await createClient()
  
  const password = formData.get('password') as string
  const confirm = formData.get('confirmPassword') as string

  if (password !== confirm) return { error: 'Passwords do not match.' }
  if (password.length < 6) return { error: 'Password must be at least 6 characters.' }

  const { error } = await supabase.auth.updateUser({ password })

  if (error) return { error: error.message }

  return { success: true, message: 'Password changed successfully.' }
}

// 3. Update System Configuration (Session & Term)
export async function updateSystemConfig(formData: FormData) {
  const supabase = await createClient()
  
  // Verify Admin
  const { data: { user } } = await supabase.auth.getUser()
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user?.id).single()
  
  if (profile?.role !== 'admin') return { error: 'Unauthorized.' }

  const sessionId = formData.get('sessionId') as string
  const currentTerm = formData.get('currentTerm') as string
  
  // 1. Set all sessions to false
  await supabase.from('academic_sessions').update({ is_current: false }).neq('id', '00000000-0000-0000-0000-000000000000')

  // 2. Set new active session AND term
  const { error } = await supabase
    .from('academic_sessions')
    .update({ 
      is_current: true,
      current_term: currentTerm 
    })
    .eq('id', sessionId)

  if (error) return { error: error.message }

  revalidatePath('/')
  return { success: true, message: 'System configuration updated.' }
}

// 4. Create New Session
export async function createSession(formData: FormData) {
  const supabase = await createClient()
  
  const name = formData.get('name') as string 
  const start = formData.get('startDate') as string
  const end = formData.get('endDate') as string

  const { error } = await supabase.from('academic_sessions').insert({
    name,
    start_date: start,
    end_date: end,
    is_current: false,
    current_term: '1st Term' // Default
  })

  if (error) return { error: error.message }

  revalidatePath('/settings')
  return { success: true, message: 'New session created.' }
}