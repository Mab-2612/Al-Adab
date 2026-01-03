import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import Image from 'next/image'
import { Calendar, ArrowRight } from 'lucide-react'

export default async function BlogPage() {
  const supabase = await createClient()
  const { data: posts } = await supabase.from('posts').select('*').eq('published', true).order('created_at', { ascending: false })

  return (
    <div className="bg-white min-h-screen pb-20">
      
      {/* Header */}
      <div className="bg-slate-900 text-white py-20 px-6 text-center">
        <h1 className="text-4xl font-bold mb-4">School News</h1>
        <p className="text-slate-400">Updates, stories, and achievements from Al-Adab.</p>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {posts?.map((post) => (
            <Link key={post.id} href={`/blog/${post.slug}`} className="group flex flex-col bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all">
              
              {/* Image */}
              <div className="aspect-[16/9] bg-slate-100 relative overflow-hidden">
                {post.image_url ? (
                  <Image 
                    src={post.image_url} 
                    alt={post.title} 
                    fill 
                    className="object-cover group-hover:scale-105 transition-transform duration-500" 
                  />
                ) : (
                  <div className="absolute inset-0 bg-blue-50 flex items-center justify-center text-blue-200 font-bold text-4xl">Aa</div>
                )}
              </div>

              {/* Content */}
              <div className="p-6 flex-1 flex flex-col">
                <div className="flex items-center gap-2 text-xs text-slate-400 mb-3">
                  <Calendar className="w-3 h-3" />
                  {new Date(post.created_at).toLocaleDateString()}
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-blue-600 transition-colors line-clamp-2">
                  {post.title}
                </h3>
                <p className="text-slate-500 text-sm line-clamp-3 mb-4 flex-1">
                  {post.excerpt}
                </p>
                <span className="text-blue-600 text-sm font-bold flex items-center gap-1 group-hover:gap-2 transition-all">
                  Read Article <ArrowRight className="w-4 h-4" />
                </span>
              </div>

            </Link>
          ))}
        </div>

        {posts?.length === 0 && (
          <div className="text-center py-20">
            <p className="text-slate-400 text-lg">No news articles published yet.</p>
          </div>
        )}
      </div>
    </div>
  )
}