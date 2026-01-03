import { createClient } from '@/utils/supabase/server'
import GalleryGrid from './GalleryGrid' // 👈 Import the Client Component

export default async function GalleryPage() {
  const supabase = await createClient()

  // 1. Fetch Real Images from DB
  const { data: images } = await supabase
    .from('gallery')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <div className="bg-white min-h-screen pb-20">
      
      {/* Header */}
      <div className="bg-slate-900 text-white py-20 px-6 text-center">
        <h1 className="text-4xl font-bold mb-4">School Gallery</h1>
        <p className="text-slate-400">Capturing moments of learning, joy, and growth.</p>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Pass data to the interactive grid */}
        <GalleryGrid images={images || []} />
      </div>
    </div>
  )
}