'use client'

import { createPost, updatePost, deletePost } from './blog-actions'
import { PenTool, Trash2, Loader2, Image as ImageIcon, Pencil, X } from 'lucide-react'
import { useState, useRef } from 'react'
import { toast } from 'sonner'
import Image from 'next/image'

export default function BlogManager({ posts }: { posts: any[] }) {
  const [isSaving, setIsSaving] = useState(false)
  const [editingPost, setEditingPost] = useState<any>(null)
  const formRef = useRef<HTMLFormElement>(null)

  const handleSubmit = async (formData: FormData) => {
    setIsSaving(true)
    
    let res
    if (editingPost) {
      res = await updatePost(editingPost.id, formData)
    } else {
      res = await createPost(formData)
    }

    setIsSaving(false)

    if (res?.success) {
      toast.success(res.message)
      setEditingPost(null)
      formRef.current?.reset()
    } else {
      toast.error(res?.error)
    }
  }

  const handleEditClick = (post: any) => {
    setEditingPost(post)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const cancelEdit = () => {
    setEditingPost(null)
    formRef.current?.reset()
  }

  return (
    <div className="grid lg:grid-cols-3 gap-8">
      
      {/* LEFT: Editor Form */}
      <div className="lg:col-span-1">
        <div className={`bg-white p-6 rounded-xl border shadow-sm sticky top-24 transition-colors ${editingPost ? 'border-orange-200 ring-2 ring-orange-100' : 'border-slate-200'}`}>
          
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-slate-900 flex items-center gap-2">
              <PenTool className="w-5 h-5 text-orange-600" /> 
              {editingPost ? 'Edit Article' : 'Write Article'}
            </h3>
            {editingPost && (
              <button onClick={cancelEdit} className="text-xs flex items-center gap-1 text-slate-500 hover:text-red-600 px-2 py-1 rounded bg-slate-100 hover:bg-red-50">
                <X className="w-3 h-3" /> Cancel
              </button>
            )}
          </div>

          <form ref={formRef} action={handleSubmit} className="space-y-4">
            <div key={editingPost?.id || 'new'}>
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Title</label>
                <input 
                  name="title" 
                  defaultValue={editingPost?.title} 
                  required 
                  placeholder="e.g. Inter-house Sports 2024" 
                  className="w-full p-2.5 border rounded-lg outline-none focus:ring-2 focus:ring-orange-500" 
                />
              </div>
              
              <div className="mt-4">
                <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">
                  {editingPost ? 'Change Cover Image (Optional)' : 'Cover Image'}
                </label>
                <input type="file" name="image" accept="image/*" className="w-full p-2 border rounded-lg text-sm bg-slate-50" />
              </div>

              <div className="mt-4">
                <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Short Summary</label>
                <textarea 
                  name="excerpt" 
                  defaultValue={editingPost?.excerpt} 
                  rows={2} 
                  required 
                  placeholder="Brief preview..." 
                  className="w-full p-2.5 border rounded-lg outline-none focus:ring-2 focus:ring-orange-500"
                ></textarea>
              </div>

              <div className="mt-4">
                <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Content</label>
                <textarea 
                  name="content" 
                  defaultValue={editingPost?.content} 
                  rows={8} 
                  required 
                  placeholder="Write your story here..." 
                  className="w-full p-2.5 border rounded-lg outline-none focus:ring-2 focus:ring-orange-500"
                ></textarea>
              </div>
            </div>

            <button disabled={isSaving} className="w-full py-2.5 bg-orange-600 text-white rounded-lg font-bold hover:bg-orange-700 disabled:opacity-50 flex items-center justify-center gap-2 mt-4">
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : (editingPost ? 'Update Post' : 'Publish Post')}
            </button>
          </form>
        </div>
      </div>

      {/* RIGHT: Post List */}
      <div className="lg:col-span-2 space-y-4">
        {posts.map((post) => (
          <div key={post.id} className={`bg-white p-4 rounded-xl border flex gap-4 group transition-all ${editingPost?.id === post.id ? 'border-orange-400 shadow-md bg-orange-50' : 'border-slate-200 shadow-sm'}`}>
            <div className="w-24 h-24 bg-slate-100 rounded-lg flex-shrink-0 relative overflow-hidden">
              {post.image_url ? (
                <Image src={post.image_url} alt={post.title} fill className="object-cover" />
              ) : (
                <ImageIcon className="w-8 h-8 text-slate-300 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
              )}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-start">
                 <h4 className="font-bold text-slate-900 truncate pr-2">{post.title}</h4>
                 <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => handleEditClick(post)}
                      className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Edit"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={async () => {
                        if(confirm('Delete post?')) {
                          await deletePost(post.id)
                          toast.success('Post deleted')
                        }
                      }}
                      className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                 </div>
              </div>
              
              {/* 👇 FIX: Suppress Hydration Warning for Date */}
              <p className="text-xs text-slate-500 mb-2" suppressHydrationWarning>
                {new Date(post.created_at).toLocaleDateString()}
              </p>
              
              <p className="text-sm text-slate-600 line-clamp-2">{post.excerpt}</p>
            </div>
          </div>
        ))}

        {posts.length === 0 && (
          <div className="text-center p-12 text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200">
            No blog posts published yet.
          </div>
        )}
      </div>
    </div>
  )
}