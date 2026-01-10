import Link from 'next/link'
import { ArrowRight, BookOpen, Star, Trophy, Users, Clock, Globe, Sparkles, ShieldCheck, MapPin, Newspaper } from 'lucide-react'
import Image from 'next/image'

export default function LandingPage() {
  return (
    <div className="bg-white text-slate-900 font-sans selection:bg-blue-100 selection:text-blue-900">
      
      {/* 1. HERO SECTION */}
      <section className="relative min-h-[95vh] flex items-center justify-center overflow-hidden pt-20">
        
        {/* Background Image with Blue Tint Overlay */}
        <div className="absolute inset-0 z-0">
          <Image 
            src="/Main.jpg" 
            alt="School Campus Background" 
            fill 
            className="object-cover"
            priority
          />
          {/* White gradient for clean text readability */}
          <div className="absolute inset-0 bg-gradient-to-b from-white/95 via-white/80 to-white"></div>
        </div>

        <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
          
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 border border-blue-100 text-blue-800 text-sm font-bold tracking-wide uppercase mb-8 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-1000">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-blue-600"></span>
            </span>
            <span>Admissions Open for 2024/2025</span>
          </div>

          <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tight mb-8 leading-[1.1] text-slate-900 animate-in fade-in zoom-in duration-1000 delay-100">
            Building Leaders <br />
            <span className="text-blue-600">With Character.</span>
          </h1>

          <p className="text-xl md:text-2xl text-slate-600 mb-10 max-w-2xl mx-auto leading-relaxed font-medium animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200">
            Al-Adab School blends academic excellence with moral upbringing. We raise students who excel in both knowledge and virtue.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300">
            <Link 
              href="/admissions/apply" 
              className="group relative px-8 py-4 bg-blue-600 text-white rounded-full font-bold text-lg overflow-hidden transition-all hover:bg-blue-700 shadow-xl shadow-blue-600/20 hover:scale-105"
            >
              <span className="relative z-10 flex items-center gap-2">
                Apply Now <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </span>
            </Link>
            
            <Link 
              href="/blog" 
              className="px-8 py-4 bg-white border-2 border-slate-200 text-slate-700 rounded-full font-bold text-lg hover:border-blue-600 hover:text-blue-600 transition-all flex items-center gap-2 justify-center"
            >
              <Newspaper className="w-5 h-5" />
              Read School News
            </Link>
          </div>

        </div>
      </section>

      {/* 2. STATS BANNER */}
      <div className="relative z-20 -mt-24 mx-4 md:mx-12">
        <div className="max-w-7xl mx-auto bg-blue-900 rounded-3xl p-8 md:p-12 shadow-2xl shadow-blue-900/20 text-white">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:divide-x divide-blue-800">
            {[
              { label: "Years of Legacy", value: "15+" },
              { label: "Active Students", value: "500+" },
              { label: "Expert Staff", value: "65+" },
              { label: "Exam Success", value: "90%" },
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <h3 className="text-4xl md:text-5xl font-black mb-2 text-white">{stat.value}</h3>
                <p className="text-sm md:text-base text-blue-200 uppercase tracking-widest font-bold">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 3. PRINCIPAL'S WELCOME */}
      <section className="py-24 bg-white relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="relative">
              <div className="absolute -top-4 -left-4 w-24 h-24 bg-blue-50 rounded-full z-0"></div>
              <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-slate-100 rounded-full z-0"></div>
              <div className="relative z-10 rounded-2xl overflow-hidden shadow-2xl rotate-2 hover:rotate-0 transition-all duration-500 border-4 border-white">
                {/* 👇 UPDATED: Changed src to local file path */}
                <Image 
                  src="/principal.jpg" 
                  alt="Principal" 
                  width={600} 
                  height={800} 
                  className="object-cover h-[500px] w-full"
                />
              </div>
            </div>
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 text-blue-600 font-bold uppercase tracking-widest text-sm">
                <span className="w-8 h-0.5 bg-blue-600"></span>
                Welcome Message
              </div>
              <h2 className="text-4xl md:text-5xl font-bold text-slate-900 leading-tight">Inspiring the Next Generation.</h2>
              <p className="text-lg text-slate-600 leading-relaxed">
                "At Al-Adab, education goes beyond the classroom. We believe in nurturing the whole child – heart, mind, and soul. Our curriculum is designed to challenge students academically while grounding them in strong moral values."
              </p>
              <div className="pt-4 border-l-4 border-blue-600 pl-4 bg-slate-50 rounded-r-lg p-4">
                <p className="font-bold text-xl text-slate-900">Mr. Yinus Aiwinnilomo</p>
                <p className="text-slate-500 font-medium">Principal</p>
              </div>
              <Link href="/about" className="inline-flex items-center text-blue-600 font-bold hover:text-blue-800 mt-4 transition-colors">
                Read Full Message <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 4. ACADEMIC PILLARS */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-blue-600 font-bold tracking-widest uppercase mb-4">Why Al-Adab?</h2>
            <h3 className="text-4xl md:text-5xl font-bold text-slate-900">A Complete Education</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Card 1: Blue Accent */}
            <div className="bg-white p-10 rounded-[2rem] shadow-sm hover:shadow-xl transition-all group border border-slate-100">
              <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mb-8 group-hover:bg-blue-600 transition-colors">
                <BookOpen className="w-8 h-8 text-blue-600 group-hover:text-white transition-colors" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-4">Western Education</h3>
              <p className="text-slate-600 leading-relaxed text-lg">
                Rigorous training in Sciences, Arts, and Commercial subjects preparing students for WAEC, NECO, and JAMB.
              </p>
            </div>

            {/* Card 2: Dark Blue Accent (Morals) */}
            <div className="bg-blue-900 p-10 rounded-[2rem] shadow-xl text-white transform md:-translate-y-4">
              <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mb-8 backdrop-blur-sm">
                <Star className="w-8 h-8 text-yellow-400" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Islamic Morals</h3>
              <p className="text-blue-100 leading-relaxed text-lg">
                Tahfeez (Memorization), Arabic language, and Fiqh integrated seamlessly into the daily timetable.
              </p>
            </div>

            {/* Card 3: Light Blue Accent */}
            <div className="bg-white p-10 rounded-[2rem] shadow-sm hover:shadow-xl transition-all group border border-slate-100">
              <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mb-8 group-hover:bg-blue-600 transition-colors">
                <Trophy className="w-8 h-8 text-blue-600 group-hover:text-white transition-colors" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-4">Vocational Skills</h3>
              <p className="text-slate-600 leading-relaxed text-lg">
                Practical skills in Coding, Robotics, Entrepreneurship, and Public Speaking for the modern world.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* 5. FACILITIES */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-8 flex flex-col justify-center">
              <h2 className="text-4xl md:text-5xl font-bold text-slate-900">
                World-Class <span className="text-blue-600">Facilities</span>
              </h2>
              <p className="text-lg text-slate-600 leading-relaxed">
                Our campus is designed to inspire creativity and learning. From modern laboratories to expansive sports fields, we provide the environment your child needs to thrive.
              </p>
              
              <ul className="space-y-4">
                {[
                  'Modern Science & Computer Labs',
                  'E-Library with 5,000+ books',
                  'Standard Sports Complex',
                  'Secure Boarding Facilities'
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-4 text-slate-700 font-medium text-lg">
                    <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center flex-shrink-0">
                      <ShieldCheck className="w-4 h-4" />
                    </div>
                    {item}
                  </li>
                ))}
              </ul>

              <div className="pt-4">
                <Link href="/gallery" className="text-blue-600 font-bold hover:text-blue-800 text-lg inline-flex items-center gap-2 group">
                  View School Gallery <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>

            <div className="relative h-[500px] rounded-3xl overflow-hidden shadow-2xl group">
              <Image 
                src="/school.jpg"
                alt="School Facilities" 
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-blue-900/80 to-transparent flex items-end p-8">
                <p className="text-white font-bold text-2xl">Modern Science Laboratories</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. CALL TO ACTION */}
      <section className="py-24 px-4 bg-slate-50">
        <div className="max-w-6xl mx-auto bg-blue-600 rounded-[3rem] overflow-hidden shadow-2xl shadow-blue-900/20 relative">
          
          {/* Abstract Shapes */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-black/10 rounded-full blur-3xl -ml-20 -mb-20"></div>

          <div className="relative z-10 py-24 px-6 text-center text-white">
            <h2 className="text-4xl md:text-6xl font-black mb-6 tracking-tight">
              Join the Al-Adab Family
            </h2>
            <p className="text-blue-100 text-xl mb-12 max-w-2xl mx-auto font-medium">
              Admissions are currently ongoing for JSS 1, JSS 2, and SSS 1. Secure a bright future for your child today.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                href="/admissions/apply" 
                className="px-10 py-5 bg-white text-blue-900 rounded-full font-bold text-xl hover:bg-blue-50 transition-colors shadow-lg"
              >
                Start Application
              </Link>
              <Link 
                href="/contact" 
                className="px-10 py-5 bg-blue-700 border border-blue-500 text-white rounded-full font-bold text-xl hover:bg-blue-800 transition-colors"
              >
                Contact Admissions
              </Link>
            </div>
          </div>
        </div>
      </section>

    </div>
  )
}