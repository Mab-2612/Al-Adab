'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createNotice(formData: FormData) {
  const supabase = await createClient()

  const title = formData.get('title') as string
  const content = formData.get('content') as string
  const audience = formData.get('audience') as string

  // Get current user ID for 'author'
  const { data: { user } } = await supabase.auth.getUser()

  const { error } = await supabase
    .from('notices')
    .insert({
      title,
      content,
      audience,
      author_id: user?.id
    })

  if (error) return { error: error.message }

  revalidatePath('/communication')
  revalidatePath('/dashboard') // Update dashboard immediately
  return { success: true, message: 'Notice posted successfully!' }
}

export async function deleteNotice(id: string) {
  const supabase = await createClient()
  await supabase.from('notices').delete().eq('id', id)
  
  revalidatePath('/communication')
  revalidatePath('/dashboard')
  return { success: true, message: 'Notice deleted.' }
}