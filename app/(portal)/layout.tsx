'use client'

import { useState, useEffect } from 'react'
import Sidebar from '@/components/dashboard/Sidebar'
import Header from '@/components/dashboard/Header'
import { createClient } from '@/utils/supabase/client'
import { X } from 'lucide-react'

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [userProfile, setUserProfile] = useState<any>(null)
  const supabase = createClient()

  useEffect(() => {
    async function getUser() {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single()
        setUserProfile(data)
      }
    }
    getUser()
  }, [])

  return (
    <div className="min-h-screen bg-slate-50 flex">
      
      {/* 1. DESKTOP SIDEBAR (Hidden on Mobile) */}
      <div className="hidden md:flex fixed left-0 top-0 bottom-0 z-50 h-full">
        <Sidebar />
      </div>

      {/* 2. MOBILE SIDEBAR OVERLAY (Visible when sidebarOpen is true) */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm transition-opacity"
            onClick={() => setSidebarOpen(false)}
          ></div>
          
          {/* Sidebar Panel */}
          <div className="absolute left-0 top-0 bottom-0 w-64 bg-slate-900 shadow-2xl transition-transform transform translate-x-0">
            <div className="relative h-full flex flex-col">
              {/* Close Button - positioned inside the sidebar context for clarity */}
              <button 
                onClick={() => setSidebarOpen(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-white z-10 p-1"
              >
                <X className="w-5 h-5" />
              </button>
              
              {/* Render Sidebar Content with Close Handler */}
              <Sidebar onClose={() => setSidebarOpen(false)} /> 
            </div>
          </div>
        </div>
      )}

      {/* 3. MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col md:ml-64 transition-all duration-300 min-h-screen">
        
        {/* Header */}
        <Header 
          onMenuClick={() => setSidebarOpen(true)} 
          userProfile={userProfile} 
        />

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  )
}