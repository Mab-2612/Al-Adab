'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  LayoutDashboard, 
  Users, 
  GraduationCap, 
  CreditCard, 
  FileText, 
  Settings, 
  LogOut,
  BookOpen,
  CalendarCheck,
  Megaphone,
  Globe,
  Shield,
  Loader2
} from 'lucide-react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

const allMenuItems = [
  { icon: LayoutDashboard, label: 'Overview', href: '/dashboard', roles: ['admin', 'teacher', 'student'] },
  { icon: Users, label: 'Students', href: '/students', roles: ['admin', 'teacher'] },
  { icon: BookOpen, label: 'Academics', href: '/academics/subjects', roles: ['admin', 'teacher'] },
  { icon: Users, label: 'Classes', href: '/academics/classes', roles: ['admin', 'teacher'] },
  { icon: CalendarCheck, label: 'Attendance', href: '/attendance', roles: ['admin', 'teacher'] },
  { icon: GraduationCap, label: 'Results', href: '/results/upload', roles: ['admin', 'teacher'] },
  { icon: CreditCard, label: 'Finance', href: '/finance', roles: ['admin'] },
  { icon: FileText, label: 'Admissions', href: '/admissions-portal', roles: ['admin'] },
  { icon: Megaphone, label: 'Notices', href: '/communication', roles: ['admin'] },
  { icon: Globe, label: 'Website CMS', href: '/website-admin', roles: ['admin'] },
  { icon: Shield, label: 'Staff', href: '/staff', roles: ['admin'] },
  { icon: Settings, label: 'Settings', href: '/settings', roles: ['admin', 'teacher', 'student'] },
]

export default function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()
  
  const [role, setRole] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function getRole() {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single()
          
          setRole(profile?.role || 'student')
        }
      } catch (error) {
        console.error('Error fetching role:', error)
      } finally {
        setLoading(false)
      }
    }
    getRole()
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const visibleItems = allMenuItems.filter(item => 
    role && item.roles.includes(role)
  )

  return (
    // 👇 FIX 1: Added 'overflow-hidden' to parent to prevent outer scrolling
    <aside className="w-64 bg-slate-900 text-white flex flex-col h-full border-r border-slate-800 overflow-hidden">
      
      {/* Brand */}
      <div className="h-16 flex items-center px-6 border-b border-slate-800 shrink-0">
        <div className="flex items-center gap-2 font-bold text-xl">
          <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center text-white">A</div>
          <span>Al-Adab Portal</span>
        </div>
      </div>

      {/* Navigation */}
      {/* 👇 FIX 2: Added 'min-h-0' which fixes flexbox scrolling bugs */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto custom-scrollbar min-h-0">
        
        {loading ? (
          <div className="flex flex-col items-center justify-center h-32 space-y-4 opacity-50">
            <Loader2 className="w-6 h-6 animate-spin" />
            <p className="text-xs text-slate-400">Loading menu...</p>
          </div>
        ) : (
          visibleItems.map((item) => {
            const isActive = item.href === '/dashboard' 
              ? pathname === '/dashboard' 
              : pathname.startsWith(item.href)

            return (
              <Link 
                key={item.href} 
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive 
                    ? 'bg-blue-600 text-white' 
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <item.icon className="w-5 h-5 flex-shrink-0" />
                <span className="font-medium">{item.label}</span>
              </Link>
            )
          })
        )}

      </nav>

      {/* Footer / Logout */}
      <div className="p-4 border-t border-slate-800 shrink-0">
        <button 
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 w-full rounded-lg text-red-400 hover:bg-red-900/20 hover:text-red-300 transition-colors"
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          <span className="font-medium">Sign Out</span>
        </button>
      </div>
    </aside>
  )
}