'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

// --- CREATE ---
export async function createPost(formData: FormData) {
  const supabase = await createClient()

  try {
    const title = formData.get('title') as string
    const content = formData.get('content') as string
    const excerpt = formData.get('excerpt') as string
    const imageFile = formData.get('image') as File | null

    if (!title || !content) {
      return { error: 'Title and Content are required.' }
    }
    
    const slug = title.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '') + '-' + Date.now()
    let imageUrl = null

    // 1. Upload Image (If exists)
    if (imageFile && imageFile.size > 0) {
      // Basic size check (prevent crashes on huge files)
      if (imageFile.size > 5 * 1024 * 1024) return { error: 'Image must be less than 5MB' }

      const filename = `blog/${Date.now()}-${imageFile.name.replace(/[^a-zA-Z0-9.-]/g, '')}`
      
      const { data, error: uploadError } = await supabase.storage
        .from('documents')
        .upload(filename, imageFile)
      
      if (uploadError) return { error: 'Upload failed: ' + uploadError.message }

      // Get Public URL
      const { data: publicUrlData } = supabase.storage.from('documents').getPublicUrl(data.path)
      imageUrl = publicUrlData.publicUrl
    }

    // 2. Insert Record
    const { error: dbError } = await supabase
      .from('posts')
      .insert({ 
        title, 
        slug, 
        content, 
        excerpt, 
        image_url: imageUrl,
        published: true 
      })

    if (dbError) return { error: 'Database error: ' + dbError.message }

    revalidatePath('/blog')
    revalidatePath('/website-admin')
    return { success: true, message: 'Post published successfully!' }

  } catch (err: any) {
    return { error: 'Server error: ' + (err.message || 'Unknown') }
  }
}

// --- UPDATE (New!) ---
export async function updatePost(id: string, formData: FormData) {
  const supabase = await createClient()

  try {
    const title = formData.get('title') as string
    const content = formData.get('content') as string
    const excerpt = formData.get('excerpt') as string
    const imageFile = formData.get('image') as File | null

    const updates: any = { title, content, excerpt, updated_at: new Date().toISOString() }

    // Only upload if a NEW file is provided
    if (imageFile && imageFile.size > 0) {
      if (imageFile.size > 5 * 1024 * 1024) return { error: 'Image must be less than 5MB' }

      const filename = `blog/${Date.now()}-${imageFile.name.replace(/[^a-zA-Z0-9.-]/g, '')}`
      const { data, error: uploadError } = await supabase.storage
        .from('documents')
        .upload(filename, imageFile)
      
      if (uploadError) return { error: 'Upload failed: ' + uploadError.message }

      const { data: publicUrlData } = supabase.storage.from('documents').getPublicUrl(data.path)
      updates.image_url = publicUrlData.publicUrl
    }

    const { error } = await supabase
      .from('posts')
      .update(updates)
      .eq('id', id)

    if (error) return { error: error.message }

    revalidatePath('/blog')
    revalidatePath('/website-admin')
    return { success: true, message: 'Post updated successfully!' }

  } catch (err: any) {
    return { error: 'Server error: ' + (err.message || 'Unknown') }
  }
}

// --- DELETE ---
export async function deletePost(id: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('posts').delete().eq('id', id)
  
  if (error) return { error: error.message }

  revalidatePath('/blog')
  revalidatePath('/website-admin')
  return { success: true, message: 'Post deleted.' }
}