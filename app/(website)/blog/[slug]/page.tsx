import { createClient } from '@/utils/supabase/server'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeft, Calendar, User } from 'lucide-react'

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const supabase = await createClient()
  const { slug } = await params

  const { data: post } = await supabase
    .from('posts')
    .select('*')
    .eq('slug', slug)
    .single()

  if (!post) notFound()

  return (
    <div className="bg-white min-h-screen pb-20">
      
      {/* Hero Image */}
      {post.image_url && (
        <div className="relative h-[60vh] w-full">
          <Image src={post.image_url} alt={post.title} fill className="object-cover" priority />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
          <div className="absolute bottom-0 left-0 w-full p-6 md:p-12 text-white max-w-5xl mx-auto">
             <Link href="/blog" className="inline-flex items-center gap-2 text-slate-300 hover:text-white mb-6 transition-colors">
               <ArrowLeft className="w-4 h-4" /> Back to News
             </Link>
             <h1 className="text-4xl md:text-6xl font-bold leading-tight mb-4">{post.title}</h1>
             <div className="flex items-center gap-6 text-sm text-slate-300">
               <span className="flex items-center gap-2"><Calendar className="w-4 h-4" /> {new Date(post.created_at).toDateString()}</span>
               <span className="flex items-center gap-2"><User className="w-4 h-4" /> {post.author}</span>
             </div>
          </div>
        </div>
      )}

      {/* Content */}
      <article className={`max-w-3xl mx-auto px-6 ${post.image_url ? 'py-12' : 'pt-20'}`}>
        {!post.image_url && (
          <div className="mb-12 border-b border-slate-100 pb-8">
             <Link href="/blog" className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-900 mb-6 transition-colors">
               <ArrowLeft className="w-4 h-4" /> Back to News
             </Link>
             <h1 className="text-4xl font-bold text-slate-900 mb-4">{post.title}</h1>
             <p className="text-slate-500">{new Date(post.created_at).toDateString()}</p>
          </div>
        )}
        
        <div className="prose prose-lg prose-slate prose-blue max-w-none">
          {/* Simple line break rendering for now */}
          {post.content.split('\n').map((paragraph: string, i: number) => (
            <p key={i} className="mb-4 text-slate-700 leading-relaxed">
              {paragraph}
            </p>
          ))}
        </div>
      </article>

    </div>
  )
}