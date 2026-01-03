// app/(portal)/students/[id]/page.tsx

import { createClient } from '@/utils/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Edit, Mail, Phone, Calendar, User, BookOpen } from 'lucide-react'

// 👇 FIX: Update the props type to be a Promise
export default async function StudentProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient()

  // 👇 FIX: Await the params before using them
  const { id } = await params

  // Fetch single student with profile and class
  const { data: student } = await supabase
    .from('students')
    .select(`
      *,
      profiles:student_profile_link (*),
      classes (name)
    `)
    .eq('id', id) // Use the awaited 'id'
    .single()

  if (!student) {
    notFound()
  }

  return (
    <div className="max-w-4xl mx-auto pb-20">
      
      {/* Header / Back Button */}
      <div className="flex items-center justify-between mb-6">
        <Link href="/students" className="flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors">
          <ArrowLeft className="w-5 h-5" />
          <span className="font-medium">Back to Students</span>
        </Link>
        <Link 
          href={`/students/${student.id}/edit`}
          className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors text-sm font-medium"
        >
          <Edit className="w-4 h-4" /> Edit Profile
        </Link>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        
        {/* Left Column: ID Card */}
        <div className="md:col-span-1 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col items-center text-center">
             <div className="w-24 h-24 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-3xl font-bold mb-4">
                {student.profiles?.first_name?.[0]}{student.profiles?.last_name?.[0]}
             </div>
             <h1 className="text-xl font-bold text-slate-900">
               {student.profiles?.first_name} {student.profiles?.last_name}
             </h1>
             <p className="text-slate-500 text-sm mt-1">{student.admission_number}</p>
             <div className="mt-4 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-bold uppercase tracking-wide border border-blue-100">
               {student.classes?.name || 'Unassigned'}
             </div>
          </div>

          {/* Quick Contact */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Contact Info</h3>
            
            <div className="flex items-center gap-3 text-slate-700">
              <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-500">
                <Phone className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-slate-500">Phone</p>
                <p className="text-sm font-medium truncate">{student.profiles?.phone_number || 'N/A'}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 text-slate-700">
               <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-500">
                <Mail className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-slate-500">Email</p>
                <p className="text-sm font-medium truncate">{student.profiles?.email || 'N/A'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Detailed Stats */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <h2 className="text-lg font-bold text-slate-900 mb-4">Student Details</h2>
            
            <div className="grid sm:grid-cols-2 gap-y-6 gap-x-8">
              <div>
                <div className="flex items-center gap-2 text-slate-400 mb-1">
                  <User className="w-4 h-4" />
                  <span className="text-xs font-semibold uppercase">Gender</span>
                </div>
                <p className="text-slate-900 font-medium capitalize">{student.gender}</p>
              </div>

              <div>
                <div className="flex items-center gap-2 text-slate-400 mb-1">
                  <Calendar className="w-4 h-4" />
                  <span className="text-xs font-semibold uppercase">Date of Birth</span>
                </div>
                <p className="text-slate-900 font-medium">{student.dob || 'Not set'}</p>
              </div>

              <div>
                <div className="flex items-center gap-2 text-slate-400 mb-1">
                  <BookOpen className="w-4 h-4" />
                  <span className="text-xs font-semibold uppercase">Current Term</span>
                </div>
                <p className="text-slate-900 font-medium">1st Term (2024/2025)</p>
              </div>
            </div>
          </div>
          
          {/* Results Section */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
             <div className="flex items-center justify-between mb-4">
               <h2 className="text-lg font-bold text-slate-900">Academic Results</h2>
               <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-bold uppercase">1st Term</span>
             </div>
             
             <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 mb-4">
               <p className="text-sm text-slate-600 mb-2">Check the full report card for the current term.</p>
               <div className="flex gap-2">
                 <Link 
                   href={`/results/student/${student.id}?term=1st Term`}
                   className="flex-1 py-2 bg-blue-600 text-white text-sm font-bold rounded-lg text-center hover:bg-blue-700 transition-colors"
                 >
                   View Report Sheet
                 </Link>
               </div>
             </div>
          </div>
        </div>

      </div>
    </div>
  )
}