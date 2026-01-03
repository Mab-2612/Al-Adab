import { Loader2 } from 'lucide-react'

export default function Loading() {
  return (
    <div className="flex h-[80vh] w-full items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          {/* Outer Ring */}
          <div className="h-16 w-16 rounded-full border-4 border-slate-200"></div>
          {/* Inner Spinning Ring */}
          <div className="absolute top-0 left-0 h-16 w-16 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
        </div>
        <p className="text-slate-500 font-medium animate-pulse">Loading Al-Adab Portal...</p>
      </div>
    </div>
  )
}