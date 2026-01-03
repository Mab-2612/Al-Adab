import { createClient } from '@/utils/supabase/server'
import { BookOpen, TrendingUp, CreditCard, Clock, CheckCircle } from 'lucide-react'
import Link from 'next/link'
import NoticeBoard from './NoticeBoard' // Ensure this is imported
import StudentTimetableWidget from './StudentTimetableWidget' // 👈 Import the new widget

const formatCurrency = (amount: number) => new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(amount)

export default async function StudentDashboard({ studentId }: { studentId: string }) {
  const supabase = await createClient()

  // 1. Fetch Student
  const { data: student } = await supabase.from('students').select('*, classes(id, name), profiles:student_profile_link(*)').eq('id', studentId).single()

  // 2. Fetch Stats (Attendance & Academics)
  const { count: totalDays } = await supabase.from('attendance').select('*', { count: 'exact', head: true }).eq('student_id', studentId)
  const { count: presentDays } = await supabase.from('attendance').select('*', { count: 'exact', head: true }).eq('student_id', studentId).eq('status', 'present')
  const attendanceRate = totalDays ? Math.round((presentDays! / totalDays) * 100) : 100
  
  const { count: subjectsTaken } = await supabase.from('results').select('*', { count: 'exact', head: true }).eq('student_id', studentId)

  // 3. Fetch Fees
  const { data: session } = await supabase.from('academic_sessions').select('id').eq('is_current', true).single()
  const { data: fees } = await supabase.from('fee_structures').select('amount').eq('class_id', student?.current_class_id).eq('session_id', session?.id)
  const totalPayable = fees?.reduce((sum, f) => sum + Number(f.amount), 0) || 0
  const { data: payments } = await supabase.from('payments').select('*').eq('student_id', studentId).eq('session_id', session?.id).eq('status', 'success').order('payment_date', { ascending: false })
  const totalPaid = payments?.reduce((sum, p) => sum + Number(p.amount_paid), 0) || 0
  const balance = totalPayable - totalPaid

  // 4. 👇 FETCH TIMETABLE
  const { data: timetable } = await supabase
    .from('timetables')
    .select('*, subjects(name)')
    .eq('class_id', student?.current_class_id)
    .order('start_time')

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-8 text-white shadow-lg">
        <h1 className="text-3xl font-bold mb-2">Welcome back, {student?.profiles?.first_name}! 👋</h1>
        <p className="text-blue-100 opacity-90">{student?.classes?.name} • {student?.admission_number}</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className={`p-3 rounded-full ${attendanceRate >= 80 ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-600'}`}><Clock className="w-6 h-6" /></div>
          <div><p className="text-slate-500 text-sm font-medium">Attendance</p><h3 className="text-2xl font-bold text-slate-900">{attendanceRate}%</h3></div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-purple-100 text-purple-600 rounded-full"><BookOpen className="w-6 h-6" /></div>
          <div><p className="text-slate-500 text-sm font-medium">Subjects</p><h3 className="text-2xl font-bold text-slate-900">{subjectsTaken || 0}</h3></div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className={`p-3 rounded-full ${balance <= 0 ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}><CreditCard className="w-6 h-6" /></div>
          <div><p className="text-slate-500 text-sm font-medium">Fee Balance</p><h3 className="text-2xl font-bold text-slate-900">{balance <= 0 ? 'Cleared' : formatCurrency(balance)}</h3></div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-3 gap-8">
        
        {/* Left Col: Timetable & Notices */}
        <div className="lg:col-span-2 space-y-8">
           
           <div className="grid md:grid-cols-2 gap-6">
              {/* 👇 TIMETABLE WIDGET */}
              <StudentTimetableWidget timetable={timetable || []} />
              
              {/* NOTICE BOARD */}
              <NoticeBoard role="student" />
           </div>

           {/* Quick Actions */}
           <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:border-blue-500 transition-colors group cursor-pointer">
              <Link href={`/results/student/${studentId}`} className="flex items-center justify-between">
                <div>
                   <h3 className="font-bold text-slate-900 text-lg group-hover:text-blue-600 transition-colors">Check Results</h3>
                   <p className="text-slate-500 text-sm">View and print your report cards.</p>
                </div>
                <div className="p-3 bg-blue-50 rounded-full text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all">
                   <TrendingUp className="w-5 h-5" />
                </div>
              </Link>
           </div>

        </div>

        {/* Right Col: Payment History */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden h-full">
            <div className="p-6 border-b border-slate-100"><h3 className="font-bold text-slate-900">Payment History</h3></div>
            <div className="divide-y divide-slate-100 max-h-[500px] overflow-y-auto custom-scrollbar">
              {payments?.map((pay) => (
                <div key={pay.id} className="p-4 flex justify-between items-center hover:bg-slate-50">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-green-100 text-green-600 flex items-center justify-center"><CheckCircle className="w-4 h-4" /></div>
                    <div><p className="text-sm font-bold text-slate-900">{pay.term}</p><p className="text-xs text-slate-500">{new Date(pay.payment_date).toLocaleDateString()}</p></div>
                  </div>
                  <span className="font-mono font-bold text-slate-700">{formatCurrency(pay.amount_paid)}</span>
                </div>
              ))}
              {payments?.length === 0 && <div className="p-8 text-center text-slate-400 text-sm">No payments recorded.</div>}
            </div>
            <div className="bg-slate-50 p-4 flex justify-between items-center text-sm border-t border-slate-200">
               <span className="text-slate-500">Total Paid:</span>
               <span className="font-bold text-slate-900">{formatCurrency(totalPaid)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}