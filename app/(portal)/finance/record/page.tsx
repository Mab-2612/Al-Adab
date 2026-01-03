import { createClient } from '@/utils/supabase/server'
import { recordPayment } from '../actions'
import { ArrowLeft, CheckCircle, CreditCard, User, Calendar } from 'lucide-react'
import Link from 'next/link'
import { redirect } from 'next/navigation'

export default async function RecordPaymentPage() {
  const supabase = await createClient()

  // 1. Fetch Students
  const { data: students } = await supabase
    .from('students')
    .select('id, admission_number, profiles:student_profile_link(first_name, last_name)')
    .order('admission_number')

  // 2. Fetch Active Session & Term (For Display Only)
  const { data: session } = await supabase
    .from('academic_sessions')
    .select('name, current_term')
    .eq('is_current', true)
    .single()
  
  const currentTerm = session?.current_term || '1st Term'

  // 3. Fetch Fee Types (To show hints)
  const { data: fees } = await supabase
    .from('fee_structures')
    .select('amount, description, term, classes(name)')
    .eq('term', currentTerm) // Only show fees for CURRENT term
    .order('classes(name)')

  return (
    <div className="max-w-2xl mx-auto pb-20">
      
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link href="/finance" className="p-2 hover:bg-slate-100 rounded-full text-slate-500">
          <ArrowLeft className="w-6 h-6" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Record Payment</h1>
          <p className="text-slate-500">Manually log a cash or transfer transaction.</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        
        {/* Visual Header */}
        <div className="bg-slate-50 p-6 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
               <CreditCard className="w-5 h-5" />
             </div>
             <div>
               <h3 className="font-bold text-slate-900">New Transaction</h3>
               <p className="text-xs text-slate-500">Bursary Department</p>
             </div>
          </div>
          <div className="text-right">
             <p className="text-xs text-slate-400 uppercase font-semibold">Date</p>
             <p className="text-sm font-medium text-slate-700">{new Date().toLocaleDateString()}</p>
          </div>
        </div>

        <form action={async (formData) => {
            'use server'
            await recordPayment(formData)
            redirect('/finance')
        }} className="p-8 space-y-6">

          {/* Student Selector */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Select Student</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
              <select name="studentId" required className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                <option value="">Choose a student...</option>
                {students?.map((s: any) => (
                  <option key={s.id} value={s.id}>
                    {s.profiles?.first_name} {s.profiles?.last_name} ({s.admission_number})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            {/* Term Display (Locked) */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Payment For</label>
              <div className="w-full p-3 border border-slate-200 bg-slate-50 rounded-lg text-slate-600 font-medium flex items-center gap-2">
                <Calendar className="w-4 h-4 text-slate-400" />
                {currentTerm}
              </div>
            </div>

            {/* Payment Method */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Method</label>
              <select name="method" required className="w-full p-3 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                <option value="transfer">Bank Transfer</option>
                <option value="cash">Cash</option>
                <option value="pos">POS Terminal</option>
              </select>
            </div>
          </div>

          {/* Amount Input */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Amount Paid (₦)</label>
            <input 
              name="amount" 
              type="number" 
              required 
              placeholder="0.00" 
              className="w-full p-4 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 font-mono text-xl"
            />
            {/* Helper Hints */}
            <div className="mt-3 flex flex-wrap gap-2">
              {fees?.slice(0, 4).map((fee: any, idx: number) => (
                 <span key={idx} className="text-[10px] bg-blue-50 text-blue-700 px-2 py-1 rounded border border-blue-100">
                   {fee.classes?.name}: ₦{fee.amount.toLocaleString()}
                 </span>
              ))}
            </div>
          </div>

          {/* Remark */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Remark / Note</label>
            <input 
              name="remark" 
              type="text" 
              placeholder="e.g. Paid by Uncle via Zenith Bank" 
              className="w-full p-3 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <button type="submit" className="w-full py-4 bg-slate-900 text-white rounded-xl font-bold text-lg hover:bg-slate-800 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-slate-900/10 mt-4">
            <CheckCircle className="w-6 h-6" />
            Confirm Payment
          </button>

        </form>
      </div>
    </div>
  )
}