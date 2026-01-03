'use client'

import { uploadImage, deleteImage } from './actions'
import { Upload, Trash2, Loader2, Image as ImageIcon } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import Image from 'next/image'

export default function GalleryManager({ images }: { images: any[] }) {
  const [isUploading, setIsUploading] = useState(false)

  const handleUpload = async (formData: FormData) => {
    setIsUploading(true)
    const res = await uploadImage(formData)
    setIsUploading(false)
    if (res?.success) toast.success(res.message)
    else toast.error(res?.error)
  }

  const handleDelete = async (id: string) => {
    if(!confirm('Delete this image?')) return
    await deleteImage(id)
    toast.success('Image deleted')
  }

  return (
    <div className="space-y-8">
      {/* Upload Form */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
          <Upload className="w-5 h-5 text-blue-600" /> Upload New Photo
        </h3>
        <form action={handleUpload} className="flex flex-col md:flex-row gap-4 items-end">
          <div className="w-full md:flex-1">
            <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Photo</label>
            <input type="file" name="file" required accept="image/*" className="w-full p-2 border rounded-lg text-sm" />
          </div>
          <div className="w-full md:w-48">
            <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Category</label>
            <select name="category" className="w-full p-2.5 border rounded-lg bg-white">
              <option>General</option>
              <option>Sports</option>
              <option>Academics</option>
              <option>Events</option>
            </select>
          </div>
          <div className="w-full md:flex-1">
            <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Caption</label>
            <input type="text" name="caption" placeholder="e.g. Sports Day 2024" className="w-full p-2.5 border rounded-lg" />
          </div>
          <button disabled={isUploading} className="px-6 py-2.5 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 disabled:opacity-50">
            {isUploading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Upload'}
          </button>
        </form>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {images.map((img) => (
          <div key={img.id} className="group relative aspect-square bg-slate-100 rounded-xl overflow-hidden border border-slate-200">
            <Image src={img.image_url} alt={img.caption || 'Gallery'} fill className="object-cover" />
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
              <button onClick={() => handleDelete(img.id)} className="p-2 bg-red-600 text-white rounded-full hover:bg-red-700">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
            <div className="absolute bottom-0 left-0 right-0 p-2 bg-black/60 text-white text-xs truncate">
              {img.caption || img.category}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}