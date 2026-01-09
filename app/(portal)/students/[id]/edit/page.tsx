'use client'

import { createClient } from '@/utils/supabase/client'
import { updateStudent, generateStudentLogin, getStudentLoginEmail } from '../../actions' // 👈 Import new action
import { ArrowLeft, Save, Loader2, KeyRound, RefreshCcw, Copy, Check } from 'lucide-react'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { useEffect, useState, use } from 'react'
import { toast } from 'sonner'

export default function EditStudentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [student, setStudent] = useState<any>(null)
  const [classes, setClasses] = useState<any[]>([])
  const [isSenior, setIsSenior] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isResetting, setIsResetting] = useState(false)
  const [loading, setLoading] = useState(true)
  const [loginEmail, setLoginEmail] = useState<string | null>(null) // 👈 State for login email
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      const supabase = createClient()
      
      const { data: sData } = await supabase
        .from('students')
        .select(`*, profiles:student_profile_link (*), classes (id, name, section)`)
        .eq('id', id)
        .single()
      
      const { data: cData } = await supabase.from('classes').select('id, name, section').order('name')
      
      if (sData) {
        setStudent(sData)
        setClasses(cData || [])
        if (sData.classes?.name.includes('SSS') || sData.classes?.section?.includes('Senior')) {
          setIsSenior(true)
        }
        
        // 👇 Fetch the actual Auth Email
        const email = await getStudentLoginEmail(sData.profile_id)
        setLoginEmail(email)
      }
      setLoading(false)
    }
    fetchData()
  }, [id])

  const handleClassChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const classId = e.target.value
    const cls = classes.find(c => c.id === classId)
    if (cls && (cls.name.includes('SSS') || cls.section?.includes('Senior'))) {
      setIsSenior(true)
    } else {
      setIsSenior(false)
    }
  }

  const handleSubmit = async (formData: FormData) => {
    setIsSaving(true)
    const result = await updateStudent(student.id, student.profile_id, formData)
    if (result?.error) {
      setIsSaving(false)
      toast.error(result.error)
    }
  }

  const handleLoginReset = async () => {
    if(!confirm(`This will change the student's login email to an official '@aladab.ng' address and reset password to 'password123'. Continue?`)) return
    
    setIsResetting(true)
    const res = await generateStudentLogin(student.id, student.profile_id, student.admission_number)
    setIsResetting(false)

    if (res?.success) {
      toast.success(res.message)
      // Refresh the email display
      const email = await getStudentLoginEmail(student.profile_id)
      setLoginEmail(email)
    } else {
      toast.error(res?.error)
    }
  }

  const copyToClipboard = () => {
    if (loginEmail) {
      navigator.clipboard.writeText(loginEmail)
      setCopied(true)
      toast.success('Email copied to clipboard')
      setTimeout(() => setCopied(false), 2000)
    }
  }

  if (loading) return <div className="p-12 text-center text-slate-500">Loading student details...</div>
  if (!student) notFound()

  return (
    <div className="max-w-3xl mx-auto pb-20">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/students" className="p-2 hover:bg-slate-100 rounded-full text-slate-500">
          <ArrowLeft className="w-6 h-6" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Edit Student</h1>
          <p className="text-slate-500">Update records for {student.profiles?.first_name}.</p>
        </div>
      </div>

      <form action={handleSubmit} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 md:p-8 space-y-8">
          
          {/* ... Personal Info, Academic Info, Contact Info sections remain unchanged ... */}
          <div>
            <h3 className="text-lg font-semibold text-slate-900 mb-4 border-b pb-2">Personal Information</h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">First Name</label>
                <input name="firstName" defaultValue={student.profiles?.first_name} required className="w-full p-3 border border-slate-200 rounded-lg outline-none" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Other Names</label>
                <input name="lastName" defaultValue={student.profiles?.last_name} required className="w-full p-3 border border-slate-200 rounded-lg outline-none" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Gender</label>
                <select name="gender" defaultValue={student.gender} className="w-full p-3 border border-slate-200 rounded-lg outline-none bg-white">
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Date of Birth</label>
                <input name="dob" type="date" defaultValue={student.dob} className="w-full p-3 border border-slate-200 rounded-lg outline-none" />
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-slate-900 mb-4 border-b pb-2">Academic Details</h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Admission Number</label>
                <input name="admissionNumber" defaultValue={student.admission_number} required className="w-full p-3 border border-slate-200 rounded-lg outline-none font-mono" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Assign Class</label>
                <select name="classId" defaultValue={student.current_class_id} required onChange={handleClassChange} className="w-full p-3 border border-slate-200 rounded-lg outline-none bg-white">
                  {classes.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              {isSenior && (
                <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                  <label className="text-sm font-medium text-slate-700">Department</label>
                  <select name="department" defaultValue={student.department} required className="w-full p-3 border border-slate-200 rounded-lg outline-none bg-white focus:ring-2 focus:ring-purple-500">
                    <option value="">Select Department...</option>
                    <option value="Science">Science</option>
                    <option value="Arts">Arts</option>
                    <option value="Commercial">Commercial</option>
                  </select>
                </div>
              )}
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-slate-900 mb-4 border-b pb-2">Contact</h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Phone Number</label>
                <input name="phone" defaultValue={student.profiles?.phone_number} type="tel" className="w-full p-3 border border-slate-200 rounded-lg outline-none" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Guardian Email</label>
                <input name="email" defaultValue={student.profiles?.email} type="email" className="w-full p-3 border border-slate-200 rounded-lg outline-none text-slate-500" />
              </div>
            </div>
          </div>

          {/* 👇 NEW: Account Management Section */}
          <div className="bg-slate-50 p-5 rounded-lg border border-slate-200">
             <div className="flex items-center gap-2 mb-3">
               <KeyRound className="w-5 h-5 text-purple-600" />
               <h4 className="font-bold text-slate-800 text-base">Portal Login Credentials</h4>
             </div>

             <div className="mb-4">
               <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Current Login Email</label>
               <div className="flex gap-2">
                 <code className="bg-white px-3 py-2 rounded border border-slate-300 text-slate-700 font-mono text-sm flex-1">
                   {loginEmail || 'Loading...'}
                 </code>
                 <button 
                   type="button"
                   onClick={copyToClipboard}
                   className="p-2 bg-white border border-slate-300 rounded text-slate-500 hover:text-blue-600 hover:border-blue-500 transition-colors"
                   title="Copy Email"
                 >
                   {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                 </button>
               </div>
             </div>

             <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between border-t border-slate-200 pt-4">
               <p className="text-xs text-slate-500 max-w-sm">
                 Use this if the student forgot their email or needs to migrate to the new official format.
               </p>
               <button 
                 type="button" 
                 onClick={handleLoginReset}
                 disabled={isResetting}
                 className="text-xs font-bold text-white bg-purple-600 px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2 shadow-sm whitespace-nowrap"
               >
                 {isResetting ? <Loader2 className="w-3 h-3 animate-spin" /> : <RefreshCcw className="w-3 h-3" />}
                 Reset Login & Password
               </button>
             </div>
          </div>

        </div>

        <div className="bg-slate-50 p-6 flex justify-end gap-4 border-t border-slate-200">
          <Link href="/students" className="px-6 py-2.5 rounded-lg border border-slate-300 text-slate-700 font-medium hover:bg-slate-100">Cancel</Link>
          <button type="submit" disabled={isSaving} className="px-6 py-2.5 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 flex items-center gap-2">
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin"/> : <Save className="w-4 h-4" />}
            Update Student
          </button>
        </div>
      </form>
    </div>
  )
}