import Link from 'next/link'
import { Facebook, Twitter, Instagram, Linkedin, MapPin, Phone, Mail } from 'lucide-react'
import Image from 'next/image'

export default function Footer() {
  return (
    <footer className="bg-slate-950 text-slate-300 pt-16 pb-8 border-t border-slate-900">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          
          {/* Brand Column */}
          <div className="space-y-6">
            <div className="flex items-center gap-0 text-white">
              <div className="relative w-20 h-20 shrink-0">
                {/* 👇 FIX: Unoptimized for crisp logo */}
                <Image 
                  src="/logo.png" 
                  alt="Al-Adab Logo" 
                  fill
                  className="object-contain"
                  unoptimized
                />
              </div>
              <span className="font-bold text-xl tracking-tight">Al-Adab School</span>
            </div>
            <p className="text-sm leading-relaxed text-slate-400">
              Nurturing future leaders through a unique blend of academic excellence and moral integrity. Join us in shaping the next generation.
            </p>
            <div className="flex gap-4">
              <Link href="#" className="w-8 h-8 rounded-full bg-slate-900 flex items-center justify-center hover:bg-blue-600 hover:text-white transition-colors">
                <Facebook className="w-4 h-4" />
              </Link>
              <Link href="#" className="w-8 h-8 rounded-full bg-slate-900 flex items-center justify-center hover:bg-blue-400 hover:text-white transition-colors">
                <Twitter className="w-4 h-4" />
              </Link>
              <Link href="#" className="w-8 h-8 rounded-full bg-slate-900 flex items-center justify-center hover:bg-pink-600 hover:text-white transition-colors">
                <Instagram className="w-4 h-4" />
              </Link>
              <Link href="#" className="w-8 h-8 rounded-full bg-slate-900 flex items-center justify-center hover:bg-blue-700 hover:text-white transition-colors">
                <Linkedin className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-bold mb-6">Quick Links</h3>
            <ul className="space-y-4 text-sm">
              <li><Link href="/about" className="hover:text-blue-400 transition-colors">About Us</Link></li>
              <li><Link href="/admissions/apply" className="hover:text-blue-400 transition-colors">Admissions</Link></li>
              <li><Link href="/academics/subjects" className="hover:text-blue-400 transition-colors">Academics</Link></li>
              <li><Link href="/gallery" className="hover:text-blue-400 transition-colors">Gallery</Link></li>
              <li><Link href="/blog" className="hover:text-blue-400 transition-colors">School News</Link></li>
            </ul>
          </div>

          {/* Information */}
          {/* <div>
            <h3 className="text-white font-bold mb-6">Information</h3>
            <ul className="space-y-4 text-sm">
              <li><Link href="/login" className="hover:text-blue-400 transition-colors">Student Portal</Link></li>
              <li><Link href="/login" className="hover:text-blue-400 transition-colors">Staff Login</Link></li>
              <li><Link href="/calendar" className="hover:text-blue-400 transition-colors">Academic Calendar</Link></li>
              <li><Link href="/careers" className="hover:text-blue-400 transition-colors">Careers</Link></li>
              <li><Link href="/privacy" className="hover:text-blue-400 transition-colors">Privacy Policy</Link></li>
            </ul>
          </div> */}

          {/* Contact */}
          <div>
            <h3 className="text-white font-bold mb-6">Contact Us</h3>
            <ul className="space-y-4 text-sm">
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-blue-500 shrink-0" />
                <span>12 Al-Adab Group Of Schools, Gbede-Ogun, Off Akanran Rd., Ibadan.</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-blue-500 shrink-0" />
                <span>+234 906 433 0233</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-blue-500 shrink-0" />
                <span>aladab008@gmail.com</span>
              </li>
            </ul>
          </div>

        </div>

        <div className="border-t border-slate-900 pt-500 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-500">
          <p>&copy; {new Date().getFullYear()} Al-Adab School. All rights reserved.</p>
          {/* <div className="flex gap-6">
            <Link href="#" className="hover:text-white transition-colors">Terms</Link>
            <Link href="#" className="hover:text-white transition-colors">Privacy</Link>
            <Link href="#" className="hover:text-white transition-colors">Cookies</Link>
          </div> */}
        </div>
      </div>
    </footer>
  )
}