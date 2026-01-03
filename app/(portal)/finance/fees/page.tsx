import { createClient } from '@/utils/supabase/server'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import FeeManager from './FeeManager' // 👈 Use the new component

export default async function FeeSetupPage() {
  const supabase = await createClient()

  // 1. Fetch Data
  const { data: classes } = await supabase.from('classes').select('id, name').order('name')
  
  const { data: fees } = await supabase
    .from('fee_structures')
    .select('*, classes(name), academic_sessions(name)')
    .order('created_at', { ascending: false })

  const { data: session } = await supabase
    .from('academic_sessions')
    .select('*')
    .eq('is_current', true)
    .single()

  return (
    <div className="max-w-6xl mx-auto pb-20">
      
      <div className="flex items-center gap-4 mb-8">
        <Link href="/finance" className="p-2 hover:bg-slate-100 rounded-full text-slate-500">
          <ArrowLeft className="w-6 h-6" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Fee Configuration</h1>
          <p className="text-slate-500">
            Set fees for the <span className="font-bold text-blue-600">{session?.name || 'Current'}</span> session.
          </p>
        </div>
      </div>

      <FeeManager classes={classes || []} fees={fees || []} />

    </div>
  )
}