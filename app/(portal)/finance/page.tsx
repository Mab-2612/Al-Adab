import { createClient } from '@/utils/supabase/server'
import { Banknote, CreditCard, TrendingUp, Plus, FileText, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import InteractiveFeeList from './InteractiveFeeList'

// Helper for currency formatting
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(amount)
}

export default async function FinancePage() {
  const supabase = await createClient()

  // 1. Get Current Session
  const { data: session } = await supabase.from('academic_sessions').select('id').eq('is_current', true).single()
  const sessionId = session?.id

  // 2. Fetch Recent Payments
  const { data: recentPayments } = await supabase
    .from('payments')
    .select(`
      id,
      amount_paid,
      status,
      payment_date,
      term,
      students (
        admission_number,
        profiles:student_profile_link (first_name, last_name)
      )
    `)
    .eq('session_id', sessionId)
    .order('payment_date', { ascending: false })
    .limit(10)

  // 3. Fetch Active Fee Structures
  const { data: feeStructures } = await supabase
    .from('fee_structures')
    .select('*, classes(id, name)')
    .eq('session_id', sessionId)
    .order('amount', { ascending: false })

  const { data: classes } = await supabase.from('classes').select('id, name').order('name')

  // 4. Calculate Financials
  const { data: allPayments } = await supabase
    .from('payments')
    .select('amount_paid')
    .eq('session_id', sessionId)
    .eq('status', 'success')
  
  const totalCollected = allPayments?.reduce((sum, record) => sum + Number(record.amount_paid), 0) || 0

  const { data: students } = await supabase.from('students').select('current_class_id')
  
  let totalExpected = 0
  if (feeStructures && students) {
    feeStructures.forEach((fee: any) => {
      const studentCount = students.filter((s: any) => s.current_class_id === fee.class_id).length
      totalExpected += (Number(fee.amount) * studentCount)
    })
  }

  const totalPending = totalExpected - totalCollected

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-20">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Finance & Fees</h1>
          <p className="text-slate-500 mt-1">Track revenue, manage fee structures, and view transaction history.</p>
        </div>
        <div className="flex gap-3">
           <Link 
            href="/finance/fees"
            className="inline-flex items-center justify-center gap-2 bg-white text-slate-700 border border-slate-300 px-5 py-2.5 rounded-lg hover:bg-slate-50 font-medium transition-colors"
          >
            <FileText className="w-5 h-5" />
            <span>Fee Structure</span>
          </Link>
          <Link href="/finance/record">
            <button className="inline-flex items-center justify-center gap-2 bg-slate-900 text-white px-5 py-2.5 rounded-lg hover:bg-slate-800 transition-all font-medium shadow-lg shadow-slate-900/20 active:scale-95">
              <Plus className="w-5 h-5" />
              <span>Record Payment</span>
            </button>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* REVENUE CARD */}
        <div className="bg-blue-600 text-white p-6 rounded-2xl shadow-lg shadow-blue-900/20 relative overflow-hidden">
          <div className="relative z-10">
            <p className="text-blue-100 font-medium mb-1">Total Revenue</p>
            <h2 className="text-3xl font-bold">{formatCurrency(totalCollected)}</h2>
            <p className="text-xs text-blue-200 mt-2 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" /> 
              {totalExpected > 0 ? `${Math.round((totalCollected / totalExpected) * 100)}% of expected` : '0%'}
            </p>
          </div>
          {/* Naira Symbol Background */}
          <div className="absolute right-4 bottom-[-10px] text-9xl font-black text-blue-500 opacity-20 select-none leading-none">
            ₦
          </div>
        </div>

        {/* PENDING CARD */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
           <div className="relative z-10">
             <div className="flex items-center justify-between mb-4">
               <h3 className="font-semibold text-slate-700">Pending Fees</h3>
               <div className="p-2 bg-orange-100 text-orange-600 rounded-lg">
                 <CreditCard className="w-5 h-5" />
               </div>
             </div>
             <h2 className={`text-2xl font-bold ${totalPending > 0 ? 'text-red-600' : 'text-green-600'}`}>
               {formatCurrency(totalPending)}
             </h2>
             <p className="text-sm text-slate-500 mt-1">Outstanding student debts</p>
           </div>
        </div>

        {/* FEE STRUCTURES CARD */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
           <div className="flex items-center justify-between mb-4">
             <h3 className="font-semibold text-slate-700">Active Fee Types</h3>
             <div className="p-2 bg-purple-100 text-purple-600 rounded-lg">
               <FileText className="w-5 h-5" />
             </div>
           </div>
           <h2 className="text-2xl font-bold text-slate-900">{feeStructures?.length || 0}</h2>
           <p className="text-sm text-slate-500 mt-1">Classes with fees set</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        
        {/* Recent Transactions List */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex justify-between items-center">
            <h3 className="font-bold text-slate-900">Recent Transactions</h3>
            <span className="text-xs text-slate-500">Last 10 payments</span>
          </div>
          <div className="divide-y divide-slate-100">
            {recentPayments?.map((payment: any) => (
              <Link 
                key={payment.id} 
                href={`/finance/receipt/${payment.id}`} 
                className="block p-4 flex items-center justify-between hover:bg-slate-50 transition-colors cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-green-100 text-green-600 flex items-center justify-center group-hover:bg-green-200 transition-colors">
                    <Banknote className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-medium text-slate-900 text-sm group-hover:text-blue-600 transition-colors">
                      {payment.students?.profiles?.first_name} {payment.students?.profiles?.last_name}
                    </p>
                    <p className="text-xs text-slate-500">{new Date(payment.payment_date).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-slate-900 text-sm">{formatCurrency(payment.amount_paid)}</p>
                  <span className="text-[10px] text-blue-600 font-bold opacity-0 group-hover:opacity-100 transition-opacity">View Receipt &rarr;</span>
                </div>
              </Link>
            ))}
            
            {(!recentPayments || recentPayments.length === 0) && (
              <div className="p-8 text-center text-slate-500 text-sm">
                No transactions found.
              </div>
            )}
          </div>
        </div>

        {/* Fee Summary Panel */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex justify-between items-center">
             <h3 className="font-bold text-slate-900">Current Fee Structure</h3>
             <Link href="/finance/fees" className="text-blue-600 text-sm font-bold hover:underline flex items-center gap-1">
               Full Settings <ArrowRight className="w-4 h-4" />
             </Link>
          </div>
          
          {/* Interactive List (Handles Edit/Delete on Dashboard too) */}
          <InteractiveFeeList 
            fees={feeStructures || []} 
            classes={classes || []} 
          />
          
        </div>
      </div>
    </div>
  )
}