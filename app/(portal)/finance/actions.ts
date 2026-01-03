'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

// ... createFee, updateFee, deleteFee logic remains ...
export async function createFee(formData: FormData) {
  const supabase = await createClient()
  const classId = formData.get('classId') as string
  const term = formData.get('term') as string
  const amount = parseFloat((formData.get('amount') as string).replace(/,/g, ''))
  const description = formData.get('description') as string

  const { data: session } = await supabase.from('academic_sessions').select('id').eq('is_current', true).single()
  if (!session) return { error: 'No active academic session found.' }

  const { error } = await supabase.from('fee_structures').insert({
    class_id: classId,
    session_id: session.id,
    term: term,
    amount: amount,
    description: description
  })

  if (error) return { error: error.message }
  revalidatePath('/finance/fees')
  revalidatePath('/finance') 
  return { success: true, message: 'Fee added successfully' }
}

export async function updateFee(id: string, formData: FormData) {
  const supabase = await createClient()
  const classId = formData.get('classId') as string
  const term = formData.get('term') as string
  const amount = parseFloat((formData.get('amount') as string).replace(/,/g, ''))
  const description = formData.get('description') as string

  const { error } = await supabase
    .from('fee_structures')
    .update({ class_id: classId, term, amount, description })
    .eq('id', id)

  if (error) return { error: error.message }
  revalidatePath('/finance/fees')
  revalidatePath('/finance')
  return { success: true, message: 'Fee updated successfully' }
}

export async function deleteFee(feeId: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('fee_structures').delete().eq('id', feeId)
  if (error) return { error: error.message }
  revalidatePath('/finance/fees')
  return { success: true, message: 'Fee deleted successfully' }
}

// 👇 UPDATED: Record Payment (Locks Term & Revalidates)
export async function recordPayment(formData: FormData) {
  const supabase = await createClient()

  const studentId = formData.get('studentId') as string
  const amount = formData.get('amount') as string
  // Note: We ignore 'term' from formData now as we use system default
  
  // 1. Get Current Session AND Term
  const { data: session } = await supabase
    .from('academic_sessions')
    .select('id, current_term')
    .eq('is_current', true)
    .single()
  
  if (!session) return { error: 'No active session found.' }

  const reference = `RCP-${Date.now().toString().slice(-8)}`

  // 2. Insert Payment
  const { error } = await supabase
    .from('payments')
    .insert({
      student_id: studentId,
      session_id: session.id,
      term: session.current_term || '1st Term', // 👈 USE SYSTEM TERM
      amount_paid: parseFloat(amount),
      payment_reference: reference,
      status: 'success',
    })

  if (error) return { error: error.message }

  // 3. Force Refresh of Finance Dashboard
  revalidatePath('/finance') 
  return { success: true }
}