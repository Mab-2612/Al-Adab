import { createClient } from '@/utils/supabase/server'
import { Globe, Image as ImageIcon, Calendar, Newspaper, AlertCircle } from 'lucide-react'
import GalleryManager from './GalleryManager'
import EventsManager from './EventsManager'
import BlogManager from './BlogManager'

export default async function WebsiteAdminPage() {
  const supabase = await createClient()
  
  let gallery: any[] = []
  let events: any[] = []
  let posts: any[] = []
  let errorMsg = null

  try {
    // Fetch all data in parallel
    const [galleryRes, eventsRes, postsRes] = await Promise.all([
      supabase.from('gallery').select('*').order('created_at', { ascending: false }),
      supabase.from('events').select('*').order('date', { ascending: true }),
      supabase.from('posts').select('*').order('created_at', { ascending: false })
    ])

    if (galleryRes.error) console.error("Gallery Error:", galleryRes.error.message)
    if (eventsRes.error) console.error("Events Error:", eventsRes.error.message)
    if (postsRes.error) console.error("Posts Error:", postsRes.error.message)

    gallery = galleryRes.data || []
    events = eventsRes.data || []
    posts = postsRes.data || []

  } catch (err) {
    console.error("Critical Data Fetch Error:", err)
    errorMsg = "Connection failed. Please check your internet or restart the server."
  }

  return (
    <div className="max-w-6xl mx-auto pb-20 space-y-12">
      
      <div className="flex items-center gap-4 mb-8">
        <div className="p-3 bg-blue-100 text-blue-600 rounded-xl">
          <Globe className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Website Manager</h1>
          <p className="text-slate-500">Update content across the school website.</p>
        </div>
      </div>

      {errorMsg && (
        <div className="p-4 bg-red-50 text-red-700 border border-red-200 rounded-lg flex items-center gap-2">
          <AlertCircle className="w-5 h-5" />
          {errorMsg}
        </div>
      )}

      {/* Blog Section */}
      <section>
        <div className="flex items-center gap-2 mb-6 border-b border-slate-200 pb-2">
          <Newspaper className="w-5 h-5 text-orange-600" />
          <h2 className="text-lg font-bold text-slate-800">News & Blog</h2>
        </div>
        <BlogManager posts={posts} />
      </section>

      {/* Gallery Section */}
      <section>
        <div className="flex items-center gap-2 mb-6 border-b border-slate-200 pb-2">
          <ImageIcon className="w-5 h-5 text-blue-600" />
          <h2 className="text-lg font-bold text-slate-800">Photo Gallery</h2>
        </div>
        <GalleryManager images={gallery} />
      </section>

      {/* Events Section */}
      <section>
        <div className="flex items-center gap-2 mb-6 border-b border-slate-200 pb-2">
          <Calendar className="w-5 h-5 text-purple-600" />
          <h2 className="text-lg font-bold text-slate-800">Upcoming Events</h2>
        </div>
        <EventsManager events={events} />
      </section>

    </div>
  )
}