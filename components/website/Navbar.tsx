'use client'

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LogIn, GraduationCap, Menu, X } from 'lucide-react'
import { useState, useEffect } from "react"
import Image from 'next/image'

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
  const [scrolled, setScrolled] = useState(false)

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    setIsOpen(false)
  }, [pathname])

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/'
    return pathname.startsWith(href)
  }

  return (
    <nav 
      className={`fixed top-0 w-full z-50 transition-all duration-300 border-b ${
        isOpen || scrolled 
          ? 'bg-white border-slate-200 shadow-sm' 
          : 'bg-white/80 backdrop-blur-md border-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          
          {/* BRANDING */}
          <Link href="/" className="flex items-center gap-0 group z-50 relative">
            <div className="w-20 h-20 flex items-center justify-center group-hover:scale-105 transition-all duration-300 relative">
              <Image 
                src="/logo.png" 
                alt="Logo" 
                fill 
                className="object-contain"
                // 👇 FIX: Use unoptimized to guarantee crisp quality
                unoptimized
                priority
              />
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
            className="md:hidden relative z-50 p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle menu"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>

        </div>
      </div>

      {/* MOBILE MENU DROPDOWN */}
      <div 
        className={`fixed inset-0 bg-white z-40 transition-transform duration-300 ease-out md:hidden pt-24 px-6 ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex flex-col space-y-2 h-full pb-10">
          {navLinks.map((link) => (
            <Link 
              key={link.href}
              href={link.href} 
              onClick={() => setIsOpen(false)}
              className={`block w-full py-4 text-lg font-medium border-b border-slate-50 flex justify-between items-center ${
                isActive(link.href) ? 'text-blue-600' : 'text-slate-900'
              }`}
            >
              {link.label}
              {isActive(link.href) && <div className="w-1.5 h-1.5 rounded-full bg-blue-600"></div>}
            </Link>
          ))}
          
          <div className="pt-8 space-y-4 mt-auto">
            <Link 
              href="/admissions/apply" 
              onClick={() => setIsOpen(false)}
              className="flex items-center justify-center gap-2 w-full bg-blue-600 text-white py-4 rounded-xl font-bold shadow-lg shadow-blue-600/20 active:scale-95 transition-transform"
            >
              <GraduationCap className="w-5 h-5" />
              Apply Now
            </Link>
            <Link 
              href="/login" 
              onClick={() => setIsOpen(false)}
              className="flex items-center justify-center gap-2 w-full bg-slate-100 text-slate-700 py-4 rounded-xl font-bold hover:bg-slate-200 transition-colors"
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