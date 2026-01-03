'use client'

import { submitApplication } from '../actions'
import { Upload, User, MapPin, ChevronRight, X, ImageIcon } from 'lucide-react'
import { useState, useRef } from 'react'
import { toast } from 'sonner' // 👈 Added for error reporting

export default function ApplicationForm({ classes }: { classes: any[] }) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const url = URL.createObjectURL(file)
      setPreviewUrl(url)
    } else {
      setPreviewUrl(null)
    }
  }

  const clearImage = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setPreviewUrl(null)
    
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  // 👇 FIX: Wrapper function to handle Types and Errors
  const handleSubmit = async (formData: FormData) => {
    const result = await submitApplication(formData)
    
    // If we get a result back, it means it failed (success redirects)
    if (result?.error) {
      toast.error(result.error)
    }
  }

  return (
    <form action={handleSubmit} className="space-y-6">
          
      {/* Section 1: Student Info */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 bg-slate-50/50 border-b border-slate-100 flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
            <User className="w-4 h-4" />
          </div>
          <h3 className="font-bold text-slate-900">Student Information</h3>
        </div>
        
        <div className="p-6 md:p-8 grid md:grid-cols-2 gap-6">
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-slate-700">First Name</label>
            <input name="firstName" required type="text" placeholder="e.g. Ibrahim" className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all placeholder:text-slate-400" />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-slate-700">Last Name</label>
            <input name="lastName" required type="text" placeholder="e.g. Musa" className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all placeholder:text-slate-400" />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-slate-700">Gender</label>
            <div className="relative">
              <select name="gender" className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all appearance-none bg-white">
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
                <ChevronRight className="w-4 h-4 rotate-90" />
              </div>
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-slate-700">Date of Birth</label>
            <input name="dob" type="date" className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all text-slate-600" />
          </div>
        </div>
      </div>

      {/* Section 2: Class & Contact */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 bg-slate-50/50 border-b border-slate-100 flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center">
            <MapPin className="w-4 h-4" />
          </div>
          <h3 className="font-bold text-slate-900">Contact & Class Selection</h3>
        </div>
        
        <div className="p-6 md:p-8 grid md:grid-cols-2 gap-6">
          <div className="md:col-span-2 space-y-1.5">
            <label className="text-sm font-semibold text-slate-700">Applying For Class</label>
            <div className="relative">
              <select name="classId" required className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 outline-none transition-all appearance-none bg-white font-medium text-lg">
                <option value="">Select a Class...</option>
                {classes?.map((c: any) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
               <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
                <ChevronRight className="w-4 h-4 rotate-90" />
              </div>
            </div>
          </div>

          <div className="md:col-span-2 space-y-1.5">
            <label className="text-sm font-semibold text-slate-700">Residential Address</label>
            <input name="address" required type="text" placeholder="Street address, City..." className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 outline-none transition-all placeholder:text-slate-400" />
          </div>
          
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-slate-700">Guardian Phone</label>
            <input name="phone" required type="tel" placeholder="080..." className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 outline-none transition-all placeholder:text-slate-400" />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-slate-700">Guardian Email</label>
            <input name="email" required type="email" placeholder="parent@example.com" className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 outline-none transition-all placeholder:text-slate-400" />
          </div>
        </div>
      </div>

      {/* Section 3: Upload with Preview */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 bg-slate-50/50 border-b border-slate-100 flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center">
            <Upload className="w-4 h-4" />
          </div>
          <h3 className="font-bold text-slate-900">Passport Photograph</h3>
        </div>
        
        <div className="p-6 md:p-8">
           <div className="flex flex-col md:flex-row gap-8 items-center">
             
             {/* Upload Area */}
             <div className="relative group cursor-pointer flex-1 w-full">
               <div className="border-2 border-dashed border-slate-300 rounded-xl p-8 flex flex-col items-center justify-center bg-slate-50 group-hover:bg-slate-100 group-hover:border-blue-400 transition-all h-64">
                  <div className="w-16 h-16 rounded-full bg-white shadow-sm flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                     <Upload className="w-8 h-8 text-blue-600" />
                  </div>
                  <p className="text-sm font-medium text-slate-900">Click to upload Passport</p>
                  <p className="text-xs text-slate-500 mt-1">JPG, PNG up to 2MB</p>
               </div>
               <input 
                 ref={fileInputRef}
                 type="file" 
                 name="passport" 
                 required 
                 accept="image/*" 
                 onChange={handleFileChange}
                 className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
               />
             </div>

             {/* Preview Area */}
             <div className="w-48 h-64 flex-shrink-0 relative bg-slate-100 rounded-xl border border-slate-200 flex items-center justify-center overflow-hidden">
               {previewUrl ? (
                 <>
                   <img 
                     src={previewUrl} 
                     alt="Preview" 
                     className="w-full h-full object-cover" 
                   />
                   <button 
                     type="button" 
                     onClick={clearImage}
                     className="absolute top-2 right-2 p-1.5 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors shadow-lg z-10"
                   >
                     <X className="w-4 h-4" />
                   </button>
                 </>
               ) : (
                 <div className="text-center p-4">
                   <ImageIcon className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                   <p className="text-xs text-slate-400">Preview will appear here</p>
                 </div>
               )}
             </div>

           </div>
        </div>
      </div>

      {/* Submit Action */}
      <div className="pt-4">
         <button type="submit" className="w-full py-4 bg-slate-900 text-white rounded-xl font-bold text-lg hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/20 active:scale-[0.99] flex items-center justify-center gap-2">
           Submit Application
           <ChevronRight className="w-5 h-5" />
         </button>
         <p className="text-center text-xs text-slate-500 mt-4">
           By clicking Submit, you agree to our Terms of Admission.
         </p>
      </div>

    </form>
  )
}