'use client'

import { useState } from 'react'
import Image from 'next/image'
import { X, ZoomIn, ImageIcon, Calendar } from 'lucide-react'

export default function GalleryGrid({ images }: { images: any[] }) {
  const [selectedImage, setSelectedImage] = useState<any>(null)

  return (
    <>
      {/* 1. THE GRID */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {images.map((img) => (
          <div 
            key={img.id} 
            onClick={() => setSelectedImage(img)}
            className="group relative aspect-[4/3] rounded-2xl overflow-hidden cursor-pointer shadow-sm hover:shadow-xl transition-all border border-slate-100"
          >
            <Image 
              src={img.image_url} 
              alt={img.caption || 'Gallery Image'} 
              fill 
              className="object-cover group-hover:scale-110 transition-transform duration-700" 
            />
            
            {/* Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity"></div>
            
            <div className="absolute inset-0 flex flex-col justify-end p-6 text-white">
              <div className="flex justify-between items-start translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                <div>
                   <span className="text-xs font-bold uppercase tracking-widest text-blue-300 mb-1 block">
                     {img.category || 'General'}
                   </span>
                   <p className="font-medium text-lg leading-tight mb-2">
                     {img.caption || 'School Moment'}
                   </p>
                   
                   {/* 👇 NEW: Timestamp */}
                   <div className="flex items-center gap-1.5 text-[10px] text-slate-300 font-medium opacity-0 group-hover:opacity-100 transition-opacity delay-100">
                     <Calendar className="w-3 h-3" />
                     <span>{new Date(img.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                   </div>
                </div>
                
                <ZoomIn className="w-5 h-5 text-white/70 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 mt-2" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {images.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-slate-400">
          <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-4">
            <ImageIcon className="w-10 h-10 opacity-50" />
          </div>
          <p className="text-lg font-medium">No photos uploaded yet.</p>
          <p className="text-sm">Check back later for updates!</p>
        </div>
      )}

      {/* 2. LIGHTBOX (EXPANDED VIEW) */}
      {selectedImage && (
        <div 
          className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-sm flex items-center justify-center p-4 md:p-8 animate-in fade-in duration-200"
          onClick={() => setSelectedImage(null)}
        >
          <button className="absolute top-4 right-4 p-2 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 rounded-full transition-colors z-50">
            <X className="w-8 h-8" />
          </button>

          <div 
            className="relative w-full max-w-5xl max-h-full flex flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative w-full aspect-video md:aspect-[16/9] rounded-lg overflow-hidden shadow-2xl">
              <Image 
                src={selectedImage.image_url} 
                alt={selectedImage.caption || 'Full view'} 
                fill 
                className="object-contain" 
                priority
              />
            </div>
            
            <div className="mt-4 text-center">
              <div className="flex items-center justify-center gap-3 mb-2">
                 <span className="inline-block px-3 py-1 rounded-full bg-white/10 text-blue-300 text-xs font-bold uppercase tracking-wider border border-white/20">
                    {selectedImage.category || 'Gallery'}
                 </span>
                 <span className="text-slate-400 text-xs flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {new Date(selectedImage.created_at).toLocaleDateString()}
                 </span>
              </div>
              <p className="text-white text-xl font-medium">
                {selectedImage.caption}
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  )
}