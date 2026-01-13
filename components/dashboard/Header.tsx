'use client'

import { Menu, ChevronDown } from 'lucide-react' // Removed Bell from here
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import NotificationBell from './NotificationBell' // 👈 Import new component

// Map database roles to Display Titles
const roleLabels: Record<string, string> = {
  admin: 'Diretor',
  teacher: 'Academic Staff',
  student: 'Student',
  parent: 'Parent'
}

export default function Header({ onMenuClick, userProfile }: { onMenuClick: () => void, userProfile: any }) {
  const router = useRouter()
  const supabase = createClient()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const displayName = userProfile?.first_name 
    ? `${userProfile?.first_name} ${userProfile?.last_name || ''}`
    : 'User'

  const displayRole = roleLabels[userProfile?.role] || userProfile?.role || 'Guest'

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white/80 backdrop-blur-md">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        
        {/* LEFT SIDE: Branding */}
        <div className="flex items-center gap-3">
          
          <div className="md:hidden font-bold text-lg text-slate-800 flex items-center gap-0">
            <div className="relative w-20 h-20 shrink-0 rounded-lg flex items-center justify-center overflow-hidden border-slate-100">
               <Image 
                 src="/logo.png" 
                 alt="Logo" 
                 fill 
                 sizes="32px" 
                 className="object-contain p-0.5" 
                 unoptimized 
               />
            </div>
            <span>Al-Adab</span>
          </div>

          <div className="hidden md:block">
            <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide">School Portal</h2>
          </div>
        </div>

        {/* RIGHT SIDE: Profile, Notifications & Hamburger */}
        <div className="flex items-center gap-2 sm:gap-4">
          
          {/* 👇 REPLACED: Smart Bell Component */}
          <NotificationBell />

          <div className="h-8 w-px bg-slate-200 mx-1 hidden sm:block"></div>

          {/* User Profile */}
          <div className="flex items-center gap-3 pl-1 cursor-pointer group">
            <div className={`w-9 h-9 rounded-full border flex items-center justify-center font-bold text-white shadow-sm ${
               userProfile?.role === 'admin' ? 'bg-purple-600 border-purple-200' : 'bg-blue-600 border-blue-200'
            }`}>
              {userProfile?.first_name?.[0] || 'U'}
            </div>
            
            <div className="hidden sm:block text-left">
              <p className="text-sm font-bold text-slate-700 group-hover:text-blue-600 transition-colors">
                {displayName}
              </p>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                {displayRole}
              </p>
            </div>
            <ChevronDown className="w-4 h-4 text-slate-400 hidden sm:block" />
          </div>

          {/* Hamburger (Mobile) */}
          <div className="pl-2 border-l border-slate-200 ml-1 md:hidden">
            <button 
              onClick={onMenuClick}
              className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              aria-label="Open Sidebar"
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>

        </div>
      </div>
    </header>
  )
}