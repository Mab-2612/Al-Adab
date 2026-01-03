import Image from 'next/image'
import { CheckCircle2, History, Target, Users } from 'lucide-react'

export default function AboutPage() {
  return (
    <div className="bg-white">
      
      {/* Header */}
      <div className="bg-slate-50 py-20 px-6 text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">About Al-Adab</h1>
        <p className="text-lg text-slate-600 max-w-2xl mx-auto">
          A legacy of excellence, discipline, and moral upbringing since 2008.
        </p>
      </div>

      {/* Vision & Mission */}
      <div className="max-w-7xl mx-auto px-6 py-20">
        <div className="grid md:grid-cols-2 gap-12">
          <div className="bg-blue-50 p-10 rounded-3xl">
            <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center text-white mb-6">
              <Target className="w-6 h-6" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-4">Our Mission</h3>
            <p className="text-slate-700 leading-relaxed">
              To provide a conducive learning environment that fosters academic excellence, moral discipline, and spiritual growth, producing well-rounded individuals capable of facing global challenges.
            </p>
          </div>
          <div className="bg-purple-50 p-10 rounded-3xl">
            <div className="w-12 h-12 bg-purple-600 rounded-xl flex items-center justify-center text-white mb-6">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-4">Our Vision</h3>
            <p className="text-slate-700 leading-relaxed">
              To be a leading institution recognized globally for producing intellectual giants who are grounded in Islamic values and ethics.
            </p>
          </div>
        </div>
      </div>

      {/* History */}
      <div className="max-w-4xl mx-auto px-6 py-20 border-t border-slate-100">
        <div className="flex gap-6 items-start">
          <div className="hidden md:flex flex-col items-center">
            <div className="w-10 h-10 bg-slate-900 rounded-full flex items-center justify-center text-white font-bold">
              <History className="w-5 h-5" />
            </div>
            <div className="w-px h-full bg-slate-200 my-4"></div>
          </div>
          <div className="space-y-8">
            <div>
              <h2 className="text-3xl font-bold text-slate-900 mb-6">Our History</h2>
              <p className="text-slate-600 leading-relaxed mb-6">
                Al-Adab School was founded in 2008 by a group of visionary educators who saw the need for a school that prioritized both Western education and Islamic Tarbiyah. Starting with just 50 students in a small rented apartment, we have grown into a diverse community of over 1,200 learners on a sprawling permanent campus.
              </p>
              <p className="text-slate-600 leading-relaxed">
                Over the years, we have consistently recorded 100% success in WAEC and NECO examinations, with our alumni excelling in top universities across the globe.
              </p>
            </div>
            
            <div className="grid grid-cols-2 gap-6">
              <div className="relative h-48 rounded-xl overflow-hidden">
                <Image src="/OldSchool.jpg" alt="Old building" fill className="object-cover" />
                <div className="absolute bottom-0 left-0 bg-black/60 text-white text-xs px-3 py-1">2015 Campus</div>
              </div>
              <div className="relative h-48 rounded-xl overflow-hidden">
                <Image src="/NewSchool.jpg" alt="New building" fill className="object-cover" />
                <div className="absolute bottom-0 left-0 bg-blue-600 text-white text-xs px-3 py-1">Present Day</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Virtual Tour / Facilities */}
      <div className="bg-slate-900 py-24 text-white text-center">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-3xl font-bold mb-4">Take a Virtual Tour</h2>
          <p className="text-slate-400 mb-12 max-w-2xl mx-auto">
            Explore our state-of-the-art facilities from the comfort of your home.
          </p>
          
          {/* Video Placeholder */}
          <div className="aspect-video bg-slate-800 rounded-2xl overflow-hidden relative group cursor-pointer border border-slate-700">
             <Image src="/NewSchool.jpg" alt="Campus Video" fill className="object-cover opacity-60 group-hover:opacity-40 transition-opacity" />
             <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                   <div className="w-0 h-0 border-t-[10px] border-t-transparent border-l-[20px] border-l-white border-b-[10px] border-b-transparent ml-1"></div>
                </div>
             </div>
          </div>
        </div>
      </div>

    </div>
  )
}