import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import StudentDashboard from '@/components/dashboard/StudentDashboard'
import TeacherDashboard from '@/components/dashboard/TeacherDashboard'
import NoticeBoard from '@/components/dashboard/NoticeBoard'
import { Users, DollarSign, Bell, GraduationCap, AlertCircle, ShieldAlert } from 'lucide-react'
import Link from 'next/link'

// Helper for currency formatting
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(amount)
}

// --- ADMIN DASHBOARD COMPONENT ---
async function AdminDashboard({ profile, supabase }: { profile: any, supabase: any }) {
  let studentCount = 0
  let teacherCount = 0
  let totalRevenue = 0
  let errorMsg = null

  try {
    const [studentsRes, teachersRes, paymentsRes] = await Promise.all([
      supabase.from('students').select('*', { count: 'exact', head: true }),
      supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'teacher'),
      supabase.from('payments').select('amount_paid').eq('status', 'success')
    ])

    studentCount = studentsRes.count || 0
    teacherCount = teachersRes.count || 0
    totalRevenue = paymentsRes.data?.reduce((sum: number, record: any) => sum + Number(record.amount_paid), 0) || 0

  } catch (err) {
    console.error("Dashboard Fetch Error:", err)
    errorMsg = "Some data could not be loaded."
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-500">Overview for <span className="font-semibold text-blue-600 capitalize">{profile?.first_name || 'Admin'}</span></p>
        </div>
        <div className="flex gap-3">
          <button className="p-2 bg-white border border-gray-200 rounded-lg text-gray-600 relative"><Bell className="w-5 h-5" /></button>
        </div>
      </div>

      {errorMsg && <div className="p-4 bg-red-50 text-red-600 rounded-lg text-sm">{errorMsg}</div>}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
           <div className="flex justify-between items-center mb-4"><h3 className="text-sm font-medium text-gray-500">Total Students</h3><Users className="w-5 h-5 text-blue-600" /></div>
           <div className="text-3xl font-bold text-gray-900">{studentCount}</div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
           <div className="flex justify-between items-center mb-4"><h3 className="text-sm font-medium text-gray-500">Total Teachers</h3><GraduationCap className="w-5 h-5 text-purple-600" /></div>
           <div className="text-3xl font-bold text-gray-900">{teacherCount}</div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
           <div className="flex justify-between items-center mb-4"><h3 className="text-sm font-medium text-gray-500">Total Revenue</h3><span className="text-xl font-bold text-green-600">₦</span></div>
           <div className="text-3xl font-bold text-gray-900">{formatCurrency(totalRevenue)}</div>
        </div>
      </div>
      
      {/* Content */}
      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
           <div className="p-4 bg-yellow-50 border-l-4 border-yellow-400 text-yellow-800 rounded-r-lg flex justify-between items-center">
            <div><p className="font-bold">System Status</p><p className="text-sm">Admissions are currently OPEN.</p></div>
            <Link href="/admissions-portal" className="text-sm font-bold underline hover:text-yellow-900">Applications</Link>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
             <h3 className="font-bold text-gray-900 mb-4">Quick Actions</h3>
             <div className="grid grid-cols-2 gap-4">
                <Link href="/students/new" className="p-4 bg-slate-50 hover:bg-blue-50 rounded-lg text-center transition-colors"><p className="font-bold text-slate-700 text-sm">Add Student</p></Link>
                <Link href="/finance/record" className="p-4 bg-slate-50 hover:bg-green-50 rounded-lg text-center transition-colors"><p className="font-bold text-slate-700 text-sm">Record Payment</p></Link>
             </div>
          </div>
        </div>
        <div className="lg:col-span-1"><NoticeBoard role="admin" /></div>
      </div>
    </div>
  )
}

// --- MAIN CONTROLLER ---
export default async function Dashboard() {
  const supabase = await createClient()

  // 👇 AUTH CHECK MOVED HERE (Before try block)
  // This allows the redirect exception to bubble up correctly to Next.js
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }
  
  try {
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()
    
    if (!profile) return <div className="p-12 text-center text-slate-500">Profile not found. Contact support.</div>

    // 1. TEACHER VIEW
    if (profile.role === 'teacher') {
      return <TeacherDashboard userId={user.id} profile={profile} />
    }

    // 2. STUDENT VIEW
    if (profile.role === 'student') {
      const { data: studentRecord } = await supabase.from('students').select('id').eq('profile_id', user.id).single()
      if (studentRecord) return <StudentDashboard studentId={studentRecord.id} />
      return <div className="p-8 text-red-500">Error: Student record not found for this user.</div>
    }

    // 3. ADMIN VIEW
    if (profile.role === 'admin') {
      return <AdminDashboard profile={profile} supabase={supabase} />
    }

    // 4. UNKNOWN ROLE
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center text-slate-500">
        <ShieldAlert className="w-12 h-12 mb-4 text-red-500" />
        <h3 className="text-xl font-bold text-slate-900">Access Denied</h3>
        <p>Your account does not have a valid role assigned.</p>
      </div>
    )

  } catch (error) {
    console.error("Dashboard Logic Error:", error)
    return <div className="p-8 text-center text-red-500">System Error. Please try refreshing.</div>
  }
}