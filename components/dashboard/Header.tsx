'use client'

import { Bell, Menu, Search, ChevronDown } from 'lucide-react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'

// Map database roles to Display Titles
const roleLabels: Record<string, string> = {
  admin: 'Super Admin',
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

  // Get display name or fallback
  const displayName = userProfile?.first_name 
    ? `${userProfile?.first_name} ${userProfile?.last_name || ''}`
    : 'User'

  // Get display role or fallback
  const displayRole = roleLabels[userProfile?.role] || userProfile?.role || 'Guest'

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white/80 backdrop-blur-md">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        
        {/* LEFT SIDE: Mobile Menu & Branding */}
        <div className="flex items-center gap-4">
          <button 
            onClick={onMenuClick}
            className="md:hidden p-2 -ml-2 text-slate-500 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <Menu className="w-6 h-6" />
          </button>
          
          {/* Mobile Only Logo */}
          <div className="md:hidden font-bold text-lg text-slate-800 flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white text-sm">A</div>
            <span>Al-Adab</span>
          </div>

          {/* Desktop Title */}
          <div className="hidden md:block">
            <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide">School Portal</h2>
          </div>
        </div>

        {/* RIGHT SIDE: Profile & Notifications */}
        <div className="flex items-center gap-2 sm:gap-4">
          
          <button className="relative p-2 text-slate-500 hover:bg-slate-100 rounded-full transition-colors">
            <Bell className="w-5 h-5" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
          </button>

          <div className="h-8 w-px bg-slate-200 mx-1 hidden sm:block"></div>

          {/* User Profile Dropdown Trigger */}
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

        </div>
      </div>
    </header>
  )
}