'use client'

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LogIn, GraduationCap, BookOpen, Menu, X } from 'lucide-react'
import { useState } from "react"

const navLinks = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Gallery", href: "/gallery" },
  { label: "News", href: "/blog" },
  { label: "Contact", href: "/contact" },
]

export default function Navbar() {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)

  // Helper to check active state
  // We check if pathname starts with href (for nested pages like /blog/slug), 
  // but strictly for Home ('/') to avoid it being active everywhere.
  const isActive = (href: string) => {
    if (href === '/') return pathname === '/'
    return pathname.startsWith(href)
  }

  return (
    <nav className="fixed top-0 w-full z-50 bg-white/90 backdrop-blur-xl border-b border-slate-200/60 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          
          {/* BRANDING */}
          <Link href="/" className="flex items-center gap-3 group z-50 relative">
            <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-600/20 group-hover:shadow-blue-600/30 group-hover:scale-105 transition-all duration-300">
              <BookOpen className="w-5 h-5" />
            </div>
            <div className="flex flex-col -space-y-0.5">
              <span className="font-extrabold text-xl text-slate-900 tracking-tight group-hover:text-blue-700 transition-colors duration-300">
                Al-Adab
              </span>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] group-hover:text-slate-700 pl-0.5">
                School
              </span>
            </div>
          </Link>

          {/* DESKTOP NAVIGATION */}
          <div className="hidden md:flex items-center gap-8 text-sm font-bold">
            {navLinks.map((link) => (
              <Link 
                key={link.href}
                href={link.href} 
                className={`transition-colors duration-200 ${
                  isActive(link.href) 
                    ? 'text-blue-600' 
                    : 'text-slate-600 hover:text-blue-600'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* DESKTOP ACTION BUTTONS */}
          <div className="hidden md:flex items-center gap-4">
            <Link 
              href="/login" 
              className="flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors px-3 py-2 rounded-lg hover:bg-slate-50"
            >
              <LogIn className="w-4 h-4" />
              Portal
            </Link>
            
            <Link 
              href="/admissions/apply" 
              className="flex items-center gap-2 bg-slate-900 text-white text-sm font-medium px-5 py-2.5 rounded-full hover:bg-slate-800 hover:shadow-lg hover:-translate-y-0.5 transition-all active:scale-95"
            >
              <GraduationCap className="w-4 h-4" />
              Apply Now
            </Link>
          </div>

          {/* MOBILE TOGGLE BUTTON */}
          <button 
            className="md:hidden relative z-50 p-2 text-slate-600"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>

        </div>
      </div>

      {/* MOBILE MENU DROPDOWN */}
      <div className={`fixed inset-0 bg-white z-40 transition-transform duration-300 md:hidden pt-24 px-6 ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex flex-col space-y-6 text-lg font-medium text-slate-900">
          {navLinks.map((link) => (
            <Link 
              key={link.href}
              href={link.href} 
              onClick={() => setIsOpen(false)}
              className={`pb-2 border-b border-slate-100 ${
                isActive(link.href) ? 'text-blue-600 border-blue-600' : 'text-slate-600'
              }`}
            >
              {link.label}
            </Link>
          ))}
          
          <div className="pt-6 space-y-4">
            <Link 
              href="/admissions/apply" 
              onClick={() => setIsOpen(false)}
              className="flex items-center justify-center gap-2 w-full bg-blue-600 text-white py-3 rounded-xl font-bold"
            >
              <GraduationCap className="w-5 h-5" />
              Apply Now
            </Link>
            <Link 
              href="/login" 
              onClick={() => setIsOpen(false)}
              className="flex items-center justify-center gap-2 w-full bg-slate-100 text-slate-700 py-3 rounded-xl font-bold"
            >
              <LogIn className="w-5 h-5" />
              Portal Login
            </Link>
          </div>
        </div>
      </div>
    </nav>
  )
}