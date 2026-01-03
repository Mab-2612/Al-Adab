'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

// 🖼️ GALLERY ACTIONS
export async function uploadImage(formData: FormData) {
  const supabase = await createClient()

  const file = formData.get('file') as File
  const caption = formData.get('caption') as string
  const category = formData.get('category') as string

  if (!file) return { error: 'No file uploaded' }

  // 1. Upload to Supabase Storage
  const filename = `gallery/${Date.now()}-${file.name.replace(/\s/g, '_')}`
  const { data, error: uploadError } = await supabase
    .storage
    .from('documents') // Reusing the documents bucket
    .upload(filename, file)

  if (uploadError) return { error: 'Upload failed: ' + uploadError.message }

  // 2. Get Public URL
  const { data: { publicUrl } } = supabase.storage.from('documents').getPublicUrl(data.path)

  // 3. Save to DB
  const { error: dbError } = await supabase
    .from('gallery')
    .insert({ image_url: publicUrl, caption, category })

  if (dbError) return { error: dbError.message }

  revalidatePath('/website-admin')
  revalidatePath('/gallery') // Update public site
  return { success: true, message: 'Image uploaded successfully' }
}

export async function deleteImage(id: string) {
  const supabase = await createClient()
  await supabase.from('gallery').delete().eq('id', id)
  revalidatePath('/website-admin')
  revalidatePath('/gallery')
}

// 📅 EVENT ACTIONS
export async function createEvent(formData: FormData) {
  const supabase = await createClient()

  const title = formData.get('title') as string
  const date = formData.get('date') as string
  const location = formData.get('location') as string
  const description = formData.get('description') as string

  const { error } = await supabase
    .from('events')
    .insert({ title, date, location, description })

  if (error) return { error: error.message }

  revalidatePath('/website-admin')
  revalidatePath('/') // Update homepage
  return { success: true, message: 'Event created' }
}

export async function deleteEvent(id: string) {
  const supabase = await createClient()
  await supabase.from('events').delete().eq('id', id)
  revalidatePath('/website-admin')
}